import { IncomingHttpHeaders } from 'http'
import { KeyStringPattern, KeyRegexpPattern } from './Patterns'

export type HeaderPattern = KeyStringPattern | KeyRegexpPattern

export function compileMatcher (pattern?: HeaderPattern[]) {
  const matchers = compileDefinitions(pattern)
  return matchers.length === 0
    ? () => false
    : (headers: IncomingHttpHeaders) => matchers.every(matcher => matcher(headers))
}

function compileDefinitions (pattern?: HeaderPattern[]) {
  return (pattern || []).map(definition => {
    switch (definition.type) {
      case 'string':
        return (headers: IncomingHttpHeaders) => matchHeaderValue(
          headers[definition.key],
          (value) => definition.value === value
        )
      case 'regexp':
        const pattern = new RegExp(definition.value)
        return (headers: IncomingHttpHeaders) => matchHeaderValue(
          headers[definition.key],
          (value) => pattern.test(value)
        )
    }
  })
}

function matchHeaderValue (value: string | string [] | undefined, predicate: (val: string) => boolean) {
  const target = value || []
  return Array.isArray(target)
    ? target.some(predicate)
    : predicate(target)
}
