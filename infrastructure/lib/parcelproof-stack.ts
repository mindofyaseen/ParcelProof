import { Duration, RemovalPolicy, Stack, Tags, type StackProps } from 'aws-cdk-lib';
import { CfnStage, HttpApi, CorsHttpMethod, HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Distribution, PriceClass, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { AttributeType, BillingMode, Table, TableEncryption } from 'aws-cdk-lib/aws-dynamodb';
import { Architecture, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { BlockPublicAccess, Bucket, BucketEncryption, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { CfnOutput } from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import { join } from 'node:path';

const repositoryRoot = process.cwd();

export class ParcelProofStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    Tags.of(this).add('Project', 'ParcelProof');
    Tags.of(this).add('Hackathon', 'ZeroToShipped');
    Tags.of(this).add('Environment', 'prod');

    const siteBucket = new Bucket(this, 'SiteBucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.RETAIN
    });

    const imageBucket = new Bucket(this, 'ImageBucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      lifecycleRules: [{ expiration: Duration.days(14) }],
      cors: [{
        allowedMethods: [HttpMethods.PUT],
        allowedOrigins: ['*'],
        allowedHeaders: ['content-type'],
        maxAge: 300
      }],
      removalPolicy: RemovalPolicy.RETAIN
    });

    const table = new Table(this, 'ParcelProofTable', {
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
      encryption: TableEncryption.AWS_MANAGED,
      removalPolicy: RemovalPolicy.RETAIN
    });

    const apiFunction = new NodejsFunction(this, 'ApiFunction', {
      entry: join(repositoryRoot, 'apps/api/src/router.ts'),
      handler: 'handler',
      runtime: Runtime.NODEJS_22_X,
      architecture: Architecture.ARM_64,
      memorySize: 1024,
      timeout: Duration.seconds(60),
      tracing: Tracing.ACTIVE,
      logRetention: 14,
      environment: {
        TABLE_NAME: table.tableName,
        IMAGE_BUCKET: imageBucket.bucketName,
        BEDROCK_MODEL_ID: 'amazon.nova-lite-v1:0'
      },
      bundling: { minify: true, sourceMap: true }
    });
    table.grantReadWriteData(apiFunction);
    imageBucket.grantReadWrite(apiFunction);
    apiFunction.addToRolePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['bedrock:InvokeModel'],
      resources: [`arn:${this.partition}:bedrock:${this.region}::foundation-model/amazon.nova-lite-v1:0`]
    }));

    const api = new HttpApi(this, 'Api', {
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.POST],
        allowHeaders: ['content-type']
      }
    });
    const defaultStage = api.defaultStage?.node.defaultChild as CfnStage | undefined;
    if (defaultStage) defaultStage.defaultRouteSettings = { throttlingBurstLimit: 20, throttlingRateLimit: 10 };

    api.addRoutes({
      path: '/health',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration('ApiIntegration', apiFunction)
    });

    const integration = new HttpLambdaIntegration('WorkflowIntegration', apiFunction);
    for (const [path, methods] of [
      ['/orders', [HttpMethod.POST]],
      ['/orders/{orderId}', [HttpMethod.GET]],
      ['/orders/{orderId}/upload-url', [HttpMethod.POST]],
      ['/orders/{orderId}/inspections', [HttpMethod.POST, HttpMethod.GET]]
    ] as const) {
      api.addRoutes({ path, methods: [...methods], integration });
    }

    const distribution = new Distribution(this, 'Distribution', {
      defaultRootObject: 'index.html',
      priceClass: PriceClass.PRICE_CLASS_100,
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(siteBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS
      },
      errorResponses: [
        { httpStatus: 403, responseHttpStatus: 200, responsePagePath: '/index.html', ttl: Duration.minutes(1) },
        { httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html', ttl: Duration.minutes(1) }
      ]
    });

    new BucketDeployment(this, 'DeploySite', {
      sources: [
        Source.asset(join(repositoryRoot, 'apps/web/dist')),
        Source.jsonData('config.json', { apiUrl: api.apiEndpoint })
      ],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ['/*']
    });

    new CfnOutput(this, 'SiteUrl', { value: `https://${distribution.domainName}` });
    new CfnOutput(this, 'ApiUrl', { value: api.apiEndpoint });
    new CfnOutput(this, 'HealthUrl', { value: `${api.apiEndpoint}/health` });
    new CfnOutput(this, 'ImageBucketName', { value: imageBucket.bucketName });
    new CfnOutput(this, 'TableName', { value: table.tableName });
  }
}
