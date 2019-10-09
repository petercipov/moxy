
import { INestApplication, Injectable, Inject } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { Logger, LOGGER } from './common/logger'
import { Response, Request } from 'express'
import { ConfigService } from './common/config'

@Injectable()
export class AppInit {

  constructor (
    @Inject(LOGGER) private readonly logger: Logger,
    private readonly config: ConfigService
  ) {}

  async init (app: INestApplication): Promise<void> {
    const port = this.config.requireInteger('ADMIN_INTERFACE_PORT')
    await this.docs(app)
    await app.listen(port)
    this.logger.info({ port }, 'Admin interface started')
    this.logger.info(`API documentation available at http://localhost:${port}/swagger`)
  }

  async docs (app: INestApplication): Promise<void> {
    const options = new DocumentBuilder()
      .setTitle('Moxy')
      .setDescription('Mock administration <a href="/swagger/api.json">api</a>, to manage, monitor, verify mocks')
      .setVersion(`1.0.0`)
      .build()
    const document = SwaggerModule.createDocument(app, options)
    SwaggerModule.setup('/swagger', app, document)
    app.use('/swagger/api.json', (req: Request, res: Response) => {
      this.logger.info({ ip: req.ip }, 'Serving swagger doc')
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.send(document)
    })
  }
}
