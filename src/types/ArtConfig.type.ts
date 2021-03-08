import { CamundaCloudConfig } from './CamundaCloudConfig.type'

export interface ArtConfig {
  seconds: number
  processId: string
  shareUrl: string
  artId: string
  camundaCloudConfig?: CamundaCloudConfig
}
