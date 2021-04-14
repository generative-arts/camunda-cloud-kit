import {
  SquareTemplate,
  TemplateConfig,
  TemplateController,
} from '@generative-arts/canvas-kit'
import * as os from 'os'
import { OutputController } from '../controller/output.controller'
import { TwitterController } from '../controller/twitter.controller'
import { ZeebeController } from '../controller/zeebe.controller'
import { Worker } from '../enums/worker.enum'
import { BpmnFacts } from '../types/BpmnFacts.type'
import { logger } from '../utils/Logger'

export class TemplateSquareWorker {
  constructor(
    private zeebeController: ZeebeController,
    private twitterController?: TwitterController
  ) {}

  public createTaskIterationWorker() {
    this.zeebeController.getZeebeClient().createWorker({
      taskType: Worker.TEMPLATE_SQUARE_TASK,
      taskHandler: (job: any, complete: any, worker: any) => {
        const templateConfig: TemplateConfig = job.variables.templateConfig
        const currentTask: number = job.variables.currentTask
          ? Number(job.variables.currentTask)
          : 0
        const bpmnFacts: BpmnFacts = job.variables.bpmnFacts

        if (!templateConfig) {
          complete.failure('Template Config not found')
          return
        }

        if (currentTask === 0) {
          if (!bpmnFacts) {
            complete.failure('BPMN Facts not found')
            return
          }

          const tasks =
            bpmnFacts.tasks + bpmnFacts.serviceTasks + bpmnFacts.userTasks

          templateConfig.elements.tasks = Math.min(tasks, 10)
          templateConfig.elements.exclusiveGateways = Math.min(
            bpmnFacts.exclusiveGateways,
            5
          )
          templateConfig.elements.endEvents = Math.min(bpmnFacts.endEvents, 5)
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
      taskHandler: async (job: any, complete: any, worker: any) => {
        const templateConfig: TemplateConfig = job.variables.templateConfig
        const artId: string = job.variables.artId

        if (!templateConfig) {
          complete.failure('Template Config not found')
          return
        }

        logger.info(`Template Square: Finalize`)

        const squareTemplate = new SquareTemplate(templateConfig)
        const elementConfigs = squareTemplate.getElementConfigs()

        const config = TemplateController.generateArt(
          templateConfig,
          elementConfigs
        )
        const tempPath = os.tmpdir()
        const target = `${tempPath}/${artId}.png`
        await OutputController.save(config, target)

        if (this.twitterController) {
          await this.twitterController.post({
            file: target,
            status: `Your Processes are Art! #camundasummit ${artId}`,
          })
        }

        complete.success()
      },
    })
  }
}
