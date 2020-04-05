import { Global, Module } from '@nestjs/common'
import { mockStoreProvider } from './store/Store.provider'
import { matcherProvider } from './matchers/Matcher.provider'

@Global()
@Module({
  providers: [
    mockStoreProvider,
    matcherProvider
  ],
  exports: [
    mockStoreProvider,
    matcherProvider
  ]
})
export class MockModule {
}
