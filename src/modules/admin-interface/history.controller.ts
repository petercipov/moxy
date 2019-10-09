import { ApiUseTags, ApiModelProperty, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger'
import { Controller, Get, Param } from '@nestjs/common'
import { IncomingURL } from '../mock/matchers/UrlMatcher'
import { IsUUID, IsPositive, ValidateNested, IsDateString, IsDefined, IsString, IsArray } from 'class-validator'
import { MockHistoryRecord } from '../history/Store'

const EXAMPLE_METHOD = 'POST'
const EXAMPLE_SCHEME = 'http'
const EXAMPLE_HOST = 'example.com'
const EXAMPLE_PORT = '80'
const EXAMPLE_PATH = '/foo/bar'
const EXAMPLE_QUERY = { name: 'john' }

const EXAMPLE_UUID = '6c353e86-ea33-4c52-9aca-7f7125e1e253'

const EXAMPLE_DATE = '2017-06-07T14:34:08.700Z'

const EXAMPLE_LOG_DTO: RequestLogDto = {
  date: EXAMPLE_DATE,
  requestId: EXAMPLE_UUID
}

export class IncomingUrlDto implements IncomingURL {

  @IsString()
  @ApiModelProperty({ example: EXAMPLE_METHOD })
  method: string

  @IsString()
  @ApiModelProperty({ example: EXAMPLE_SCHEME })
  scheme: string

  @IsString()
  @ApiModelProperty({ example: EXAMPLE_HOST })
  host: string

  @IsPositive()
  @ApiModelProperty({ example: EXAMPLE_PORT })
  port: string

  @IsString()
  @ApiModelProperty({ example: EXAMPLE_PATH })
  path: string

  @IsDefined()
  @ApiModelProperty({ example: EXAMPLE_QUERY })
  query: any
}

export class RequestLogDto implements MockHistoryRecord {

  @IsDateString()
  @ApiModelProperty({ example: EXAMPLE_DATE })
  date: string

  @ApiModelProperty({ example: EXAMPLE_UUID })
  @IsString()
  requestId: string
}

export class HistoryDto {

  @IsUUID('4')
  @ApiModelProperty({ example: EXAMPLE_UUID })
  mockId: string

  @IsUUID('4')
  @ApiModelProperty({ example: EXAMPLE_UUID })
  groupId: string

  @IsPositive()
  @ApiModelProperty({ example: 1 })
  occurrences: number

  @ValidateNested()
  @ApiModelProperty({
    example: [ EXAMPLE_LOG_DTO ],
    isArray: true,
    type: RequestLogDto
  })
  log: RequestLogDto[]
}

export class HistoryList {

  @ApiModelProperty({ example: [ EXAMPLE_UUID ], type: String, isArray: true })
  @IsArray()
  mockIds: string[]
}

@ApiUseTags('History')
@Controller('/history')
export class HistoryController {

  @Get('/')
  @ApiOkResponse({ type: HistoryList })
  async list (): Promise<HistoryList> {
    return { mockIds: [] }
  }

  @Get('/:mockId')
  @ApiOkResponse({ type: HistoryDto })
  @ApiNotFoundResponse({})
  async getMock (@Param('mockId') mockId: string): Promise<HistoryDto> {
    return {
      mockId,
      groupId: mockId,
      occurrences: 0,
      log: []
    }
  }

}
