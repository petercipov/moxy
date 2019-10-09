import { Injectable, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { LOGGER, Logger } from '../common/logger'
import { IncomingRequest, MockResponse } from '../mock/Mock'
import { MOCK_STORE } from '../mock/store/Store.provider'
import { MockStore, BEGIN_VERSION } from '../mock/store/Store'
import { Subscription } from 'rxjs'
import { InMemoryMatcher } from '../mock/InMemoryMatcher'

export interface ResponseHandler {
  mockResponse (result: MockResponse): Promise<void>
  undecided (mockIds: string[]): Promise<void>
  passTrough (request: IncomingRequest): Promise<void>
}

@Injectable()
export class RequestInterceptor implements OnModuleInit, OnModuleDestroy {

  private subscription: Subscription | undefined
  private matcher: InMemoryMatcher

  constructor (
    @Inject(LOGGER) private logger: Logger,
    @Inject(MOCK_STORE) private mockStore: MockStore
  ) {
    this.matcher = new InMemoryMatcher()
  }

  async intercept (request: IncomingRequest, handler: ResponseHandler) {
    const result = await this.matcher.match(request)
    if (result.length === 0) {
      await handler.passTrough(request)
    } else if (result.length === 1) {
      await handler.mockResponse(result[0])
    } else {
      await handler.undecided(result.map(resp => resp.mockId))
    }
  }

  async onModuleInit () {
    this.subscription = this.mockStore
      .observeChanges()
      .subscribe(newVersion => this.updateMocks(newVersion))
    await this.updateMocks(BEGIN_VERSION)
  }

  onModuleDestroy () {
    if (this.subscription) {
      this.subscription.unsubscribe()
      this.subscription = undefined
    }
  }

  private async updateMocks (notifiedVersion: number) {
    const diffs = await this.mockStore.load(this.matcher.getVersion())
    diffs.forEach(diff => this.matcher.applyDiff(diff))
    const actualVersion = this.matcher.getVersion()

    this.logger.info({ notifiedVersion, actualVersion }, 'Matcher updated')
  }
}
