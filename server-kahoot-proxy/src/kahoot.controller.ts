import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { KahootService, SessionState } from './kahoot.service';

@Controller('kahoot')
export class KahootController {
  constructor(private kahootService: KahootService) {}

  @Post()
  joinGame(
    @Query('sessionId') sessionId: string,
    @Query('playerName') playerName: string,
  ) {
    return this.kahootService.joinSession(sessionId, playerName);
  }

  @Delete()
  leaveGame(
    @Query('sessionId') sessionId: string,
    @Query('playerName') playerName: string,
  ) {
    return this.kahootService.disconnect(sessionId, playerName);
  }

  @Put()
  answerQuestion(
    @Query('sessionId') sessionId: string,
    @Query('playerName') playerName: string,
    @Query('answer') answer: number,
  ) {
    return this.kahootService.answerQuestion(sessionId, playerName, answer);
  }

  @Get('/newQuestion')
  async waitForNewQuestion(
    @Query('sessionId') sessionId: string,
    @Query('playerName') playerName: string,
  ): Promise<SessionState> {
    return this.kahootService.waitForNewQuestion(sessionId, playerName);
  }
}
