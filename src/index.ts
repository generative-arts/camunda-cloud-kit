import { ZeebeController } from './controller/zeebe.controller';
import { logger } from './utils/Logger';
import { AddCanvasElementWorker } from './worker/addcanvaselement.worker';

async function run() {
  logger.info(`Connecting Zeebe Client`);
  const zeebeController = new ZeebeController();
  await zeebeController.getTopology();

  logger.info(`Creating Zeebe Workers`);

  const addCanvasElementWorker = new AddCanvasElementWorker(zeebeController);
  addCanvasElementWorker.create();
}

run();
