import { ZeebeController } from '../controller/zeebe.controller'
import { Worker } from '../enums/worker.enum'
import { logger } from '../utils/Logger'

export class IncreaseWorker {
  constructor(private zeebeController: ZeebeController) {}

  public create() {
    this.zeebeController.getZeebeClient().createWorker({
      taskType: Worker.INCREASE,
      taskHandler: (job: any, complete: any, worker: any) => {
        const variableName = job.customHeaders.variableName

        if (!variableName) {
          complete.failure('Element Name not set as header <variableName>')
          return
        }

        const variableValue: number = job.variables[variableName]

        if (!variableValue) {
          complete.failure(
            `Element <${variableName}> not found on process context.`
          )
          return
        }

        logger.info(`Decreasing ${variableName}`)

        const response: any = {}
        response[variableName] = variableValue + 1

        complete.success(response)
      },
    })
  }
}
