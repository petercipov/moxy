import { Global, Module } from '@nestjs/common'
import { mockStoreProvider } from './store/Store.provider'

@Global()
@Module({
  providers: [
    mockStoreProvider
  ],
  exports: [
    mockStoreProvider
  ]
})
export class MockModule {
}
