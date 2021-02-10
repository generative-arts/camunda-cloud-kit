import { v4 } from 'uuid';
import { ConfigParameter } from '../enums/config.parameter.enum';
import { ConfigController } from './config.controller';
const { ZBClient } = require('zeebe-node');

export class ZeebeController {
  private zbc: any;

  constructor() {
    this.zbc = new ZBClient({
      camundaCloud: {
        clientId: ConfigController.get(ConfigParameter.CLIENT_ID),
        clientSecret: ConfigController.get(ConfigParameter.CLIENT_SECRET),
        clusterId: ConfigController.get(ConfigParameter.CLUSTER_ID),
      },
    });
  }

  public async getTopology() {
    const topology = await this.zbc.topology();
    return topology;
  }

  public async startInstance(
    bpmnProcessId: string,
    variables?: any,
    version?: number
  ) {
    const result = await this.zbc.createWorkflowInstance({
      bpmnProcessId,
      variables,
      version,
    });
    return result;
  }

  public async publishMessage(
    correlationKey: string,
    messageName: string,
    variables?: any
  ): Promise<any> {
    const response = await this.zbc.publishMessage({
      correlationKey,
      messageId: v4(),
      name: messageName,
      variables,
    });
    return response;
  }

  public getZeebeClient() {
    return this.zbc;
  }

  public async close(waitingTimeInSeconds?: number) {
    if (waitingTimeInSeconds) {
      await new Promise((resolve) => {
        setTimeout(async () => {
          await this.close();
          resolve('');
        }, waitingTimeInSeconds * 1000);
      });
    } else {
      await this.zbc.close();
    }
  }
}
