import {
  DarkVsLightTemplate,
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
        let currentServiceTask: number = job.variables.currentServiceTask
          ? Number(job.variables.currentServiceTask)
          : 0
        let currentUserTask: number = job.variables.currentUserTask
          ? Number(job.variables.currentUserTask)
          : 0
        const bpmnFacts: BpmnFacts = job.variables.bpmnFacts
        const bpmnType = job.customHeaders.bpmnType
        const proportionServiceTask = Number(
          job.variables.proportionServiceTask
        )
        const proportionUserTask = Number(job.variables.proportionUserTask)

        if (proportionUserTask <= 0 || proportionServiceTask <= 0) {
          complete.failure(
            `Proportions not set correctly - user task: ${proportionUserTask}, service task: ${proportionServiceTask}`
          )
          return
        }

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

        if (currentServiceTask === 0 && currentUserTask === 0) {
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
          `Template Dark vs Light: Iteration Service Task: ${currentServiceTask} User task: ${currentUserTask} (${bpmnType})`
        )

        const darkVsLightTemplate = new DarkVsLightTemplate(templateConfig)
        switch (bpmnType) {
          case 'servicetask':
            templateConfig.config = darkVsLightTemplate.addIteration(
              currentServiceTask,
              bpmnType,
              proportionServiceTask
            )
            currentServiceTask++
            break
          case 'usertask':
            templateConfig.config = darkVsLightTemplate.addIteration(
              currentServiceTask,
              bpmnType,
              proportionUserTask
            )
            currentUserTask++
            break
          default:
            complete.failure(`bpmnType ${bpmnType} unknown`)
            return
        }

        const response: any = {
          templateConfig,
          currentServiceTask,
          currentUserTask,
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
