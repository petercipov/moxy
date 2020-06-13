import { Mock, MockId } from '../Mock'

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

export interface Descriptor {
  lastFullDiff: VERSION
  lastIncrementalDiff: VERSION
}

export interface Store {
  lookup(id: MockId): Promise<MocksDiff | undefined>
  load (descriptor: Descriptor): Promise<MocksDiff[]>
  saveIncremental (def: MockDefinition): Promise<VERSION>
  saveFull (def: MockDefinition): Promise<VERSION>
  getLastVersion (): Promise<Descriptor>
}

export function newMockDefinition (mock: Mock): MockDefinition {
  return {
    created: [mock],
    purged: [],
    purgedGroups: []
  }
}
