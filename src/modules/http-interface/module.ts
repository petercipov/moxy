import { Global, Module } from '@nestjs/common'
import { HttpInterface } from './httpInterface'

@Global()
@Module({
  providers: [
    HttpInterface
  ]
})
export class HttpInterfaceModule {
}
