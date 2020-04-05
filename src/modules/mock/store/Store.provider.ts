import { Provider } from '@nestjs/common'
import { Store } from './Store'
import { ConfigService } from '../../common/config'
import { mkdir, dirName } from '../../common/files'
import { LOGGER, Logger } from '../../common/logger'
import { FileStore } from './FileStore'

export const MOCK_STORE = 'MOCK_STORE'

export const mockStoreProvider: Provider<Promise<Store>> = {
  inject: [ ConfigService, LOGGER ],
  provide: MOCK_STORE,
  useFactory: async (config: ConfigService, logger: Logger) => {
    const storePath = dirName(config.requireString('MOCK_STORE_DIR'))
    const incrementalPath = dirName(config.requireString('MOCK_STORE_DIR_INCREMENTAL'))
    const fullPath = dirName(config.requireString('MOCK_STORE_DIR_FULL'))

    await mkdir(storePath)
    await mkdir(incrementalPath)
    await mkdir(fullPath)

    logger.info(`Created mock filestore storePath: ${storePath}, incrementalPath: ${incrementalPath}, fullPath: ${fullPath}`)

    return new FileStore(storePath, incrementalPath, fullPath)
  }
}
