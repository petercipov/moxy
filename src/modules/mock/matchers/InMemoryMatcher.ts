import { IncomingRequest, MockHandler, Mock, Match } from '../Mock'
import { MocksDiff, BEGIN_VERSION, VERSION, MockDefinition } from '../store/Store'

type Handler = { handler: MockHandler, mock: Mock }

export class InMemoryMatcher {
  private version: VERSION = BEGIN_VERSION

  private handlers = new Map<string, Handler>()
  private groupIndex = new GroupIndex()

  getVersion (): number {
    return this.version
  }

  applyDiff (definitions: MocksDiff): boolean {
    const currentVersion = this.getVersion()
    const startVersionCheck = definitions.type === 'full'
      ? definitions.startVersion === BEGIN_VERSION
      : definitions.startVersion >= currentVersion

    const endVersionCheck = definitions.endVersion > currentVersion

    if (!endVersionCheck || !startVersionCheck) {
      return false
    }

    definitions.def.created
      .forEach(mock => this.createMock(mock))

    definitions.def.purged
      .forEach(mockId => this.purgeMock(mockId))

    definitions.def.purgedGroups
      .forEach(groupId => this.purgeGroup(groupId))

    this.version = definitions.endVersion
    return true
  }

  fullDiff (): MockDefinition {
    return {
      purged: [],
      purgedGroups: [],
      created: [ ...this.handlers.values() ].map(handler => handler.mock)
    }
  }

  private createMock (mock: Mock) {
    this.handlers.set(mock.id, {
      mock,
      handler: new MockHandler(mock)
    })

    this.groupIndex.put(mock.groupId, mock.id)
  }

  private purgeMock (mockId: string) {
    const definition = this.handlers.get(mockId)

    if (definition) {
      const { id, groupId } = definition.mock
      this.groupIndex.delete(groupId, id)
      this.handlers.delete(id)
    }
  }

  private purgeGroup (groupId: string) {
    this.groupIndex
      .groupBy(groupId)
      .forEach(mockId => this.purgeMock(mockId))
  }

  async match (req: IncomingRequest): Promise<Match[]> {
    const matches: Match[] = []

    for (let def of this.handlers.values()) {
      const match = await def.handler.handle(req)
      if (match) {
        matches.push(match)
      }
    }

    return matches
  }
}

class GroupIndex {
  private index = new Map<string, Set<string>>()

  put (key: string, value: string) {
    let group = this.index.get(key)
    if (!group) {
      group = new Set()
      this.index.set(key, group)
    }

    group.add(value)
  }

  delete (key: string, value: string) {
    const group = this.index.get(key)

    if (group) {
      group.delete(value)
      if (group.size === 0) {
        this.index.delete(key)
      }
    }
  }

  groupBy (key: string) {
    const group = this.index.get(key)

    return group
      ? Array.from(group.values())
      : []
  }

}
