import { Injectable, Inject } from '@nestjs/common'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import { Logger, LOGGER } from './logger'

@Injectable()
export class ConfigService {

  private readonly envConfig: { [key: string]: string }

  constructor (@Inject(LOGGER) logger: Logger) {
    const configPath = `config/${process.env.NODE_ENV || 'development'}.env`
    logger.info({ cwd: process.cwd(), configPath }, 'Loading config')
    this.envConfig = dotenv.parse(fs.readFileSync(configPath))
    logger.info({ config: this.envConfig }, 'Config loaded')
  }

  get (key: string): string | undefined {
    return this.envConfig[key] || process.env[key]
  }

  requireInteger (key: string): number {
    const raw = this.get(key)
    if (! raw) {
      throw new Error(`Missing value for ${key}`)
    }
    return Number.parseInt(raw, 10)
  }

  requireString (key: string): string {
    const raw = this.get(key)
    if (! raw) {
      throw new Error(`Missing value for ${key}`)
    }
    return raw
  }
}
