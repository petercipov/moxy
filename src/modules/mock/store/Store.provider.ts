import { Provider } from '@nestjs/common'
import { Store } from './Store'
import { ConfigService } from '../../common/config'
import { mkdir } from '../../common/files'
import { LOGGER, Logger } from '../../common/logger'
import { FileStore } from './FileStore'

export const MOCK_STORE = 'MOCK_STORE'

export const mockStoreProvider: Provider<Promise<Store>> = {
  inject: [ ConfigService, LOGGER ],
  provide: MOCK_STORE,
  useFactory: async (config: ConfigService, logger: Logger) => {
    console.log(config)

    const storePath = config.requireString('MOCK_STORE_DIR')
    const incrementalPath = config.requireString('MOCK_STORE_DIR_INCREMENTAL')
    const fullPath = config.requireString('MOCK_STORE_DIR_FULL')
    const indexPath = config.requireString('MOCK_STORE_DIR_INDEX')

    await mkdir(storePath)
    await mkdir(incrementalPath)
    await mkdir(fullPath)
    await mkdir(indexPath)

    logger.info(`Created mock filestore storePath: ${storePath}, incrementalPath: ${incrementalPath}, fullPath: ${fullPath}`)

    return new FileStore(storePath, incrementalPath, fullPath, indexPath)
  }
}
