import { Provider } from '@nestjs/common'
import { InMemoryMatcher } from './InMemoryMatcher'
import { MOCK_STORE } from '../store/Store.provider'
import { Store } from '../store/Store'
import { LOGGER, Logger } from '../../common/logger'

export const MATCHER = 'MATCHER'

async function fillMatcher(store: Store, matcher: InMemoryMatcher) {
  const last = await store.getLastVersion()
  const diffs = await store.load(last)
  diffs.forEach(diff => matcher.applyDiff(diff))
  return diffs.length
}

export const matcherProvider: Provider<Promise<InMemoryMatcher>> = {
  inject: [ MOCK_STORE, LOGGER ],
  provide: MATCHER,
  useFactory: async (store: Store, logger: Logger) => {
    let matcher = new InMemoryMatcher()
    const appliedDiffsCount = await fillMatcher(store, matcher)

    if (appliedDiffsCount > 1) {
      logger.info({ appliedDiffsCount }, 'Creating full diff because incremental changes pending in a store')
      await store.saveFull(matcher.fullDiff())
      matcher = new InMemoryMatcher()
      await fillMatcher(store, matcher)
    }

    logger.info(`Created in memory matcher with version ${matcher.getVersion()}`)
    return matcher
  }
}
