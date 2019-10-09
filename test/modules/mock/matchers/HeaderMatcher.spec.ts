import { compileMatcher } from '../../../../src/modules/mock/matchers/HeaderMatcher'
import { JSON_AP_HEADERS, JSON_API_HEADER_MATCH_PATTERN } from './fixtures'

describe('header matcher', () => {
  test('empty pattern will not match any headers', () => {
    const matcher = compileMatcher()
    const matches = matcher(JSON_AP_HEADERS)
    expect(matches).toBeFalsy()
  })

  test('is should not match for empty header definitions', () => {
    const matcher = compileMatcher([])
    const matches = matcher({})

    expect(matches).toBeFalsy()
  })

  test('header is matched by string pattern', () => {
    const matcher = compileMatcher(
      [{ type: 'string', key: 'content-type', value: 'application/json' }]
    )
    const matches = matcher(JSON_AP_HEADERS)

    expect(matches).toBeTruthy()
  })

  test('header is NOT matched by string pattern if pattern does not match', () => {
    const matcher = compileMatcher(
      [{ type: 'string', key: 'content-type', value: 'not match' }]
    )
    const matches = matcher(JSON_AP_HEADERS)

    expect(matches).toBeFalsy()
  })

  test('header is matched by regexp pattern', () => {
    const matcher = compileMatcher(
      [{ type: 'regexp', key: 'content-type', value: '.' }]
    )
    const matches = matcher(JSON_AP_HEADERS)

    expect(matches).toBeTruthy()
  })

  test('header is NOT matched by regexp pattern', () => {
    const matcher = compileMatcher(
      [{ type: 'regexp', key: 'content-type', value: 'not match' }]
    )
    const matches = matcher(JSON_AP_HEADERS)

    expect(matches).toBeFalsy()
  })

  test('multiple patterns has to be satisfied to match', () => {
    const matcher = compileMatcher(JSON_API_HEADER_MATCH_PATTERN)
    const matches = matcher(JSON_AP_HEADERS)

    expect(matches).toBeTruthy()
  })

  test('if one pattern does not match, headers do not match', () => {
    const matcher = compileMatcher([
      { type: 'string', key: 'content-type', value: 'not match' },
      { type: 'regexp', key: 'user-agent', value: 'Chrome' }
    ])
    const matches = matcher(JSON_AP_HEADERS)

    expect(matches).toBeFalsy()
  })

  test('if multiple values are provided in a header, some of values  has to match', () => {
    const matcher = compileMatcher([
      { type: 'string', key: 'set-cookie', value: 'efgh' }
    ])
    const matches = matcher({
      'set-cookie': ['abcd', 'efgh', 'ijkl']
    })

    expect(matches).toBeTruthy()
  })

  test('if empty array header, header does not match', () => {
    const matcher = compileMatcher([
      { type: 'string', key: 'set-cookie', value: 'efgh' }
    ])
    const matches = matcher({
      'set-cookie': []
    })

    expect(matches).toBeFalsy()
  })

  test('if undefined header, header does not match', () => {
    const matcher = compileMatcher([
      { type: 'string', key: 'content-type', value: 'json' }
    ])
    const matches = matcher({
      'content-type': undefined
    })

    expect(matches).toBeFalsy()
  })
})
