import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { describe, expect, it } from 'vitest';
import { ParcelProofStack } from '../lib/parcelproof-stack.js';

function template(): Template {
  const app = new App();
  return Template.fromStack(new ParcelProofStack(app, 'TestStack'));
}

describe('ParcelProof infrastructure', () => {
  it('keeps both S3 buckets private and encrypted', () => {
    const synthesized = template();
    synthesized.resourceCountIs('AWS::S3::Bucket', 2);
    synthesized.allResourcesProperties('AWS::S3::Bucket', {
      BucketEncryption: Match.objectLike({
        ServerSideEncryptionConfiguration: Match.arrayWith([
          Match.objectLike({ ServerSideEncryptionByDefault: { SSEAlgorithm: 'AES256' } })
        ])
      }),
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true
      }
    });
  }, 15_000);

  it('ships a public HTTPS distribution and health route', () => {
    const synthesized = template();
    synthesized.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({ Enabled: true, DefaultRootObject: 'index.html' })
    });
    synthesized.hasResourceProperties('AWS::ApiGatewayV2::Route', {
      RouteKey: 'GET /health'
    });
    synthesized.hasResourceProperties('AWS::ApiGatewayV2::Route', {
      RouteKey: 'POST /orders/{orderId}/inspections'
    });
    synthesized.hasResourceProperties('AWS::ApiGatewayV2::Stage', {
      DefaultRouteSettings: { ThrottlingBurstLimit: 20, ThrottlingRateLimit: 10 }
    });
    expect(synthesized.findOutputs('*')).toHaveProperty('SiteUrl');
    expect(synthesized.findOutputs('*')).toHaveProperty('HealthUrl');
  });

  it('uses an on-demand DynamoDB table with recovery enabled', () => {
    template().hasResourceProperties('AWS::DynamoDB::Table', {
      BillingMode: 'PAY_PER_REQUEST',
      PointInTimeRecoverySpecification: { PointInTimeRecoveryEnabled: true },
      SSESpecification: { SSEEnabled: true }
    });
  });
});
