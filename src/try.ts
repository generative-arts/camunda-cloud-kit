import { Template, TemplateConfig } from '@generative-arts/canvas-kit'
import { CamundaCloudController } from './controller/camundacloud.controller'

async function run() {
  const templateConfig: TemplateConfig = {
    name: Template.ELLIPSE,
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
    processId: 'dark-vs-light',
    seconds: 60,
    shareUrl: 'https://cawemo.com/share/aa2b99e4-fd0a-4c73-9e20-acd7de924351',
    template: templateConfig,
  })

  // {"circleCount": 2, "shareUrl":"https://cawemo.com/share/68ca82e4-7bb8-4766-a2ac-e2293a6810db"}
}

run()
