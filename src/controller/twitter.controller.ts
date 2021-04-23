import { TwitterConfig, TwitterPost } from '../types/TwitterConfig.type'
import { logger } from '../utils/Logger'

const Twitter = require('twitter')
const fs = require('fs')

export class TwitterController {
  constructor(private twitterConfig: TwitterConfig) {}

  public post(twitterPost: TwitterPost): Promise<any> {
    const client = new Twitter(this.twitterConfig)

    // const imageData = twitterPost.image
    //   ? twitterPost.image
    //   : fs.readFileSync(twitterPost.file)

    const imageData = fs.readFileSync(twitterPost.file)

    return new Promise((resolve, reject) => {
      client.post(
        'media/upload',
        { media: imageData },
        (mediaError: any, media: any, _mediaResponse: any) => {
          if (mediaError) {
            logger.error(mediaError)
            logger.error(`Failed to upload media: ${mediaError.message}`)
            reject(mediaError)
            return
          }
          const status = {
            status: twitterPost.status,
            media_ids: media.media_id_string,
          }

          client.post(
            'statuses/update',
            status,
            (statusError: any, tweet: any, _statusResponse: any) => {
              if (statusError) {
                logger.error(`Failed to update status: ${statusError.message}`)
                reject(statusError)
                return
              }
              resolve('')
            }
          )
        }
      )
    })
  }

  public postStatus(twitterPost: TwitterPost): Promise<any> {
    const client = new Twitter(this.twitterConfig)

    // const imageData = twitterPost.image
    //   ? twitterPost.image
    //   : fs.readFileSync(twitterPost.file)

    const imageData = fs.readFileSync(twitterPost.file)

    console.log(imageData)

    return new Promise((resolve, reject) => {
      const status = {
        status: twitterPost.status,
      }

      client.post(
        'statuses/update',
        status,
        (statusError: any, tweet: any, _statusResponse: any) => {
          if (statusError) {
            logger.error(`Failed to update status: ${statusError.message}`)
            reject(statusError)
            return
          }
          resolve('')
        }
      )
    })
  }
}
