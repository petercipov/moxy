import { compileMatcher } from '../../../../src/modules/mock/matchers/RequestMatcher'
import { JSON_API_REQUEST, JSON_API_HEADER_MATCH_PATTERN, JSON_API_URL_MATCH_PATTERN, JSON_API_BODY_MATCH_PATTERN } from './fixtures'

describe('request matcher', () => {
  test('empty pattern will not match any request', () => {
    const matcher = compileMatcher({})
    const matches = matcher(JSON_API_REQUEST)
    expect(matches).toBeFalsy()
  })

  test('can match headers', () => {
    const matcher = compileMatcher({
      headers: JSON_API_HEADER_MATCH_PATTERN
    })
    const matches = matcher(JSON_API_REQUEST)
    expect(matches).toBeTruthy()
  })

  test('can match url', () => {
    const matcher = compileMatcher({
      url: JSON_API_URL_MATCH_PATTERN
    })
    const matches = matcher(JSON_API_REQUEST)
    expect(matches).toBeTruthy()
  })

  test('can match body', () => {
    const matcher = compileMatcher({
      body: JSON_API_BODY_MATCH_PATTERN
    })
    const matches = matcher(JSON_API_REQUEST)
    expect(matches).toBeTruthy()
  })
})
