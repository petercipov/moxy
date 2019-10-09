import BunyanLogger, { stdSerializers } from 'bunyan'
import { Provider } from '@nestjs/common'

export class Logger extends BunyanLogger {
}

export const LOGGER = 'LOGGER'

export const loggerProvider: Provider = {

  inject: [ ],
  provide: LOGGER,

  useFactory: async (): Promise<Logger> => {
    const name = 'nest.js tdd base'
    const level = 'info'
    const loggerOptions: BunyanLogger.LoggerOptions = {
      name,
      serializers: stdSerializers,
      streams: [
        {
          level,
          stream: process.stdout
        }
      ]
    }
    const logger = new Logger(loggerOptions)
    return logger
  }
}
