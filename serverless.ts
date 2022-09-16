import type { AWS } from '@serverless/typescript';

import start from '@functions/start';
import stop from '@functions/stop';


const serverlessConfiguration: AWS = {
  service: 'eks-management',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    iamRoleStatements: [
      {
        'Effect': 'Allow',
        'Action': ['eks:UpdateNodegroupConfig'],
        'Resource': '*'
      }
    ],
    runtime: 'nodejs14.x',
    region: 'eu-west-3',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
  },
  // import the function via paths
  functions: { start, stop},
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
