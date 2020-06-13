import { Inject, Injectable } from '@nestjs/common'
import { LOGGER, Logger } from '../common/logger'
import { MOCK_STORE } from './store/Store.provider'
import { Store, newMockDefinition } from './store/Store'
import { Mock, MockId, mockEquals } from './Mock'
import { InMemoryMatcher } from './matchers/InMemoryMatcher'
import { MATCHER } from './matchers/Matcher.provider'


@Injectable()
export class MockManager {

  constructor (
    @Inject(LOGGER) private readonly logger: Logger,
    @Inject(MOCK_STORE) private readonly store: Store,
    @Inject(MATCHER) private readonly matcher: InMemoryMatcher
  ) {}

  async getMock(id: MockId): Promise<Mock | undefined> {
    const diff = await this.store.lookup(id);
    if (diff) {
      const mocks = diff.def.created.filter(mock => mockEquals(id, mock.id))
      if (mocks && mocks.length > 0) {
        return mocks[0]
      }
    }
    return 
  }

  async storeMock (mock: Mock) {
    const version = await this.store.saveIncremental(newMockDefinition(mock))
    const descriptor = await this.store.getLastVersion()
    const diffs = await this.store.load(descriptor)
    diffs.forEach(diff => this.matcher.applyDiff(diff))

    if (diffs.length > 5) {
      await this.store.saveFull(this.matcher.fullDiff())
    }

    this.logger.info({ id: mock.id, version, descriptor },'Stored mock')
  }

}
