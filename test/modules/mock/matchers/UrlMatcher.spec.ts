import { compileMatcher } from '../../../../src/modules/mock/matchers/UrlMatcher'
import { JSON_API_URL } from './fixtures'

describe('url matcher', () => {
  test('empty pattern will not match any request', () => {
    const matcher = compileMatcher({})
    const matches = matcher(JSON_API_URL)
    expect(matches).toBeFalsy()
  })

  test('method is matched by exact string', () => {
    const matcher = compileMatcher({
      method: {
        type: 'string',
        value: 'POST'
      }
    })
    const matches = matcher(JSON_API_URL)
    expect(matches).toBeTruthy()
  })

  test('path is matched by exact string', () => {
    const matcher = compileMatcher({
      path: {
        type: 'string',
        value: '/v2/pet'
      }
    })
    const matches = matcher(JSON_API_URL)
    expect(matches).toBeTruthy()
  })

  test('path is matched by regexp', () => {
    const matcher = compileMatcher({
      path: {
        type: 'regexp',
        value: 'pet'
      }
    })
    const matches = matcher(JSON_API_URL)
    expect(matches).toBeTruthy()
  })

  test('query is matched by string', () => {
    const matcher = compileMatcher({
      query: [
        { type: 'string', key: 'some', value: 'val' }
      ]
    })
    const matches = matcher(JSON_API_URL)
    expect(matches).toBeTruthy()
  })

  test('query is matched by regexp', () => {
    const matcher = compileMatcher({
      query: [
        { type: 'regexp', key: 'some', value: 'val' }
      ]
    })
    const matches = matcher(JSON_API_URL)
    expect(matches).toBeTruthy()
  })

  test('host is matched by exact string', () => {
    const matcher = compileMatcher({
      host: {
        type: 'string',
        value: 'petstore.swagger.io'
      }
    })
    const matches = matcher(JSON_API_URL)
    expect(matches).toBeTruthy()
  })

  test('host is matched by regexp', () => {
    const matcher = compileMatcher({
      host: {
        type: 'regexp',
        value: 'store'
      }
    })
    const matches = matcher(JSON_API_URL)
    expect(matches).toBeTruthy()
  })

  test('port is matched by exact string', () => {
    const matcher = compileMatcher({
      port: {
        type: 'string',
        value: '443'
      }
    })
    const matches = matcher(JSON_API_URL)
    expect(matches).toBeTruthy()
  })

  test('port is matched by regexp', () => {
    const matcher = compileMatcher({
      port: {
        type: 'regexp',
        value: '4'
      }
    })
    const matches = matcher(JSON_API_URL)
    expect(matches).toBeTruthy()
  })

})
