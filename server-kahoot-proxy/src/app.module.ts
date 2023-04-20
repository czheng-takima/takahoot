import { Module } from '@nestjs/common';
import { FirebaseModule } from './firebase';
import { KahootController } from './kahoot.controller';
import { KahootService } from './kahoot.service';
import {join} from 'path';

// const __dirname = path.dirname(new URL(import.meta.url).pathname)

@Module({
  imports: [
    FirebaseModule.forRoot({
      googleApplicationCredential: join(
        __dirname,
        '../takima-takahoot-firebase-adminsdk-sv62f-f1f3da1c6c.json',
      ),
      databaseURL: 'https://takima-takahoot.firebaseio.com',
    }),
  ],
  controllers: [KahootController,],
  providers: [KahootService, ],
})
export class AppModule {}
