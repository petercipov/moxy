import { Injectable, Inject } from '@nestjs/common'
import { IncomingRequest, Match } from '../mock/Mock'
import { InMemoryMatcher } from '../mock/matchers/InMemoryMatcher'
import { MATCHER } from '../mock/matchers/Matcher.provider'

export interface HTTPHandler {
  mockResponse (request: IncomingRequest, result: Match): Promise<void>
  undecided (request: IncomingRequest, mockIds: string[]): Promise<void>
  passTrough (request: IncomingRequest): Promise<void>
}

@Injectable()
export class HTTPInterceptor {

  constructor (
    @Inject(MATCHER) private matcher: InMemoryMatcher
  ) {
  }

  async intercept (request: IncomingRequest, handler: HTTPHandler) {
    const result = await this.matcher.match(request)
    if (result.length === 0) {
      await handler.passTrough(request)
    } else if (result.length === 1) {
      await handler.mockResponse(request, result[0])
    } else {
      await handler.undecided(request, result.map(resp => resp.id))
    }
  }
}
