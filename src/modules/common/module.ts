import { Global, Module } from '@nestjs/common'
import { loggerProvider } from './logger'
import { StatusController } from './status.controller'
import { ConfigService } from './config'

@Global()
@Module({
  providers: [
    loggerProvider,
    ConfigService
  ],
  controllers: [
    StatusController
  ],
  exports: [
    loggerProvider,
    ConfigService
  ]
})
export class CommonModule {
}
