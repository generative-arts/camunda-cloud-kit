import {
  DarkVsLightTemplate,
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

export class TemplateDarkVsLightWorker {
  constructor(
    private zeebeController: ZeebeController,
    private twitterController?: TwitterController
  ) {}

  public createTaskIterationWorker() {
    this.zeebeController.getZeebeClient().createWorker({
      taskType: Worker.TEMPLATE_DARK_LIGHT_TASK,
      taskHandler: (job: any, complete: any, worker: any) => {
        const templateConfig: TemplateConfig = job.variables.templateConfig
        const currentTask: number = job.variables.currentTask
          ? Number(job.variables.currentTask)
          : 0
        const bpmnFacts: BpmnFacts = job.variables.bpmnFacts
        const bpmnType = job.customHeaders.bpmnType

        if (!templateConfig) {
          complete.failure('Template Config not found')
          return
        }

        if (!bpmnType || !['usertask', 'servicetask'].includes(bpmnType)) {
          complete.failure(
            'Custom Header <bpmnType> not set correctly. Must be <usertast> or <servicetask>.'
          )
          return
        }

        if (currentTask === 0) {
          if (!bpmnFacts) {
            complete.failure('BPMN Facts not found')
            return
          }

          templateConfig.elements.serviceTask = Math.min(
            bpmnFacts.serviceTasks,
            10
          )
          templateConfig.elements.userTask = Math.min(bpmnFacts.userTasks, 10)
        }

        logger.info(
          `Template Dark vs Light: Task Iteration ${currentTask} (${bpmnType})`
        )

        const darkVsLightTemplate = new DarkVsLightTemplate(templateConfig)
        templateConfig.config = darkVsLightTemplate.addIteration(
          currentTask,
          bpmnType
        )

        const response: any = {
          templateConfig,
          currentTask: currentTask + 1,
          maxTasks: (bpmnFacts.serviceTasks + bpmnFacts.userTasks) * 2,
        }

        complete.success(response)
      },
    })
  }

  public finalize() {
    this.zeebeController.getZeebeClient().createWorker({
      taskType: Worker.TEMPLATE_DARK_LIGHT_FINALIZE,
      taskHandler: async (job: any, complete: any, worker: any) => {
        const templateConfig: TemplateConfig = job.variables.templateConfig
        const artId: string = job.variables.artId

        if (!templateConfig) {
          complete.failure('Template Config not found')
          return
        }

        logger.info(`Template Dark vs Light: Finalize`)

        const darkVsLightTemplate = new DarkVsLightTemplate(templateConfig)
        const elementConfigs = darkVsLightTemplate.getElementConfigs()

        const config = TemplateController.generateArt(
          templateConfig,
          elementConfigs
        )
        const tempPath = os.tmpdir()
        const target = `${tempPath}/${artId}.png`
        logger.info(`Result: ${target}`)
        await OutputController.save(config, target)

        const tweet = `Your Processes are Art! #camundasummit ${artId}`
        logger.info(tweet)

        if (this.twitterController) {
          await this.twitterController.post({
            file: target,
            status: tweet,
          })
        }

        complete.success()
      },
    })
  }
}
