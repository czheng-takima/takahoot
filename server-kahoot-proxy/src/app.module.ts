import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseModule } from './firebase';
import { KahootController } from './kahoot.controller';
import { KahootService } from './kahoot.service';
import * as path from 'path';

@Module({
  imports: [
    FirebaseModule.forRoot({
      googleApplicationCredential: path.join(
        __dirname,
        '../takima-takahoot-firebase-adminsdk-sv62f-f1f3da1c6c.json',
      ),
      databaseURL: 'https://takima-takahoot.firebaseio.com',
    }),
  ],
  controllers: [KahootController, AppController],
  providers: [KahootService, AppService],
})
export class AppModule {}
