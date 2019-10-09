import { NestFactory } from '@nestjs/core'
import { AppInit } from './modules/app.init'
import { AppModule } from './modules/app.module'

async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(AppModule)
  app.enableShutdownHooks()
  await app.select(AppModule).get(AppInit).init(app)
}

bootstrap()
  .catch((err) => console.log(err))
