import { MocksDiff, BEGIN_VERSION, MockDefinition } from '../../../src/modules/mock/store/Store'
import { JSON_REQUEST_MOCK } from './matchers/fixtures'

export const VALID_DEF: MockDefinition = {
  purged: [],
  purgedGroups: [],
  created: [
    JSON_REQUEST_MOCK
  ]
}

export const INVALID_FULL_DIFF: MocksDiff = {
  type: 'full',
  startVersion: -1,
  endVersion: BEGIN_VERSION + 1,
  def: VALID_DEF
}

export const VALID_FULL_DIFF: MocksDiff = {
  type: 'full',
  startVersion: BEGIN_VERSION,
  endVersion: BEGIN_VERSION + 1,
  def: VALID_DEF
}

export const VALID_INCREMENTAL_DIFF: MocksDiff = {
  type: 'incremental',
  startVersion: BEGIN_VERSION,
  endVersion: BEGIN_VERSION + 1,
  def: VALID_DEF
}

export const VALID_INCREMENTAL_PURGE: MocksDiff = {
  type: 'incremental',
  startVersion: VALID_INCREMENTAL_DIFF.endVersion,
  endVersion: VALID_INCREMENTAL_DIFF.endVersion + 1,
  def: {
    created: [],
    purged: [
      VALID_INCREMENTAL_DIFF.def.created[0].id
    ],
    purgedGroups: []
  }
}

export const VALID_INCREMENTAL_PURGE_GROUP: MocksDiff = {
  type: 'incremental',
  startVersion: VALID_INCREMENTAL_DIFF.endVersion,
  endVersion: VALID_INCREMENTAL_DIFF.endVersion + 1,
  def: {
    created: [],
    purged: [],
    purgedGroups: [
      VALID_INCREMENTAL_DIFF.def.created[0].groupId
    ]
  }
}

export const VALID_INCREMENTAL_DIFF_2: MocksDiff = {
  type: 'incremental',
  startVersion: VALID_INCREMENTAL_DIFF.endVersion,
  endVersion: VALID_INCREMENTAL_DIFF.endVersion + 1,
  def: VALID_DEF
}
