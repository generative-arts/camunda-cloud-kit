import { DecreaseWorker } from './worker/decrease.worker'
import { ZeebeController } from './controller/zeebe.controller'
import { logger } from './utils/Logger'
import { AddCanvasElementWorker } from './worker/addcanvaselement.worker'
import { BpmnLoaderWorker } from './worker/bpmnloader.worker'

async function run() {
  logger.info(`Connecting Zeebe Client`)
  const zeebeController = new ZeebeController()
  await zeebeController.getTopology()

  logger.info(`Creating Zeebe Workers`)

  const addCanvasElementWorker = new AddCanvasElementWorker(zeebeController)
  addCanvasElementWorker.create()

  const decreaseWorker = new DecreaseWorker(zeebeController)
  decreaseWorker.create()

  const bpmnLoaderWorker = new BpmnLoaderWorker(zeebeController)
  bpmnLoaderWorker.create()

  // {"circleCount": 2, "shareUrl":"https://cawemo.com/share/68ca82e4-7bb8-4766-a2ac-e2293a6810db"}
}

run()
