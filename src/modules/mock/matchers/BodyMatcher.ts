import { StringPattern, RegexpPattern } from './Patterns'

export type BodyPattern = StringPattern | RegexpPattern

export interface IncomingBody {
  value (): Promise<string>
}

export function compileMatcher (pattern?: BodyPattern) {
  const matchers = [
    ...(pattern ? [compileBodyMatcher(pattern)] : [])
  ]

  return matchers.length === 0
    ? () => false
    : async (value: IncomingBody) => {
      for (const matcher of matchers) {
        const matches = await matcher(value)
        if (! matches) return false
      }
      return true
    }
}

function compileBodyMatcher (pattern: StringPattern | RegexpPattern) {
  switch (pattern.type) {
    case 'string':
      return async (body: IncomingBody) => pattern.value === await body.value()
    case 'regexp':
      const expression = new RegExp(pattern.value)
      return async (body: IncomingBody) => expression.test(await body.value())
  }
}
