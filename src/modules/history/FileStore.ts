import { IncomingRequest, MockResponse } from '../mock/Mock'
import { appendFile, readDir, readFile, deleteFile, filePath, writeFile } from '../common/files'
import { MockHistoryRecord, MockHistoryRequest, HistoryStore } from './Store'

export class FileStore implements HistoryStore {

  constructor (
    readonly historiesPath: string,
    readonly requestsPath: string
  ) {}

  async storeHistory (request: IncomingRequest, response: MockResponse, now: Date): Promise<void> {
    const requestId = request.id
    const record: MockHistoryRecord = {
      requestId,
      date: now.toISOString()
    }

    const reqRecord: MockHistoryRequest = {
      date: now.toISOString(),
      mockId: response.mockId,
      request,
      response
    }

    await appendFile(
      this.historyPath(response.mockId),
      JSON.stringify(record)
    )

    await writeFile(
      this.requestPath(requestId),
      JSON.stringify(reqRecord)
    )
  }

  async loadHistoryIds (): Promise<string[]> {
    return readDir(this.historiesPath)
  }

  async loadHistory (mockId: string): Promise<MockHistoryRecord[]> {
    const data = await readFile(this.historyPath(mockId))

    return data
      .split('\n')
      .map(line => JSON.parse(line.trim()) as MockHistoryRecord)
      .reverse()
  }

  async loadRequest (requestId: string): Promise<MockHistoryRequest> {
    const data = await readFile(this.requestPath(requestId))
    return JSON.parse(data) as MockHistoryRequest
  }

  async deleteHistory (mockId: string): Promise<void> {
    const records = await this.loadHistory(mockId)

    await Promise.all(records
      .map(record => deleteFile(this.requestPath(record.requestId))))

    await deleteFile(this.historyPath(mockId))
  }

  private historyPath (mockId: string) {
    return filePath(this.historiesPath, `${mockId}.json`)
  }

  private requestPath (requestId: string) {
    return filePath(this.requestsPath, `${requestId}.json`)
  }
}
