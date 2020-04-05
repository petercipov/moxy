import { InMemoryMatcher } from '../../../src/modules/mock/matchers/InMemoryMatcher'
import { BEGIN_VERSION } from '../../../src/modules/mock/store/Store'
import { VALID_FULL_DIFF, INVALID_FULL_DIFF, VALID_INCREMENTAL_DIFF, VALID_INCREMENTAL_DIFF_2, VALID_INCREMENTAL_PURGE, VALID_INCREMENTAL_PURGE_GROUP, UNKNOWN_MOCK_PURGE_DIFF } from './fixtures'
import { JSON_API_REQUEST } from './matchers/fixtures'

describe('In Memory Matcher', () => {

  let matcher: InMemoryMatcher

  beforeEach(() => {
    matcher = new InMemoryMatcher()
  })

  test('empty matcher is of version BEGIN_VERSION', () => {
    expect(matcher.getVersion()).toEqual(BEGIN_VERSION)
  })

  describe('full diff', () => {
    test('will increase version number to diff end version', () => {
      const applied = matcher.applyDiff(VALID_FULL_DIFF)
      expect(matcher.getVersion()).toEqual(VALID_FULL_DIFF.endVersion)
      expect(applied).toBeTruthy()
    })

    test('will not be applied if does not start with BEGIN_VERSION', () => {
      const applied = matcher.applyDiff(INVALID_FULL_DIFF)
      expect(applied).toBeFalsy()
    })

    test('will not be applied twice', () => {
      const firstApply = matcher.applyDiff(VALID_FULL_DIFF)
      const secondApply = matcher.applyDiff(VALID_FULL_DIFF)
      expect(firstApply).toBeTruthy()
      expect(secondApply).toBeFalsy()
    })
  })

  describe('incremental diff', () => {
    test('will increase version number to diff end version', () => {
      const apply = matcher.applyDiff(VALID_INCREMENTAL_DIFF)
      expect(matcher.getVersion()).toEqual(VALID_INCREMENTAL_DIFF.endVersion)
      expect(apply).toBeTruthy()
    })

    test('will not be applied twice', () => {
      const firstApply = matcher.applyDiff(VALID_INCREMENTAL_DIFF)
      const secondApply = matcher.applyDiff(VALID_INCREMENTAL_DIFF)
      expect(firstApply).toBeTruthy()
      expect(secondApply).toBeFalsy()
    })

    test('has to start with version X to be applied over current matcher version X', () => {
      matcher.applyDiff(VALID_INCREMENTAL_DIFF)
      const secondApply = matcher.applyDiff(VALID_INCREMENTAL_DIFF_2)

      expect(secondApply).toBeTruthy()
    })
  })

  describe('matching', () => {
    test('empty matcher will not match request', async () => {
      const responses = await matcher.match(JSON_API_REQUEST)
      expect(responses.length).toEqual(0)
    })

    test('will match request, when pattern matcher', async () => {
      matcher.applyDiff(VALID_FULL_DIFF)
      const responses = await matcher.match(JSON_API_REQUEST)
      expect(responses.length).toEqual(1)
    })
  })

  describe('purging', () => {
    test('mock can be purged', async () => {
      matcher.applyDiff(VALID_INCREMENTAL_DIFF)
      matcher.applyDiff(VALID_INCREMENTAL_PURGE)

      const responses = await matcher.match(JSON_API_REQUEST)

      expect(responses.length).toEqual(0)

    })

    test('mock group can be purged', async () => {
      matcher.applyDiff(VALID_INCREMENTAL_DIFF)
      matcher.applyDiff(VALID_INCREMENTAL_PURGE_GROUP)

      const responses = await matcher.match(JSON_API_REQUEST)

      expect(responses.length).toEqual(0)

    })

    test('unknown mock purge will be ommited', async () => {
      matcher.applyDiff(VALID_INCREMENTAL_DIFF)
      matcher.applyDiff(UNKNOWN_MOCK_PURGE_DIFF)

      const responses = await matcher.match(JSON_API_REQUEST)

      expect(responses.length).toEqual(1)
    })

    test('unknown mock group purge will be ommited', async () => {
      matcher.applyDiff(VALID_INCREMENTAL_DIFF)
      matcher.applyDiff(UNKNOWN_MOCK_PURGE_DIFF)

      const responses = await matcher.match(JSON_API_REQUEST)

      expect(responses.length).toEqual(1)
    })
  })
})
