import { UrlPattern, compileMatcher as compileUrlMatcher } from './UrlMatcher'
import { compileMatcher as compileHeaderMatcher, HeaderPattern } from './HeaderMatcher'
import { BodyPattern, compileMatcher as compileBodyMatcher } from './BodyMatcher'
import { IncomingRequest } from '../Mock'

export interface RequestPattern {
  url?: UrlPattern
  headers?: HeaderPattern[]
  body?: BodyPattern
}

export function compileMatcher (pattern: RequestPattern) {
  const matchers = [
    ...compileRequestUrlMatcher(pattern),
    ...compileRequestHeaderMatcher(pattern),
    ...compileRequestBodyMatcher(pattern)
  ]

  return matchers.length === 0
    ? () => false
    : async (request: IncomingRequest) => {
      for (const matcher of matchers) {
        const matches = await matcher(request)
        if (! matches) return false
      }
      return true
    }
}

function compileRequestUrlMatcher (pattern: RequestPattern) {
  if (! pattern.url) {
    return []
  }
  const matcher = compileUrlMatcher(pattern.url)
  return [(request: IncomingRequest) => matcher(request.url)]
}

function compileRequestHeaderMatcher (pattern: RequestPattern) {
  if (! pattern.headers) {
    return []
  }
  const matcher = compileHeaderMatcher(pattern.headers)
  return [(request: IncomingRequest) => matcher(request.headers)]
}

function compileRequestBodyMatcher (pattern: RequestPattern) {
  if (! pattern.body) {
    return []
  }
  const matcher = compileBodyMatcher(pattern.body)
  return [(request: IncomingRequest) => matcher(request.body)]
}
