import { open, Database } from 'sqlite'
import { SQL } from 'sql-template-strings'
import { OnModuleDestroy } from '@nestjs/common'
import { MockStore, VERSION, MocksDiff, MockDefinition, MockType, BEGIN_VERSION } from './Store'
import { Subject, Observable } from 'rxjs'
import { Logger } from '../../common/logger'

export class SQLiteStore implements OnModuleDestroy, MockStore {

  private db: Database
  private readonly notifications = new Subject<VERSION>()

  constructor (
    readonly path: string,
    readonly migrationsPath: string,
    readonly logger: Logger) {
  }

  async load (version: VERSION): Promise<MocksDiff[]> {
    const result = await this.db.all(
      `SELECT id, type, def FROM Def WHERE id > ? ORDER BY id ASC`,
      version
    )

    return result.map(raw => {
      const [id, type, defRaw]: [number, MockType, string] = raw
      const def = JSON.parse(defRaw) as MockDefinition

      switch (type) {
        case 'incremental':
          return {
            def,
            type,
            startVersion: id,
            endVersion: id
          }
        case 'full':
          return {
            def,
            type,
            startVersion: BEGIN_VERSION,
            endVersion: id
          }
      }
    })
  }

  async save (def: MockDefinition): Promise<VERSION> {
    const result = await this.db.run(
      SQL`INSERT INTO Def (def, type) VALUES (?, ?)`,
      JSON.stringify(def),
      'incremental'
    )
    const defId = result.lastID

    const stm = await this.db.prepare(SQL`INSERT INTO Mock (mockId, defId) VALUES (?, ?)`)
    await Promise.all(def.created
      .map(mock => mock.id)
      .map(mockId => stm.run(mockId, defId)))
    await stm.finalize()

    this.notifications.next(defId)
    return defId
  }

  observeChanges (): Observable<VERSION> {
    return this.notifications
  }

  async init () {
    const { path, migrationsPath } = this
    this.db = await open(path, { verbose: true })
    await this.db.migrate({
      force: 'last',
      migrationsPath
    })
    this.logger.info({ path, migrationsPath }, 'SQLite mock store created')
  }

  async onModuleDestroy () {
    if (this.db) {
      await this.db.close()
    }
    this.logger.info('SQLite mock store closed')
  }
}
