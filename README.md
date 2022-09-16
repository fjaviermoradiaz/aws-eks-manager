# EKS Lambda Manager

Proyecto para hacer un scale down de los nodos de un cluster en Amazon EKS

## Installation

Paso a paso de como usar [EKS Lambda manager](https://medium.com/@jvimora/ahorra-con-amazon-eks-3bc8bfaec44f)

```bash
npm install -g serverless
```
## Crear el proyecto
Creamos nuestro proyecto en un nuevo directorio ejecutamos el siguiente comando

```bash
sls create -t aws-nodejs-typescript
```
## Test
Ahora ya podéis probar que el proyecto se ha creado correctamente invocando la función hello desde local:

```bash
sls invoke local — function hello
```

## Instalar dependencias aws-sdk
Una vez que comprobamos que el ejemplo funciona, ya podemos empezar a modificar nuestra lambda, o bien podemos crear una nueva. Lo primero que necesitamos es la sdk de aws

```bash
npm i aws-sdk
```
## Deploy
Ahora tenemos todo nuestro código preparado para ralizar la función que queremos, solo queda desplegarlo, y es tan simple como hacer lo siguiente:

```bash
sls deploy
```
## Asignar role
Debemos copiar el arn de ese rol, ya que debemos configurar nuestro cluster para permitir a ese rol realizar cambios, tal y como se explica en la
[documentación oficial](https://docs.aws.amazon.com/eks/latest/userguide/add-user-role.html)


```bash
eksctl create iamidentitymapping \
    --cluster cluster-name \
    --region=xx-xxxx-x \
    --arn arn:aws:iam::0000000000000:role/eks-management-dev-xx-xxxx-x-lambdaRole \
    --group group:example
```


```bash
eksctl get iamidentitymapping --cluster cluster-name --region=xx-xxxx-x
```
## Lambda
```typescript
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
```


## Cron
La lambda podemos ejecutarla manualmente, a través de una llamada a un endpoint de API Gateway o a través de una tarea periódica con CloudWatch Rules.

Para ello vamos al archivo index.ts y vemos que está configurado para llamar a la lambda a través de un endpoint de API Gateway, sustituimos ese código por el siguiente:
```typescript
import { handlerPath } from '@libs/handler-resolver';
export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      schedule: 'cron(0 19 ? * MON-FRI *)',
    }
  ],
};
```
