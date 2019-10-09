import { Observable } from 'rxjs'
import { Mock } from '../Mock'

export type VERSION = number

export type MockType = 'incremental' | 'full'

export const BEGIN_VERSION: VERSION = 0

export interface MockDefinition {
  created: Mock[],
  purged: string[]
  purgedGroups: string []
}

export interface MocksDiff {
  type: MockType
  def: MockDefinition
  startVersion: VERSION
  endVersion: VERSION
}

export interface MockStore {
  load (version: VERSION): Promise<MocksDiff[]>
  save (def: MockDefinition): Promise<VERSION>
  observeChanges (): Observable<VERSION>
}
