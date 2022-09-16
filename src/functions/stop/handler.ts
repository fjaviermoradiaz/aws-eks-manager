import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { NodegroupScalingConfig, UpdateNodegroupConfigRequest, UpdateNodegroupConfigResponse } from 'aws-sdk/clients/eks';
import { AWSError, EKS } from 'aws-sdk';

import schema from './schema';
import { PromiseResult } from 'aws-sdk/lib/request';

const stop: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {

  const CLUSTER_NAME:string = '[CLUSTER_NAME]';
  const NODE_GROUP_NAME:string = '[NODE_GROUP_NAME]';

  let nodeGroupConfig:NodegroupScalingConfig = {
    desiredSize: 0,
    maxSize: 1,
    minSize: 0

  };

  let nodeGroupRequest:UpdateNodegroupConfigRequest = {
    clusterName: CLUSTER_NAME,
    nodegroupName: NODE_GROUP_NAME,
    scalingConfig: nodeGroupConfig
  };


  let response:PromiseResult<UpdateNodegroupConfigResponse, AWSError> = await new EKS().updateNodegroupConfig(nodeGroupRequest).promise();
  console.log(response);

  
  return formatJSONResponse({
    message: 'NodeGroupScaling updated to 0',
    event,
  });
};

export const main = middyfy(stop);
