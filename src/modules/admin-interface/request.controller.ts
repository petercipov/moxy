import { ApiUseTags, ApiModelProperty, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger'
import { Controller, Get, Param } from '@nestjs/common'
import { IncomingHttpHeaders, OutgoingHttpHeaders } from 'http'
import { IncomingURL } from '../mock/matchers/UrlMatcher'
import { IsPositive, ValidateNested, IsDateString, IsDefined, IsString } from 'class-validator'
import { MockResponseDto } from './mock.controller'

const EXAMPLE_METHOD = 'POST'
const EXAMPLE_SCHEME = 'http'
const EXAMPLE_HOST = 'example.com'
const EXAMPLE_PORT = '80'
const EXAMPLE_PATH = '/foo/bar'
const EXAMPLE_QUERY = { name: 'john' }
const EXAMPLE_BODY = `{}`
const EXAMPLE_RESP_BODY = `<?xml version="1.0" encoding="iso-8859-1"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
         "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
	<head>
		<title>404 - Not Found</title>
	</head>
	<body>
		<h1>404 - Not Found</h1>
		<script type="text/javascript" src="//wpc.75674.betacdn.net/0075674/www/ec_tpm_bcon.js"></script>
	</body>
</html>`

const EXAMPLE_UUID = '6c353e86-ea33-4c52-9aca-7f7125e1e253'

const EXAMPLE_URL: IncomingURL = {
  scheme: EXAMPLE_SCHEME,
  method: EXAMPLE_METHOD,
  port: EXAMPLE_PORT,
  host: EXAMPLE_HOST,
  path: EXAMPLE_PATH,
  query: EXAMPLE_QUERY
}

const EXAMPLE_INCOMING_BODY: IncomingBodyDto = {
  value: EXAMPLE_BODY
}

const EXAMPLE_HEADERS: IncomingHttpHeaders = {
  'accept': '*/*',
  'accept-encoding': 'gzip, deflate',
  'cache-control': 'no-cache',
  'connection': 'keep-alive',
  'host': 'example.com:80',
  'user-agent': 'PostmanRuntime/7.16.3'
}

const EXAMPLE_RESP_HEADERS: OutgoingHttpHeaders = {
  'x-mock-id': EXAMPLE_UUID,
  'x-mock-group-id': EXAMPLE_UUID
}

const EXAMPLE_DATE = '2017-06-07T14:34:08.700Z'

const EXAMPLE_REQ: IncomingRequestDto = {
  id: EXAMPLE_UUID,
  url: EXAMPLE_URL,
  headers: EXAMPLE_HEADERS,
  body: EXAMPLE_INCOMING_BODY
}

const EXAMPLE_RESP: MockResponseDto = {
  type: 'static',
  status: 404,
  headers: EXAMPLE_RESP_HEADERS,
  body: EXAMPLE_RESP_BODY
}

const EXAMPLE_MOCKED_REQ_DTO: RequestLogDto = {
  date: EXAMPLE_DATE,
  request: EXAMPLE_REQ,
  response: EXAMPLE_RESP
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

export class IncomingBodyDto {
  @IsString()
  @ApiModelProperty({ example: EXAMPLE_BODY })
  value: string
}

export class IncomingRequestDto {

  @ApiModelProperty({ example: EXAMPLE_UUID })
  @IsString()
  id: string

  @ApiModelProperty({ example: EXAMPLE_HEADERS })
  @IsDefined()
  headers: IncomingHttpHeaders

  @ValidateNested()
  @ApiModelProperty({ example: EXAMPLE_URL })
  url: IncomingUrlDto

  @ValidateNested()
  @ApiModelProperty({ example: EXAMPLE_INCOMING_BODY })
  body: IncomingBodyDto
}

export class RequestLogDto {

  @IsDateString()
  @ApiModelProperty({ example: EXAMPLE_DATE })
  date: string

  @ValidateNested()
  @ApiModelProperty({ example: EXAMPLE_REQ })
  request: IncomingRequestDto

  @ValidateNested()
  @ApiModelProperty({ example: EXAMPLE_RESP })
  response: MockResponseDto
}

@ApiUseTags('Request')
@Controller('/request')
export class RequestController {

  @Get('/:requestId')
  @ApiOkResponse({ type: RequestLogDto })
  @ApiNotFoundResponse({})
  async getRequest (@Param('requestId') requestId: string): Promise<RequestLogDto> {
    console.log(requestId)
    return EXAMPLE_MOCKED_REQ_DTO
  }
}
