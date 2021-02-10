import pino from 'pino';

// locally using pretty config: https://github.com/pinojs/pino-pretty
const localConfig = {
  name: 'websiteshot-camunda-cloud-example',
  level: 'debug',
  prettyPrint: { colorize: true },
};

const config = {
  name: 'websiteshot-camunda-cloud-example',
  level: 'debug',
};

export const logger =
  process.env.NODE_ENV === 'local' ? pino(localConfig) : pino(config);
