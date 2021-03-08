import { CamundaCloudConfig } from './CamundaCloudConfig.type'

export interface ArtConfig {
  seconds: number
  processId: string
  shareUrl: string
  variables?: any
  artId: string
  camundaCloudConfig?: CamundaCloudConfig
}
