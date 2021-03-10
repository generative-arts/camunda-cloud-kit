import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { SharedBpmnResponse } from '../types/SharedBpmnResponse.type'
import { logger } from '../utils/Logger'

enum ROUTE {
  BASE = `https://cawemo.com`,
  SHARE = `share`,
  SHARES = `shares`,
  API = `api`,
}

export class BpmnLoaderController {
  // API is not publicly supported!
  public static async loadShared(url: string): Promise<SharedBpmnResponse> {
    if (!url.startsWith(`${ROUTE.BASE}/${ROUTE.SHARE}`)) {
      throw new Error(`Shared URL is not valid!`)
    }

    const routes = url.split('/')
    const id = routes[routes.length - 1]

    const config: AxiosRequestConfig = {
      method: `GET`,
      url: `${ROUTE.BASE}/${ROUTE.API}/${ROUTE.SHARES}/${id}`,
    }

    try {
      const result: AxiosResponse = await axios(config)
      if (!result.data) {
        throw new Error(`Failed to load shared BPMN`)
      }
      return result.data as SharedBpmnResponse
    } catch (error) {
      logger.error(error)
      throw new Error(error)
    }
  }
}
