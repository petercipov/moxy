import { IncomingHttpHeaders } from 'http'
import { IncomingURL, UrlPattern } from '../../../../src/modules/mock/matchers/UrlMatcher'
import { BodyPattern, IncomingBody } from '../../../../src/modules/mock/matchers/BodyMatcher'
import { IncomingRequest, Mock } from '../../../../src/modules/mock/Mock'
import { HeaderPattern } from '../../../../src/modules/mock/matchers/HeaderMatcher'

export const JSON_AP_HEADERS: IncomingHttpHeaders = {
  accept: 'application/json',
  'accept-encoding': 'gzip, deflate, br',
  'accept-language': 'en-US,en;q=0.9',
  'connection': 'keep-alive',
  'content-length': '215',
  'content-type': 'application/json',
  cookie: '_ga=GA1.2.240794609.1567697494; _gid=GA1.2.1527622721.1567697494; _gat_UA-404707-34=1',
  host: 'petstore.swagger.io',
  origin: 'https://petstore.swagger.io',
  referer: 'https://petstore.swagger.io/',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.137 Safari/537.36 Vivaldi/2.7.1628.33'
}

export const JSON_API_URL: IncomingURL = {
  scheme: 'https',
  port: '443',
  host: 'petstore.swagger.io',
  method: 'POST',
  path: '/v2/pet',
  query: {
    some: 'val'
  }
}

export const JSON_API_BODY: IncomingBody = {
  value: async () => JSON.stringify({
    id: 0,
    category: {
      id: 0,
      name: 'string'
    },
    name: 'doggie',
    photoUrls: [
      'string'
    ],
    tags: [
      {
        id: 0,
        name: 'string'
      }
    ],
    status: 'available'
  })
}

export const JSON_API_REQUEST: IncomingRequest = {
  id: 'some id',
  url: JSON_API_URL,
  headers: JSON_AP_HEADERS,
  body: JSON_API_BODY
}

export const JSON_API_HEADER_MATCH_PATTERN: HeaderPattern[] = [
  { type: 'string', key: 'content-type', value: 'application/json' },
  { type: 'regexp', key: 'user-agent', value: 'Chrome' }
]

export const JSON_API_URL_MATCH_PATTERN: UrlPattern = {
  method: {
    type: 'string',
    value: 'POST'
  },
  path: {
    type: 'string',
    value: '/v2/pet'
  }
}

export const JSON_API_BODY_MATCH_PATTERN: BodyPattern = {
  type: 'regexp',
  value: 'doggie'
}

export const JSON_REQUEST_MOCK: Mock = {
  id: 'some json mock id',
  groupId: 'some json mock group id',
  host: 'petstore.swagger.io',
  request: {
    url: JSON_API_URL_MATCH_PATTERN
  },
  response: {
    type: 'static',
    status: 200
  }
}
