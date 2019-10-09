import { Provider } from '@nestjs/common'
import { HistoryStore } from './Store'
import { FileStore } from './FileStore'
import { ConfigService } from '../common/config'
import { LOGGER, Logger } from '../common/logger'
import { mkdir } from '../common/files'

export const HISTORY_STORE = 'HISTORY_STORE'

export const historyStoreProvider: Provider<Promise<HistoryStore>> = {
  inject: [ ConfigService, LOGGER ],
  provide: HISTORY_STORE,
  useFactory: async (config: ConfigService, logger: Logger) => {
    const historyDir = config.requireString('HISTORY_STORE_DIR')
    const requestDir = config.requireString('REQUEST_STORE_DIR')
    await mkdir(historyDir)
    await mkdir(requestDir)
    const store = new FileStore(historyDir, requestDir)

    logger.info({ historyDir, requestDir }, 'History File Store created')
    return store
  }
}
