import { ZeebeController } from '../controller/zeebe.controller'
import { Worker } from '../enums/worker.enum'
import { logger } from '../utils/Logger'

export class AddCanvasElementWorker {
  constructor(private zeebeController: ZeebeController) {}

  public create() {
    this.zeebeController.getZeebeClient().createWorker({
      taskType: Worker.ADD_CANVAS_ELEMENT,
      taskHandler: (job: any, complete: any, worker: any) => {
        const elementType = job.customHeaders.elementType
        const instruction: any[] = job.variables.instruction
          ? job.variables.instruction
          : []

        if (!elementType) {
          complete.failure('Element Type not set as header <elementType>')
          return
        }

        logger.info(`Adding Element ${elementType}`)

        try {
          instruction.push(elementType)
          complete.success({ instruction })
        } catch (error) {
          logger.error(error)
          complete.failure(`Failed to add Element Type ${elementType}`)
        }
      },
    })
  }
}
