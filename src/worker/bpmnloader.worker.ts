import { BPMN, BpmnController } from '@generative-arts/bpmn-art'
import { BpmnLoaderController } from '../controller/bpmnLoader.controller'
import { ZeebeController } from '../controller/zeebe.controller'
import { Worker } from '../enums/worker.enum'
import { BpmnFacts } from '../types/BpmnFacts.type'
import { SharedBpmnResponse } from '../types/SharedBpmnResponse.type'
import { logger } from '../utils/Logger'

export class BpmnLoaderWorker {
  constructor(private zeebeController: ZeebeController) {}

  public create() {
    this.zeebeController.getZeebeClient().createWorker({
      taskType: Worker.BPMN_LOADER,
      taskHandler: async (job: any, complete: any, worker: any) => {
        const shareUrl: string = job.variables.shareUrl

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

          const bpmnFacts: BpmnFacts = {
            tasks: bpmnController.count(BPMN.TASK),
            exclusiveGateways: bpmnController.count(BPMN.EXCLUSIVE_GATEWAY),
            endEvents: bpmnController.count(BPMN.END_EVENT),
          }

          complete.success({
            bpmnFacts,
          })
        } catch (error) {
          logger.error(error)
          complete.failure(`Failed to load shared BPMN from ${shareUrl}`)
        }
      },
    })
  }
}
