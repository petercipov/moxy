import { Global, Module } from '@nestjs/common'
import { MockController } from './mock.controller'
import { HistoryController } from './history.controller'
import { RequestController } from './request.controller'

@Global()
@Module({
  providers: [
  ],
  controllers: [
    MockController,
    HistoryController,
    RequestController
  ]
})
export class AdminInterfaceModule {
}
