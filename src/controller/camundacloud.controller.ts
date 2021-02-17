import { CamundaCloudConfig } from '../types/CamundaCloudConfig.type'
import { logger } from '../utils/Logger'
import { AddCanvasElementWorker } from '../worker/addcanvaselement.worker'
import { BpmnLoaderWorker } from '../worker/bpmnloader.worker'
import { DecreaseWorker } from '../worker/decrease.worker'
import { ZeebeController } from './zeebe.controller'

export class CamundaCloudController {
  public static async run(
    seconds: number,
    camundaCloudConfig?: CamundaCloudConfig
  ) {
    logger.info(`Connecting Zeebe Client`)
    const zeebeController = new ZeebeController(camundaCloudConfig)
    await zeebeController.getTopology()

    logger.info(`Creating Zeebe Workers`)

    const addCanvasElementWorker = new AddCanvasElementWorker(zeebeController)
    addCanvasElementWorker.create()

    const decreaseWorker = new DecreaseWorker(zeebeController)
    decreaseWorker.create()

    const bpmnLoaderWorker = new BpmnLoaderWorker(zeebeController)
    bpmnLoaderWorker.create()

    await zeebeController.close(seconds)
  }
}
