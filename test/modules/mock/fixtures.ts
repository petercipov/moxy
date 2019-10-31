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

export const VALID_FULL_DIFF: MocksDiff = nextVersionOf(BEGIN_VERSION, {
  type: 'full',
  def: VALID_DEF
})

export const VALID_INCREMENTAL_DIFF: MocksDiff = nextVersionOf(BEGIN_VERSION, {
  type: 'incremental',
  def: VALID_DEF
})

export const VALID_INCREMENTAL_PURGE: MocksDiff = nextVersionOf(VALID_INCREMENTAL_DIFF, {
  type: 'incremental',
  def: {
    created: [],
    purged: [
      VALID_INCREMENTAL_DIFF.def.created[0].id
    ],
    purgedGroups: []
  }
})

export const VALID_INCREMENTAL_PURGE_GROUP: MocksDiff = nextVersionOf(VALID_INCREMENTAL_DIFF, {
  type: 'incremental',
  def: {
    created: [],
    purged: [],
    purgedGroups: [
      VALID_INCREMENTAL_DIFF.def.created[0].groupId
    ]
  }
})

export const VALID_INCREMENTAL_DIFF_2: MocksDiff = nextVersionOf(VALID_INCREMENTAL_DIFF, {
  type: 'incremental',
  def: VALID_DEF
})

export const UNKNOWN_MOCK_PURGE_DIFF = nextVersionOf(VALID_INCREMENTAL_DIFF, {
  type: 'incremental',
  def: {
    created:[],
    purgedGroups: [],
    purged: [
      'unknown id'
    ]
  }
})

export const UNKNOWN_MOCK_GROUP_PURGE_DIFF = nextVersionOf(VALID_INCREMENTAL_DIFF, {
  type: 'incremental',
  def: {
    created:[],
    purgedGroups: [
      'unknown id'
    ],
    purged: []
  }
})

function nextVersionOf(diff: any, next: Omit<MocksDiff, 'startVersion' | 'endVersion'>): MocksDiff {
  const { def, type } = next
  
  const version = diff.endVersion ? diff.endVersion : diff
  
  return {
    def,
    type,
    startVersion: version,
    endVersion: version + 1
  }
}