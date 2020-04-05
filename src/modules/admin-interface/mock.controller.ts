import { Controller, Post, Body, Delete, Param, Get, Query } from '@nestjs/common'
import { ApiUseTags, ApiModelProperty, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger'
import { Mock, MockResponse } from '../mock/Mock'
import { RequestPattern } from '../mock/matchers/RequestMatcher'
import { IsUUID, IsString, Equals, ValidateNested, IsOptional, IsPositive, IsEnum } from 'class-validator'
import { UrlPattern } from '../mock/matchers/UrlMatcher'
import { StringPattern, RegexpPattern, KeyStringPattern, KeyRegexpPattern } from '../mock/matchers/Patterns'
import { OutgoingHttpHeaders } from 'http'
import v4 from 'uuid/v4'

const EXAMPLE_UUID = 'a9994761-d1fd-4ce4-bc0b-c05301b2f3a3'

const EXAMPLE_QUERY_DTO: KeyCombinedPatternDto[] = [
  { type: 'string', key: 'follows', value: '12345' },
  { type: 'regexp', key: 'date', value: '2018-10-9-.*' }
]

const EXAMPLE_URL_PATTERN_DTO: UrlPatternDto = {
  scheme: { type: 'string', value: 'https' },
  method: { type: 'string', value: 'POST' },
  host: { type: 'regexp', value: '.*example\.com' },
  port: { type: 'string', value: '443' },
  path: { type: 'regexp', value: '/order/.*' },
  query: EXAMPLE_QUERY_DTO
}

const EXAMPLE_HEADERS_DTO: KeyCombinedPatternDto[] = [
  { type: 'string', key: 'user-agent', value: 'test-service' },
  { type: 'regexp', key: 'x-request-id', value: 'e2etest.*' }
]

const EXAMPLE_BODY_DTO: CombinedPatternDto = { type: 'string', value:
`{
  "id": 0,
  "petId": 0,
  "quantity": 0,
  "shipDate": "2019-09-14T13:38:42.242Z",
  "status": "placed",
  "complete": false
}`}

const EXAMPLE_MOCK_REQUEST: MockRequestDto = {
  url: EXAMPLE_URL_PATTERN_DTO,
  body: EXAMPLE_BODY_DTO,
  headers: EXAMPLE_HEADERS_DTO
}

const EXAMPLE_BODY_RAW = `{ "id": "ac3e7-cb9e2" }`

const EXAMPLE_RESPONSE_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'content-length': '315',
  'connection': 'keep-alive',
  'etag': 'W/\"13b-oGMBl6bT4JiRlcxG28FlTbuNFZg\"',
  'x-rrid': '697e4c3b-67c6-412c-927d-4c73fe04360f',
  'x-amz-cf-pop': 'PRG0'
}

const EXAMPLE_MOCK_RESPONSE: MockResponseDto = {
  type: 'static',
  status: 200,
  body: EXAMPLE_BODY_RAW,
  headers: EXAMPLE_RESPONSE_HEADERS
}

export class CombinedPatternDto implements RegexpPattern, StringPattern {
  @ApiModelProperty({ example: 'string', type: 'string', enum: ['string', 'regexp'] })
  @IsEnum(['string', 'regexp'])
  type: any

  @ApiModelProperty({ example: 'b.*r' })
  @IsString()
  value: string
}

export class KeyCombinedPatternDto implements KeyRegexpPattern, KeyStringPattern {
  @ApiModelProperty({ example: 'string', type: 'string', enum: ['string', 'regexp'] })
  @IsEnum(['string', 'regexp'])
  type: any

  @ApiModelProperty({ example: 'john' })
  @IsString()
  value: string

  @ApiModelProperty({ example: 'name' })
  @IsString()
  key: string
}

export class UrlPatternDto implements UrlPattern {
  @IsOptional()
  @ValidateNested()
  @ApiModelProperty({
    example: {
      type: 'string',
      value: 'https'
    },
    required: false
  })
  scheme?: CombinedPatternDto

  @IsOptional()
  @ValidateNested()
  @ApiModelProperty({
    example: {
      type: 'string',
      value: 'example.com'
    },
    required: false
  })
  host?: CombinedPatternDto

