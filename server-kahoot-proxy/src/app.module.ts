import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KahootController } from './kahoot.controller';
import { KahootService } from './kahoot.service';

@Module({
  imports: [],
  controllers: [KahootController, AppController],
  providers: [KahootService, AppService],
})
export class AppModule {}
