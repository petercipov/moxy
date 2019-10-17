import { Global, Module } from '@nestjs/common'
import { HttpInterface } from './httpInterface'
import { HTTPInterceptor } from './HTTPInterceptor'
import { MockModule } from '../mock/module'

@Global()
@Module({
  imports: [ MockModule ],
  providers: [
    HttpInterface,
    HTTPInterceptor
  ]
})
export class HttpInterfaceModule {
}
