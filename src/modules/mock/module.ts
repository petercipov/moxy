import { Global, Module } from '@nestjs/common'
import { mockStoreProvider } from './store/Store.provider'
import { matcherProvider } from './matchers/Matcher.provider'
import { MockManager } from './MockManager'

@Global()
@Module({
  providers: [
    mockStoreProvider,
    matcherProvider,
    MockManager
  ],
  exports: [
    mockStoreProvider,
    matcherProvider,
    MockManager
  ]
})
export class MockModule {
}
