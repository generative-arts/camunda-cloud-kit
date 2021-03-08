import { BPMN, BpmnController } from '@generative-arts/bpmn-art'
import { TemplateConfig } from '@generative-arts/canvas-kit'
import { BpmnLoaderController } from '../controller/bpmnLoader.controller'
import { ZeebeController } from '../controller/zeebe.controller'
import { Worker } from '../enums/worker.enum'
import { SharedBpmnResponse } from '../types/SharedBpmnResponse.type'
import { logger } from '../utils/Logger'

export class BpmnLoaderWorker {
  constructor(private zeebeController: ZeebeController) {}

  public create() {
    this.zeebeController.getZeebeClient().createWorker({
      taskType: Worker.BPMN_LOADER,
      taskHandler: async (job: any, complete: any, worker: any) => {
        const shareUrl: string = job.variables.shareUrl
        const templateConfig: TemplateConfig = job.variables.templateConfig

        if (!templateConfig) {
          complete.failure('Template Config not found')
          return
        }

        if (!shareUrl) {
          complete.failure('Share URL <shareUrl> not found on process context')
          return
        }

        try {
          const data: SharedBpmnResponse = await BpmnLoaderController.loadShared(
            shareUrl
          )

          const bpmnController = new BpmnController(
            data.data.share.diagram.content
          )

          templateConfig.elements.tasks = bpmnController.count(BPMN.TASK)
          templateConfig.elements.exclusiveGateways = bpmnController.count(
            BPMN.EXCLUSIVE_GATEWAY
          )
          templateConfig.elements.endEvents = bpmnController.count(
            BPMN.END_EVENT
          )

          complete.success({
            templateConfig,
          })
        } catch (error) {
          logger.error(error)
          complete.failure(`Failed to load shared BPMN from ${shareUrl}`)
        }
      },
    })
  }
}
