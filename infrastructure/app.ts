#!/usr/bin/env node
import 'source-map-support/register.js';
import { App } from 'aws-cdk-lib';
import { ParcelProofStack } from './lib/parcelproof-stack.js';

const app = new App();

new ParcelProofStack(app, 'ParcelProofStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1'
  },
  description: 'ParcelProof AWS Zero to Shipped MVP'
});

