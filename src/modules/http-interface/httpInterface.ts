import { Injectable, OnModuleInit, OnModuleDestroy, Inject, Scope } from '@nestjs/common'
import { Logger, LOGGER } from '../common/logger'
import * as http from 'http'
import * as https from 'https'
import { parse, URLSearchParams } from 'url'
import { ConfigService } from '../common/config'
import { IncomingRequest, MockResponse } from '../mock/Mock'
import v4 from 'uuid/v4'
import { IncomingBody } from '../mock/matchers/BodyMatcher'
import { ResponseHandler } from '../interceptor/RequestInterceptor'

@Injectable({
  scope: Scope.DEFAULT
})
export class HttpInterface implements OnModuleInit, OnModuleDestroy {

  private server: http.Server

  constructor (
    @Inject(LOGGER) private logger: Logger,
    private readonly config: ConfigService
  ) {
    this.server = http.createServer(this.handle.bind(this))
  }

  private urlFromOverride (req: http.IncomingMessage) {
    const origin = req.headers['x-moxy-origin']
    if (! origin) {
      return
    }

    delete req.headers['x-moxy-origin']
    return parse(`${origin}${req.url}`, true)
  }

  private urlFormRequest (req: http.IncomingMessage) {
    const scheme = 'http'
    const rawHost = req.headers['host']
    if (! rawHost) {
      return
    }

    const hostChunks = rawHost.split(':')
    const host = hostChunks[0]
    const port = hostChunks[1]

    return parse(`${scheme}://${host}:${port}${req.url}`, true)
  }

  async handle (req: http.IncomingMessage, res: http.ServerResponse) {
    this.logger.info(`Incoming ${req.url}`)

    let inUrl = this.urlFromOverride(req)
    if (! inUrl) {
      inUrl = this.urlFormRequest(req)
    }

    if (!inUrl || ! req.method || !inUrl.pathname || !inUrl.host || !inUrl.protocol) {
      res.writeHead(400, { 'Content-Type': 'text/plain' })
      res.end('missing some parts')
      return
    }
    const scheme = inUrl.protocol.split(':')[0]

    let port = inUrl.port
    if (! port) {
      switch (scheme) {
        case 'http':
          port = '80'
          break
        case 'https':
          port = '443'
          break
        default:
          res.writeHead(400, { 'Content-Type': 'text/plain' })
          res.end(`Unknown port ${port}`)
          return
      }
    }

    const idHeaderName = this.config.requireString('HTTP_INTERFACE_REQUEST_ID_HEADER')

    const incomingRequest: IncomingRequest = {
      id: [req.headers[idHeaderName] || v4()].flat()[0],
      url: {
        method: req.method,
        scheme,
        host: inUrl.host.split(':')[0],
        port,
        path: inUrl.pathname,
        query: inUrl.query
      },
      headers: req.headers,
      body: new MemoizeIncomingBody(req)
    }

    console.log(incomingRequest)

    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('okay')
  }

  onModuleInit () {
    const port = this.config.get('HTTP_INTERFACE_PORT')
    return new Promise((resolve, reject) => {
      if (this.server.listening) {
        this.logger.info('HTTP interface already started ')
        resolve()
      } else {
        try {
          this.server.listen(port, () => {
            this.logger.info({ port }, 'HTTP interface started')
            resolve()
          })
        } catch (err) {
          this.logger.error({ err }, 'HTTP interface failed to start ')
          reject(err)
        }
      }
    })
  }

  onModuleDestroy () {
    return new Promise((resolve, reject) => {
      if (this.server.listening) {
        this.server.close((err?: Error) => {
          if (err) {
            this.logger.error({ err }, 'HTTP interface failed to close')
            reject(err)
          } else {
            this.logger.info({ err }, 'HTTP interface closed')
            resolve()
          }
        })
      } else {
        this.logger.info('HTTP interface already closed')
        resolve()
      }
    })
  }
}

export class MemoizeIncomingBody implements IncomingBody {

  private resolver: Promise<string>
  private buffer = ''

  constructor (private req: http.IncomingMessage) {}

  async value () {
    if (! this.materialized()) {
      this.resolver = new Promise((resolve, reject) => {
        this.buffer = ''
        this.req.on('data', (data) => {
          this.buffer += data
        })
        this.req.on('error', (err) => reject(err))
        this.req.on('end', () => resolve(this.buffer))
      })
    }
    return this.resolver
  }

  materialized (): boolean {
    return !!this.resolver
  }

  public toJSON () {
    return {
      value: this.materialized() ? this.buffer : undefined
    }
  }
}

export class HTTPResponseHandle implements ResponseHandler {

  constructor (
    private res: http.ServerResponse
  ) {}

  async undecided (mockIds: string[]) {
    this.res.setHeader('x-moxy-conflicting', mockIds)
    this.res.writeHead(409).end()
  }

  async passTrough (request: IncomingRequest) {
    const params = new URLSearchParams(request.url.query)
    const path = request.url.path + (params.entries.length === 0 ? '' : `?${params.toString()}`)
    const options: http.RequestOptions | https.RequestOptions = {
      host: request.url.host,
      port: request.url.port,
      method: request.url.method,
      headers: request.headers,
      path
    }
    const req = http.request(options, (res) => {
      res.pipe(this.res)
    })

    const body = await request.body.value()
    req.write(body)
  }

  async mockResponse (result: MockResponse) {
    this.res.setHeader('x-moxy-id', result.mockId)
    if (result.headers) {
      this.res.writeHead(result.status, result.headers)
    } else {
      this.res.writeHead(result.status)
    }

    if (result.body) {
      this.res.end(result.body)
    } else {
      this.res.end()
    }
  }
}
