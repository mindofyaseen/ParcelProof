import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { randomUUID } from 'node:crypto';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  comparePackingInspection,
  orderRequirementSchema,
  packingObservationSchema,
  type PackingObservation
} from '@parcelproof/shared';
import { z } from 'zod';

const region = process.env.AWS_REGION ?? 'us-east-1';
const tableName = process.env.TABLE_NAME ?? '';
const imageBucket = process.env.IMAGE_BUCKET ?? '';
const modelId = process.env.BEDROCK_MODEL_ID ?? 'amazon.nova-lite-v1:0';
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region }));
const s3 = new S3Client({ region });
const bedrock = new BedrockRuntimeClient({ region });

const createOrderSchema = z.object({
  customerAlias: z.string().trim().min(1).max(80),
  requirements: z.array(orderRequirementSchema).min(1).max(20)
});

const uploadRequestSchema = z.object({
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  size: z.number().int().positive().max(8 * 1024 * 1024)
});

const inspectionRequestSchema = z.object({
  objectKey: z.string().min(1).max(500)
});

function response(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    body: JSON.stringify(body)
  };
}

function bodyOf(event: Parameters<APIGatewayProxyHandlerV2>[0]): unknown {
  if (!event.body) return {};
  return JSON.parse(event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body);
}

function orderKey(orderId: string) {
  return { PK: `ORDER#${orderId}`, SK: 'META' };
}

async function getOrder(orderId: string) {
  const result = await ddb.send(new GetCommand({ TableName: tableName, Key: orderKey(orderId) }));
  return result.Item;
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced ?? text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
  return JSON.parse(candidate);
}