  @IsOptional()
  @ValidateNested()
  @ApiModelProperty({
    example: {
      type: 'string',
      value: '443'
    },
    required: false
  })
  port?: CombinedPatternDto

  @IsOptional()
  @ValidateNested()
  @ApiModelProperty({
    example: {
      type: 'string',
      value: 'POST'
    },
    required: false
  })
  method?: CombinedPatternDto

  @IsOptional()
  @ValidateNested()
  @ApiModelProperty({
    example: {
      type: 'regexp',
      value: '/example.*'
    },
    required: false
  })
  path?: CombinedPatternDto

  @IsOptional()
  @ValidateNested()
  @ApiModelProperty({
    example: EXAMPLE_QUERY_DTO,
    required: false,
    isArray: true,
    type: KeyCombinedPatternDto
  })
  query?: KeyCombinedPatternDto[]
}

export class MockRequestDto implements RequestPattern {
  @IsOptional()
  @ValidateNested()
  @ApiModelProperty({
    example: EXAMPLE_URL_PATTERN_DTO,
    required: false
  })
  url?: UrlPatternDto

  @IsOptional()
  @ValidateNested()
  @ApiModelProperty({
    example: EXAMPLE_HEADERS_DTO,
    required: false,
    isArray: true,
    type: KeyCombinedPatternDto
  })
  headers?: KeyCombinedPatternDto[]

  @IsOptional()
  @ValidateNested()
  @ApiModelProperty({
    example: EXAMPLE_BODY_DTO,
    required: false
  })
  body?: CombinedPatternDto
}

export class MockResponseDto implements MockResponse {
  @ApiModelProperty({ example: 'static', enum: ['static'], type: 'string' })
  @Equals('static')
  type: 'static'

  @ApiModelProperty({ example: 200 })
  @IsPositive()
  status: number

  @ApiModelProperty({ example: EXAMPLE_RESPONSE_HEADERS, required: false })
  @IsOptional()
  headers?: OutgoingHttpHeaders

  @ApiModelProperty({ example: EXAMPLE_BODY_RAW, required: false })
  @IsOptional()
  @IsString()
  body?: string
}

export class MockDto implements Mock {

  @IsUUID('4')
  @ApiModelProperty({ example: EXAMPLE_UUID, required: false })
  @IsOptional()
  id: string

  @IsUUID('4')
  @ApiModelProperty({ example: EXAMPLE_UUID, required: false })
  @IsOptional()
  groupId: string

  @IsString()
  @ApiModelProperty({ example: 'www.example.com' })
  host: string

  @ValidateNested()
  @ApiModelProperty({ example: EXAMPLE_MOCK_REQUEST })
  request: MockRequestDto

  @ValidateNested()
  @ApiModelProperty({ example: EXAMPLE_MOCK_RESPONSE })
  response: MockResponseDto
}

export class MockQuery {
  @IsOptional()
  @IsUUID('4')
  @ApiModelProperty({ example: EXAMPLE_UUID, required: false })
  groupId?: string
}

export class MockList {
  @ValidateNested()
  @ApiModelProperty({
    example: [ EXAMPLE_UUID ],
    required: true,
    isArray: true,
    type: String
  })
  mockIds: string[]
}

@ApiUseTags('Mock')
@Controller('/mock')
export class MockController {

  @Get('/:id')
  @ApiOkResponse({ type: MockDto })
  @ApiNotFoundResponse({})
  get (@Param('id') id: string) {
    console.log(id)
  }

  @Get('/')
  @ApiOkResponse({ type: MockList })
  @ApiNotFoundResponse({})
  query (@Query() query: MockQuery) {
    console.log(query)
  }

  @Post('/')
  @ApiOkResponse({})
  create (@Body() mockDto: MockDto) {
    mockDto.id = mockDto.id || v4()
    mockDto.groupId = mockDto.groupId || v4()
    console.log(JSON.stringify(mockDto, null, 3))
  }

  @Delete('/:id')
  @ApiOkResponse({})
  @ApiNotFoundResponse({})
  remove (@Param('id') id: string) {
    console.log(id)
  }

  @Delete('/')
  @ApiOkResponse({})
  @ApiNotFoundResponse({})
  removeGroups (@Query() query: MockQuery) {
    console.log(query)
  }
}
