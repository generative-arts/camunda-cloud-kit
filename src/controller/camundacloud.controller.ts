import { ArtConfig } from '../types/ArtConfig.type'
import { logger } from '../utils/Logger'
import { AddCanvasElementWorker } from '../worker/addcanvaselement.worker'
import { BpmnLoaderWorker } from '../worker/bpmnloader.worker'
import { DecreaseWorker } from '../worker/decrease.worker'
import { ZeebeController } from './zeebe.controller'

export class CamundaCloudController {
  public static async run(artConfig: ArtConfig) {
    logger.info(`Connecting Zeebe Client`)
    const zeebeController = new ZeebeController(artConfig.camundaCloudConfig)
    await zeebeController.getTopology()

    logger.info(`Starting new Process Instance`)
    const mandatoryVariables = {
      shareUrl: artConfig.shareUrl,
      artId: artConfig.artId,
    }
    const variables = Object.assign(mandatoryVariables, artConfig.variables)
    const newInstanceResponse = await zeebeController.startInstance(
      artConfig.processId,
      variables
    )
    logger.info(`New Instance: ${JSON.stringify(newInstanceResponse)}`)

    logger.info(`Creating Zeebe Workers`)

    const addCanvasElementWorker = new AddCanvasElementWorker(zeebeController)
    addCanvasElementWorker.create()

    const decreaseWorker = new DecreaseWorker(zeebeController)
    decreaseWorker.create()

    const bpmnLoaderWorker = new BpmnLoaderWorker(zeebeController)
    bpmnLoaderWorker.create()

    await zeebeController.close(artConfig.seconds)
  }
}
