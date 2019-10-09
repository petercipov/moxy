import { StringPattern, RegexpPattern, KeyStringPattern, KeyRegexpPattern } from './Patterns'

export type CombinedPattern = StringPattern | RegexpPattern
export type QueryPattern = KeyStringPattern | KeyRegexpPattern

export interface UrlPattern {
  scheme?: CombinedPattern
  host?: CombinedPattern
  port?: CombinedPattern
  method?: CombinedPattern
  path?: CombinedPattern
  query?: QueryPattern[]
}

type URL_FIELDS = 'scheme' | 'method' | 'port' | 'host' | 'path'

export interface IncomingURL {
  scheme: string
  method: string,
  port: string,
  host: string,
  path: string,
  query: any
}

export function compileMatcher (pattern: UrlPattern) {
  const matchers = [
    ...(pattern.method ? [compileFieldMatcher(pattern.method, 'method')] : []),
    ...(pattern.host ? [compileFieldMatcher(pattern.host, 'host')] : []),
    ...(pattern.port ? [compileFieldMatcher(pattern.port, 'port')] : []),
    ...(pattern.path ? [compileFieldMatcher(pattern.path, 'path')] : []),
    ...(pattern.query ? pattern.query.map(compileQueryMatcher) : [])
  ]

  return matchers.length === 0
    ? () => false
    : (url: IncomingURL) => matchers.every(matcher => matcher(url))
}

function compileFieldMatcher (pattern: CombinedPattern, field: URL_FIELDS) {
  switch (pattern.type) {
    case 'string':
      return (url: IncomingURL) => pattern.value === url[field]
    case 'regexp':
      const expression = new RegExp(pattern.value)
      return (url: IncomingURL) => expression.test(url[field])
  }
}

function compileQueryMatcher (pattern: QueryPattern) {
  switch (pattern.type) {
    case 'string':
      return (url: IncomingURL) => pattern.value === url.query[pattern.key]
    case 'regexp':
      const expression = new RegExp(pattern.value)
      return (url: IncomingURL) => expression.test(url.query[pattern.key])
  }
}
