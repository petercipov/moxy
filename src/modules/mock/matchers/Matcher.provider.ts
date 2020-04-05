import { Provider } from '@nestjs/common'
import { InMemoryMatcher } from './InMemoryMatcher'
import { MOCK_STORE } from '../store/Store.provider'
import { Store } from '../store/Store'
import { LOGGER, Logger } from '../../common/logger'

export const MATCHER = 'MATCHER'

export const matcherProvider: Provider<Promise<InMemoryMatcher>> = {
  inject: [ MOCK_STORE, LOGGER ],
  provide: MATCHER,
  useFactory: async (store: Store, logger: Logger) => {
    const last = await store.getLastVersion()
    const diffs = await store.load(last)
    const matcher = new InMemoryMatcher()

    diffs.forEach(diff => matcher.applyDiff(diff))
    logger.info(`Created in memory matcher with descriptor ${JSON.stringify(last)}`)
    return matcher
  }
}
