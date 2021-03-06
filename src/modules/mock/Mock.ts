import { OutgoingHttpHeaders, IncomingHttpHeaders } from 'http'
import { RequestPattern, compileMatcher } from './matchers/RequestMatcher'
import { IncomingURL } from './matchers/UrlMatcher'
import { IncomingBody } from './matchers/BodyMatcher'

export type MockId = string
export type MockGroupId = string

export interface Mock {
  readonly id: MockId,
  readonly groupId: MockGroupId,
  readonly host: string,
  readonly request: RequestPattern,
  readonly response: MockResponse,
}

export function mockEquals(id1: MockId, id2: MockId): boolean {
  return id1 === id2;
}

export interface MockResponse {
  type: 'static',
  status: number,
  headers?: OutgoingHttpHeaders,
  body?: string
}

export interface Match {
  response: MockResponse,
  id: MockId
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
    this.matcher = compileMatcher(mock.request)
    this.response = mock.response
    this.id = mock.id
    this.groupId = mock.groupId
  }

  public async handle (request: IncomingRequest): Promise<Match | undefined > {
    const matches = this.matcher(request)
    return matches
      ? { id: this.id, response: this.response }
      : undefined
  }
}
