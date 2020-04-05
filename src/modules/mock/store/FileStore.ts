import { Store, MocksDiff, MockDefinition, Descriptor, VERSION, BEGIN_VERSION } from './Store'
import { readDir, filePath, writeJSON, readJSON } from '../../common/files'

const ZERO_MOCK_DIFF: MocksDiff = {
  type: 'full',
  startVersion: BEGIN_VERSION,
  endVersion: BEGIN_VERSION,
  def: {
    created: [],
    purged: [],
    purgedGroups: []
  }
}

export class FileStore implements Store {

  constructor (
        readonly path: string,
        readonly incrementalPath: string,
        readonly fullPath: string
    ) {}

  async load (descriptor: Descriptor): Promise<MocksDiff[]> {
    const incList = await readDir(this.incrementalPath)

    const increments: Promise<any>[] = incList
            .map(fileName => Number.parseInt(fileName.substring(0, fileName.lastIndexOf('.')), 10))
            .filter(id => id <= descriptor.lastIncrementalDiff && id > descriptor.lastFullDiff)
            .map(id => filePath(this.incrementalPath, `${id}.json`))
            .map((path => readJSON(path)))

    const fullDiff: MocksDiff = descriptor.lastFullDiff > BEGIN_VERSION
            ? await readJSON(filePath(this.fullPath, `${descriptor.lastFullDiff}.json`))
            : ZERO_MOCK_DIFF

    const incrementalDiffs = (await Promise.all(increments) as MocksDiff[])

    return [
      fullDiff,
      ...incrementalDiffs
    ].sort((a, b) => a.startVersion < b.startVersion
            ? 1
            : a.startVersion > b.startVersion
                ? -1
                : 0
        )
  }

  async saveIncremental (def: MockDefinition): Promise<VERSION> {
    const version = Date.now()
    const diff: MocksDiff = {
      def,
      type: 'incremental',
      startVersion: version,
      endVersion: version
    }

    await writeJSON(filePath(this.incrementalPath, `${version}.json`), diff)
    await writeJSON(filePath(this.path, `incremental.json`), { version })

    return version
  }

  async saveFull (def: MockDefinition): Promise<VERSION> {
    const version = Date.now()
    const diff: MocksDiff = {
      def,
      type: 'full',
      startVersion: BEGIN_VERSION,
      endVersion: version
    }

    await writeJSON(filePath(this.fullPath, `${version}.json`), diff)
    await writeJSON(filePath(this.path, `full.json`), { version })
    return version
  }

  async getLastVersion (): Promise<Descriptor> {
    let lastFullDiff: VERSION
    try {
      const fullMeta = await readJSON(filePath(this.path, `full.json`))
      lastFullDiff = fullMeta.version
    } catch (ex) {
      lastFullDiff = BEGIN_VERSION
    }

    let lastIncrementalDiff: VERSION
    try {
      const incMeta = await readJSON(filePath(this.path, `incremental.json`))
      lastIncrementalDiff = incMeta.version
    } catch (ex) {
      lastIncrementalDiff = BEGIN_VERSION
    }

    return {
      lastFullDiff,
      lastIncrementalDiff
    }
  }

}
