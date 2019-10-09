import { OutgoingHttpHeaders, IncomingHttpHeaders } from 'http'
import { RequestPattern, compileMatcher } from './matchers/RequestMatcher'
import { IncomingURL } from './matchers/UrlMatcher'
import { IncomingBody } from './matchers/BodyMatcher'

export interface Mock {
  readonly id: string,
  readonly groupId: string,
  readonly host: string,
  readonly pattern: RequestPattern,
  readonly response: MockResponse,
}

export interface MockResponse {
  type: 'static',
  mockId: string,
  status: number,
  headers?: OutgoingHttpHeaders,
  body?: string
}

export interface IncomingRequest {
  id: string
  url: IncomingURL
  headers: IncomingHttpHeaders,
  body: IncomingBody,
}

export class MockHandler {

  readonly id: string
  readonly groupId: string
  private readonly matcher: ((request: IncomingRequest) => boolean) | ((request: IncomingRequest) => Promise<boolean>)
  private readonly response: MockResponse

  constructor (mock: Mock) {
    this.matcher = compileMatcher(mock.pattern)
    this.response = mock.response
    this.id = mock.id
    this.groupId = mock.groupId
  }

  public async handle (request: IncomingRequest): Promise<MockResponse | undefined > {
    const matches = this.matcher(request)
    return matches ? this.response : undefined
  }
}
