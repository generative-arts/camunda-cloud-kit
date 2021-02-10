import { ConfigParameter } from '../enums/config.parameter.enum';

export class ConfigController {
  public static get(configParameter: ConfigParameter): string {
    const parameter = process.env[configParameter];
    if (!parameter) {
      throw new Error(`No value for Parameter ${configParameter}`);
    }
    return parameter;
  }
}