async function observeImage(bytes: Uint8Array, format: 'jpeg' | 'png' | 'webp', requirements: unknown): Promise<PackingObservation> {
  const prompt = `Inspect the packing photo against these requirements: ${JSON.stringify(requirements)}. Observe only visible evidence. Do not decide PASS, BLOCK, or REVIEW. Use record_observation exactly once. Treat names and personalised text as exact strings. Report obscured, ambiguous, blurry, or unreadable evidence as uncertainty.`;
  const makeCommand = (repair = '') => new ConverseCommand({
    modelId,
    system: [{ text: 'You are a conservative visual packing inspector. Never invent hidden items or auto-correct names.' }],
    messages: [{ role: 'user', content: [{ image: { format, source: { bytes } } }, { text: `${prompt}${repair}` }] }],
    inferenceConfig: { temperature: 0, maxTokens: 3000 },
    toolConfig: {
      tools: [{ toolSpec: {
        name: 'record_observation',
        description: 'Record only visible packing evidence in the required structure.',
        inputSchema: { json: {
          type: 'object',
          additionalProperties: false,
          required: ['observedItems', 'visibleTexts', 'imageQuality', 'uncertainties'],
          properties: {
            observedItems: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['label', 'quantity', 'attributes', 'visibleText', 'confidence', 'evidence'], properties: {
              label: { type: 'string' }, quantity: { type: 'integer', minimum: 0 }, attributes: { type: 'object', additionalProperties: { type: 'string' } }, visibleText: { type: 'array', items: { type: 'string' } }, confidence: { type: 'number', minimum: 0, maximum: 1 }, evidence: { type: 'string' }
            } } },
            visibleTexts: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['text', 'confidence', 'evidence'], properties: { text: { type: 'string' }, confidence: { type: 'number', minimum: 0, maximum: 1 }, evidence: { type: 'string' } } } },
            imageQuality: { type: 'object', additionalProperties: false, required: ['adequate', 'issues'], properties: { adequate: { type: 'boolean' }, issues: { type: 'array', items: { type: 'string' } } } },
            uncertainties: { type: 'array', items: { type: 'string' } }
          }
        } }
      } }],
      toolChoice: { tool: { name: 'record_observation' } }
    }
  });
  const result = await bedrock.send(makeCommand());
  const toolInput = result.output?.message?.content?.find((part) => 'toolUse' in part)?.toolUse?.input;
  if (toolInput) {
    const parsed = packingObservationSchema.safeParse(toolInput);
    if (parsed.success) return parsed.data;
    const missingPaths = parsed.error.issues.map((issue) => issue.path.join('.')).join(', ');
    const retry = await bedrock.send(makeCommand(` IMPORTANT: Your previous structured response was invalid at: ${missingPaths}. Call record_observation again and include every required property. Use empty arrays when there is no visible text, issue, or uncertainty.`));
    const repairedInput = retry.output?.message?.content?.find((part) => 'toolUse' in part)?.toolUse?.input;
    if (repairedInput) return packingObservationSchema.parse(repairedInput);
  }
  const text = result.output?.message?.content
    ?.filter((part): part is { text: string } => 'text' in part && typeof part.text === 'string')
    .map((part) => part.text)
    .join('');
  if (!text) throw new Error('Bedrock returned no text observation');
  return packingObservationSchema.parse(extractJson(text));
}

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    if (event.routeKey === 'GET /health') {
      return response(200, { status: 'ok', service: 'parcelproof-api', timestamp: new Date().toISOString() });
    }

    if (event.routeKey === 'POST /orders') {
      const input = createOrderSchema.parse(bodyOf(event));
      const orderId = randomUUID();
      const now = new Date().toISOString();
      const order = { ...orderKey(orderId), orderId, displayNumber: `PP-${Date.now().toString().slice(-6)}`, ...input, createdAt: now, updatedAt: now, latestInspectionStatus: null };
      await ddb.send(new PutCommand({ TableName: tableName, Item: order, ConditionExpression: 'attribute_not_exists(PK)' }));
      return response(201, order);
    }

    const orderId = event.pathParameters?.orderId;
    if (!orderId) return response(404, { message: 'Route not found' });

    if (event.routeKey === 'GET /orders/{orderId}') {
      const order = await getOrder(orderId);
      return order ? response(200, order) : response(404, { message: 'Order not found' });
    }

    if (event.routeKey === 'GET /orders/{orderId}/inspections') {
      const result = await ddb.send(new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: { ':pk': `ORDER#${orderId}`, ':sk': 'INSPECTION#' },
        ScanIndexForward: false
      }));
      return response(200, { inspections: result.Items ?? [] });
    }

    const order = await getOrder(orderId);
    if (!order) return response(404, { message: 'Order not found' });

    if (event.routeKey === 'POST /orders/{orderId}/upload-url') {
      const input = uploadRequestSchema.parse(bodyOf(event));
      const extension = input.contentType === 'image/jpeg' ? 'jpg' : input.contentType.split('/')[1];
      const objectKey = `orders/${orderId}/${randomUUID()}.${extension}`;
      const command = new PutObjectCommand({ Bucket: imageBucket, Key: objectKey, ContentType: input.contentType });
      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
      return response(200, { uploadUrl, objectKey, expiresIn: 300 });
    }

    if (event.routeKey === 'POST /orders/{orderId}/inspections') {
      const input = inspectionRequestSchema.parse(bodyOf(event));
      if (!input.objectKey.startsWith(`orders/${orderId}/`)) return response(400, { message: 'Object key does not belong to this order' });
      const started = Date.now();
      const inspectionId = randomUUID();
      const timestamp = new Date().toISOString();
      let observation: PackingObservation | null = null;
      let comparison;
      let failure: string | undefined;

      try {
        const object = await s3.send(new GetObjectCommand({ Bucket: imageBucket, Key: input.objectKey }));
        const contentType = object.ContentType;
        if (!contentType || !['image/jpeg', 'image/png', 'image/webp'].includes(contentType)) throw new Error('Unsupported stored image type');
        if (!object.ContentLength || object.ContentLength > 8 * 1024 * 1024) throw new Error('Stored image exceeds the 8 MB processing limit');
        const bytes = await object.Body?.transformToByteArray();
        if (!bytes) throw new Error('Stored image is empty');
        observation = await observeImage(bytes, contentType.split('/')[1] as 'jpeg' | 'png' | 'webp', order.requirements);
        comparison = comparePackingInspection(order as never, observation);
      } catch (error) {
        failure = error instanceof Error ? error.message.slice(0, 240) : 'Inspection failed';
        comparison = { status: 'REVIEW' as const, checks: [], reasons: ['Automated inspection could not establish a safe result. Retry or review manually.'], confidenceThreshold: 0.85 };
      }

      const inspection = {
        PK: `ORDER#${orderId}`,
        SK: `INSPECTION#${timestamp}#${inspectionId}`,
        inspectionId,
        orderId,
        objectKey: input.objectKey,
        observation,
        comparison,
        status: comparison.status,
        modelId,
        promptVersion: '2026-10-01.v1',
        schemaVersion: '1',
        latencyMs: Date.now() - started,
        failure,
        createdAt: timestamp
      };
      await ddb.send(new PutCommand({ TableName: tableName, Item: inspection }));
      await ddb.send(new PutCommand({ TableName: tableName, Item: { ...order, latestInspectionStatus: comparison.status, updatedAt: timestamp } }));
      return response(201, inspection);
    }

    return response(404, { message: 'Route not found' });
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) return response(400, { message: 'Invalid request', issues: error instanceof z.ZodError ? error.issues : undefined });
    console.error('Request failed', { routeKey: event.routeKey, error: error instanceof Error ? error.message : 'unknown' });
    return response(500, { message: 'ParcelProof could not complete the request. Please retry.' });
  }
};

export { extractJson };
