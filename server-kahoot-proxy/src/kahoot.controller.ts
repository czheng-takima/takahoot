import { Controller, Delete, Post, Put, Query } from '@nestjs/common';
import { KahootService } from './kahoot.service';

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
}
