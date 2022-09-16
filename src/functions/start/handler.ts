import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { NodegroupScalingConfig, UpdateNodegroupConfigRequest, UpdateNodegroupConfigResponse } from 'aws-sdk/clients/eks';
import { AWSError, EKS } from 'aws-sdk';

import schema from './schema';
import { PromiseResult } from 'aws-sdk/lib/request';

const start: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {


  console.log("Setting NodeGroupScalingCongig DEV");
  let nodeGroupConfig:NodegroupScalingConfig = {
    desiredSize: 3,
    maxSize: 3,
    minSize: 3

  };

  console.log("Setting UpdateNodegroupConfigRequest DEV");
  let nodeGroupRequest:UpdateNodegroupConfigRequest = {
    clusterName: 'dgp-devl',
    nodegroupName: 'developv2-node-group',
    scalingConfig: nodeGroupConfig
  };

  console.log("Updating DEV NodeGroupConfig");
  
  let response:PromiseResult<UpdateNodegroupConfigResponse, AWSError> = await new EKS().updateNodegroupConfig(nodeGroupRequest).promise();
  console.log(response);
  
  /*console.log("Setting NodeGroupScalingCongig STAGING");
  nodeGroupConfig = {
    desiredSize: 2,
    maxSize: 2,
    minSize: 2

  };

  console.log("Setting UpdateNodegroupConfigRequest STAGING");
  nodeGroupRequest = {
    clusterName: 'dgp-staging',
    nodegroupName: 'staging-node-group',
    scalingConfig: nodeGroupConfig
  };

  console.log("Updating STAGING NodeGroupConfig");
  response = await new EKS().updateNodegroupConfig(nodeGroupRequest).promise();
  console.log(response);
*/
  return formatJSONResponse({
    message: 'NodeGroupScaling updated to 0',
    event,
  });
};

export const main = middyfy(start);
