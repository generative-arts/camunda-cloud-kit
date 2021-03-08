import { Template, TemplateConfig } from '@generative-arts/canvas-kit'
import { CamundaCloudController } from './controller/camundacloud.controller'

async function run() {
  const templateConfig: TemplateConfig = {
    name: Template.SQUARE,
    colors: [
      '247,37,133',
      '114,9,183',
      '58,12,163',
      '72,149,239',
      '76,201,240',
    ],
    dimensions: {
      width: 1000,
      height: 1000,
    },
    config: [],
    elements: {
      tasks: 0,
      exclusiveGateways: 0,
      endEvents: 0,
    },
  }

  await CamundaCloudController.run({
    artId: '1',
    processId: 'square',
    seconds: 60,
    shareUrl: 'https://cawemo.com/share/68ca82e4-7bb8-4766-a2ac-e2293a6810db',
    template: templateConfig,
  })

  // {"circleCount": 2, "shareUrl":"https://cawemo.com/share/68ca82e4-7bb8-4766-a2ac-e2293a6810db"}
}

run()
