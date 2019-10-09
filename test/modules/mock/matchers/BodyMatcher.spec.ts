import { compileMatcher } from '../../../../src/modules/mock/matchers/BodyMatcher'
import { JSON_API_BODY } from './fixtures'

describe('body matcher', () => {
  test('empty pattern will not match any body', () => {
    const match = compileMatcher()
    const matches = match(JSON_API_BODY)

    expect(matches).toBeFalsy()
  })

  test('body is matched by exact string', async () => {
    const value = await JSON_API_BODY.value()
    const matcher = compileMatcher({
      type: 'string',
      value
    })
    const matches = matcher(JSON_API_BODY)
    expect(matches).toBeTruthy()
  })

  test('body is matched by pattern', () => {
    const matcher = compileMatcher({
      type: 'regexp',
      value: 'doggie'
    })
    const matches = matcher(JSON_API_BODY)
    expect(matches).toBeTruthy()
  })
})
