import { Controller, Get } from '@nestjs/common'
import { ApiUseTags, ApiResponse, ApiModelProperty } from '@nestjs/swagger'

export class Status {
  @ApiModelProperty()
  readonly health: string

  constructor (health: string) {
    this.health = health
  }
}

@ApiUseTags('Status')
@Controller('/status')
export class StatusController {

  @Get('/')
  @ApiResponse({ status: 200, type: Status })
  async getHealthStatus (): Promise<Status> {
    return {
      health: 'healthy'
    }
  }
}
