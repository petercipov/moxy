import { Global, Module } from '@nestjs/common'
import { historyStoreProvider } from './Store.provider'

@Global()
@Module({
  providers: [
    historyStoreProvider
  ],
  exports: [
  ]
})
export class HistoryModule {
}
