import { CamundaCloudController } from './controller/camundacloud.controller'

async function run() {
  await CamundaCloudController.run({
    artId: '1',
    processId: 'canvas',
    seconds: 60,
    shareUrl: 'https://cawemo.com/share/68ca82e4-7bb8-4766-a2ac-e2293a6810db',
  })

  // {"circleCount": 2, "shareUrl":"https://cawemo.com/share/68ca82e4-7bb8-4766-a2ac-e2293a6810db"}
}

run()
