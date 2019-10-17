import { Provider } from '@nestjs/common'
import { MockStore } from './Store'
import { ConfigService } from '../../common/config'
import { mkdir, dirName } from '../../common/files'
import { LOGGER, Logger } from '../../common/logger'
import { SQLiteStore } from './SQLiteStore'

export const MOCK_STORE = 'MOCK_STORE'

export const mockStoreProvider: Provider<Promise<MockStore>> = {
  inject: [ ConfigService, LOGGER ],
  provide: MOCK_STORE,
  useFactory: async (config: ConfigService, logger: Logger) => {
    const file = config.requireString('MOCK_STORE_SQLITE_FILE')
    const migrations = config.requireString('MOCK_STORE_MIGRATIONS_DIR')
    const path = dirName(file)
    await mkdir(path)
    const store = new SQLiteStore(file, migrations, logger)

    await store.init()

    return store
  }
}
