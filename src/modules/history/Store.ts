import { IncomingRequest, MockResponse } from '../mock/Mock'

export interface MockHistoryRecord {
  date: string
  requestId: string
}

export interface MockHistoryRequest {
  mockId: string
  date: string
  request: IncomingRequest,
  response: MockResponse
}

export interface HistoryStore {
  storeHistory (request: IncomingRequest, response: MockResponse, now: Date): Promise<void>
  loadHistoryIds (): Promise<string[]>
  loadHistory (mockId: string): Promise<MockHistoryRecord[]>
  deleteHistory (mockId: string): Promise<void>
  loadRequest (requestId: string): Promise<MockHistoryRequest>
}
