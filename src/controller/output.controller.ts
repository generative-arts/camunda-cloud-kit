import { Config } from '@generative-arts/canvas-kit'
import * as fs from 'fs'

export class OutputController {
  public static save(config: Config, filepath: string) {
    const stream = config.canvas.createPNGStream()
    let out = fs.createWriteStream(filepath)
    stream.pipe(out)
    return new Promise((resolve) => {
      out.on('finish', () => resolve(''))
    })
  }
}
