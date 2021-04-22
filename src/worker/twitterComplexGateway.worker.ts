import * as fs from 'fs'
import * as path from 'path'
import { TwitterController } from '../controller/twitter.controller'
import { ZeebeController } from '../controller/zeebe.controller'
import { Worker } from '../enums/worker.enum'
import { logger } from '../utils/Logger'

export class TwitterComplexGatewayWorker {
  constructor(
    private zeebeController: ZeebeController,
    private twitterController?: TwitterController
  ) {}

  public twitterComplexGateway() {
    this.zeebeController.getZeebeClient().createWorker({
      taskType: Worker.TWITTER_COMPLEX_GATEWAY,
      taskHandler: async (job: any, complete: any, worker: any) => {
        const artId: string = job.variables.artId
        logger.info(`Error: you used a complex gateway!`)

        const errorImagePath = path.join(__dirname, 'error.png')
        const image = fs.readFileSync(errorImagePath)
        logger.info(`image? ${image !== undefined}`)
        const target = errorImagePath

        // fs.copyFileSync(errorImagePath, target)
        // logger.info(target)

        if (this.twitterController) {
          await this.twitterController.post({
            file: target,
            image,
            status: `Your Processes are Art! But unfortunately with a complex gateway! Error! ;) #camundasummit ${artId}`,
          })
        }

        complete.success()
      },
    })
  }
}
