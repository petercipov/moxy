import { Injectable, OnModuleInit, OnModuleDestroy, Inject, Scope } from '@nestjs/common'
import { Logger, LOGGER } from '../common/logger'
import * as http from 'http'
import * as https from 'https'
import { parse, URLSearchParams } from 'url'
import { ConfigService } from '../common/config'
import { IncomingRequest, Match } from '../mock/Mock'
import v4 from 'uuid/v4'
import { IncomingBody } from '../mock/matchers/BodyMatcher'
import { HTTPHandler, HTTPInterceptor } from './HTTPInterceptor'

@Injectable({
  scope: Scope.DEFAULT
})
export class HttpInterface implements OnModuleInit, OnModuleDestroy {

  private server: http.Server
  private requestIdName: string

  constructor (
    @Inject(LOGGER) private logger: Logger,
    private readonly interceptor: HTTPInterceptor,
    private readonly config: ConfigService
  ) {
    this.server = http.createServer(this.handle.bind(this))
  }

  private urlFromOverride (req: http.IncomingMessage) {
    const originRaw = firstHeader(req, 'x-moxy-origin')
    if (! originRaw) {
      return
    }

    const origin = originRaw.endsWith('/')
      ? originRaw.substring(0, originRaw.length - 1)
      : originRaw

    const overriddenUrl = `${origin}${req.url}`

    delete req.headers['host']
    delete req.headers['x-moxy-origin']
    return parse(overriddenUrl, true)
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
    const id = this.getRequestId(req)
    const logger = this.logger.child({ id })
    const handler = new HTTPResponseHandler(logger, res, this.requestIdName)

    let inUrl = this.urlFromOverride(req)
    if (! inUrl) {
      inUrl = this.urlFormRequest(req)
    }

    if (!inUrl || ! req.method || !inUrl.pathname || !inUrl.host || !inUrl.protocol) {
      return handler.badRequest(id, 'missing some parts')
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
          return handler.badRequest(id, `Unknown port ${port}`)
      }
    }

    const incomingRequest: IncomingRequest = {
      id,
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

    await this.interceptor.intercept(incomingRequest, handler)
  }

  getRequestId (req: http.IncomingMessage): string {
    const header = firstHeader(req, this.requestIdName)
    return !header
      ? v4()
      : header
  }

  onModuleInit () {
    this.requestIdName = this.config.requireString('HTTP_INTERFACE_REQUEST_ID_HEADER')
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

export class HTTPResponseHandler implements HTTPHandler {

  constructor (
    private readonly logger: Logger,
    private readonly res: http.ServerResponse,
    private readonly requestIdName: string
  ) {}

  async badRequest (requestId: string, message: string) {
    this.logger.info({ message },`HANDLER - Bad Request`)
    this.res.setHeader(this.requestIdName, requestId)
    this.res.writeHead(400, { 'Content-Type': 'text/plain' })
    this.res.end(message)
  }

  async undecided (request: IncomingRequest, mockIds: string[]) {
    this.logger.info(`HANDLER - Request response cannot be decided - HTTP 409 Conflict`)
    this.res.setHeader(this.requestIdName, request.id)
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
    this.logger.info({ options }, `HANDLER - Request ${request.url.scheme} pass through`)

    const responseHandler = (res: http.IncomingMessage) => {
      res.headers[this.requestIdName] = request.id
      this.res.writeHead(res.statusCode || 404, res.statusMessage, res.headers)
      res.pipe(this.res)
    }

    const req = request.url.scheme === 'http'
    ? http.request(options, responseHandler)
    : https.request(options, responseHandler)

    req.write(await request.body.value())
  }

  async mockResponse (request: IncomingRequest, result: Match) {
    const { id, response } = result
    this.logger.info(`HANDLER - Request mocking`)
    this.res.setHeader(this.requestIdName, request.id)
    this.res.setHeader('x-moxy-id', id)
    if (response.headers) {
      this.res.writeHead(response.status, response.headers)
    } else {
      this.res.writeHead(response.status)
    }

    if (response.body) {
      this.res.end(response.body)
    } else {
      this.res.end()
    }
  }
}

function firstHeader (req: http.IncomingMessage, name: string) {
  const raw = req.headers[name]
  return raw
    ? Array.isArray(raw)
      ? raw[0]
      : raw
    : undefined
}
