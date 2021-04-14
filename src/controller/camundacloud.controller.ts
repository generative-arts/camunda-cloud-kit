/* eslint-disable no-case-declarations */
import { Template, TemplateConfig } from '@generative-arts/canvas-kit'
import { ArtConfig } from '../types/ArtConfig.type'
import { TwitterConfig } from '../types/TwitterConfig.type'
import { logger } from '../utils/Logger'
import { BpmnLoaderWorker } from '../worker/bpmnloader.worker'
import { TemplateDarkVsLightWorker } from '../worker/template.darklight.worker'
import { TemplateSquareWorker } from '../worker/template.square.worker'
import { TwitterController } from './twitter.controller'
import { ZeebeController } from './zeebe.controller'

export class CamundaCloudController {
  public static async run(artConfig: ArtConfig, twitterConfig?: TwitterConfig) {
    logger.info(`Connecting Zeebe Client`)
    const zeebeController = new ZeebeController(artConfig.camundaCloudConfig)
    await zeebeController.getTopology()

    logger.info(`Starting new Process Instance`)
    const mandatoryVariables = {
      shareUrl: artConfig.shareUrl,
      artId: artConfig.artId,
    }
    const variables = Object.assign(mandatoryVariables, artConfig.variables)

    const templateConfig: TemplateConfig = artConfig.template

    variables.templateConfig = templateConfig
    const newInstanceResponse = await zeebeController.startInstance(
      artConfig.processId,
      variables
    )
    logger.info(`New Instance: ${JSON.stringify(newInstanceResponse)}`)
    logger.info(`Creating Zeebe Workers`)

    const bpmnLoaderWorker = new BpmnLoaderWorker(zeebeController)
    bpmnLoaderWorker.create()

    const twitterController = twitterConfig
      ? new TwitterController(twitterConfig)
      : undefined
    switch (templateConfig.name) {
      case Template.SQUARE:
        const templateSquareWorker = new TemplateSquareWorker(
          zeebeController,
          twitterController
        )
        templateSquareWorker.createTaskIterationWorker()
        templateSquareWorker.finalize()
        break
      case Template.ELLIPSE:
        const templateDarkVsLightWorker = new TemplateDarkVsLightWorker(
          zeebeController,
          twitterController
        )
        templateDarkVsLightWorker.createTaskIterationWorker()
        templateDarkVsLightWorker.finalize()
        break
    }

    await zeebeController.close(artConfig.seconds)
  }
}
