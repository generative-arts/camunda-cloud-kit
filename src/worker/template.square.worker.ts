import {
  SquareTemplate,
  TemplateConfig,
  TemplateController,
} from '@generative-arts/canvas-kit'
import { ZeebeController } from '../controller/zeebe.controller'
import { Worker } from '../enums/worker.enum'
import { logger } from '../utils/Logger'

export class TemplateSquareWorker {
  constructor(private zeebeController: ZeebeController) {}

  public createTaskIterationWorker() {
    this.zeebeController.getZeebeClient().createWorker({
      taskType: Worker.TEMPLATE_SQUARE_TASK,
      taskHandler: (job: any, complete: any, worker: any) => {
        const templateConfig: TemplateConfig = job.variables.templateConfig
        const currentTask: number = job.variables.currentTask
          ? Number(job.variables.currentTask)
          : 0

        if (!templateConfig) {
          complete.failure('Template Config not found')
          return
        }

        logger.info(`Template Square: Task Iteration ${currentTask}`)

        const squareTemplate = new SquareTemplate(templateConfig)
        templateConfig.config = squareTemplate.addTaskIteration(currentTask)

        const response: any = {
          templateConfig,
          currentTask: currentTask + 1,
        }

        complete.success(response)
      },
    })
  }

  public finalize() {
    this.zeebeController.getZeebeClient().createWorker({
      taskType: Worker.TEMPLATE_SQUARE_FINALIZE,
      taskHandler: (job: any, complete: any, worker: any) => {
        const templateConfig: TemplateConfig = job.variables.templateConfig

        if (!templateConfig) {
          complete.failure('Template Config not found')
          return
        }

        logger.info(`Template Square: Finalize`)

        const squareTemplate = new SquareTemplate(templateConfig)
        const elementConfigs = squareTemplate.getElementConfigs()

        TemplateController.generateArt(templateConfig, elementConfigs)

        complete.success()
      },
    })
  }
}
