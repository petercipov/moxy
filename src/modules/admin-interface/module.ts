import { Global, Module } from '@nestjs/common'
import { MockController } from './mock.controller'
import { HistoryController } from './history.controller'
import { RequestController } from './request.controller'
import { MockModule } from '../mock/module'

@Global()
@Module({
  providers: [
  ],
  imports: [
    MockModule
  ],
  controllers: [
    MockController,
    HistoryController,
    RequestController
  ]
})
export class AdminInterfaceModule {
}
