import { Mock, MockHandler, IncomingRequest, MockResponse } from './Mock'
import { MocksDiff, BEGIN_VERSION, VERSION } from './store/Store'

export type MockDefinition = { handler: MockHandler, mock: Mock }
export type DomainMocks = { [key: string]: { [key: string]: MockDefinition } }
export type IdDomainReverseIndex = { [key: string]: string }

export class InMemoryMatcher {
  private domainHandlers: DomainMocks = {}
  private idDomainReverseIndex: IdDomainReverseIndex = {}
  private groupIndex: { [key: string]: string[] } = {}
  private version: VERSION = BEGIN_VERSION

  getVersion (): number {
    return this.version
  }

  applyDiff (definitions: MocksDiff) {
    if (definitions.endVersion <= this.version) {
      return false
    }

    if (definitions.type === 'full') {
      this.reset()
    }

    this.version = definitions.endVersion
    definitions.def.created.forEach(mock => this.insertMock(mock))
    definitions.def.purged.forEach(mockId => this.deleteMock(mockId))
    definitions.def.purgedGroups.forEach(groupId => this.deleteGroup(groupId))
    return true
  }

  private reset () {
    this.version = 0
    this.domainHandlers = {}
    this.idDomainReverseIndex = {}
    this.groupIndex = {}
  }

  private insertMock (mock: Mock) {
    let handlerPerDomain = this.domainHandlers[mock.host]
    if (! handlerPerDomain) {
      handlerPerDomain = {}
      this.domainHandlers[mock.host] = handlerPerDomain
    }
    if (! handlerPerDomain[mock.id]) {
      handlerPerDomain[mock.id] = {
        handler: new MockHandler(mock),
        mock
      }
      this.idDomainReverseIndex[mock.id] = mock.host
    }
    let groupIndex = this.groupIndex[mock.groupId]
    if (! this.groupIndex[mock.groupId]) {
      groupIndex = []
      this.groupIndex[mock.groupId] = groupIndex
    }
    groupIndex.push(mock.id)
  }

  private deleteMock (id: string) {
    const domain = this.idDomainReverseIndex[id]
    const handler = this.domainHandlers[domain][id].handler
    const groupId = handler.groupId
    delete this.idDomainReverseIndex[id]
    delete this.domainHandlers[domain][id]
    if (this.groupIndex[groupId]) {
      this.groupIndex[groupId] = this.groupIndex[groupId].filter(indexId => indexId !== id)
    }
  }

  private deleteGroup (groupId: string) {
    const ids = this.groupIndex[groupId]
    delete this.groupIndex[groupId]

    if (ids) {
      ids.forEach(id => this.deleteMock(id))
    }
  }

  buildDiff (): MocksDiff {
    const created: Mock[] = this
      .validMocks()
      .map(def => def.mock)

    return {
      type: 'full',
      def: {
        created,
        purged: [],
        purgedGroups: []
      },
      startVersion: BEGIN_VERSION,
      endVersion: this.version
    }
  }

  private validMocks (): MockDefinition[] {
    return Object.keys(this.domainHandlers).map(domain => {
      return Object
        .keys(this.domainHandlers[domain])
        .map(mockId => this.domainHandlers[domain][mockId])
    }).flat()
  }

  async match (req: IncomingRequest): Promise<MockResponse[]> {
    const res: MockResponse[] = []
    const perDomainHandlers = this.domainHandlers[req.url.host] || {}
    for (const mockId of Object.keys(perDomainHandlers)) {
      const mock = perDomainHandlers[mockId].handler
      const response = await mock.handle(req)
      if (response) {
        res.push(
          response
        )
      }
    }
    return res
  }
}
