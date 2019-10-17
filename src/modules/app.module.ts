import { Module, NestModule } from '@nestjs/common'
import { AppInit } from './app.init'
import { CommonModule } from './common/module'
import { HttpInterfaceModule } from './http-interface/module'
import { AdminInterfaceModule } from './admin-interface/module'
import { HistoryModule } from './history/module'
import { MockModule } from './mock/module'

@Module({
  imports: [ CommonModule, AdminInterfaceModule, HistoryModule, MockModule, HttpInterfaceModule ],
  providers: [ AppInit ]
})
export class AppModule implements NestModule {
  configure (): void {
    // NOOP
  }
}
