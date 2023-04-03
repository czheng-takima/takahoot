/* eslint-disable @typescript-eslint/no-var-requires */
/*
https://docs.nestjs.com/providers#services
*/

import { Reference } from '@firebase/database-types';
import { Injectable } from '@nestjs/common';
import { FirebaseAdmin, InjectFirebaseAdmin } from './firebase';

const Client = require('@venixthedev/kahootjs');

export interface SessionState {
  sessionKey: string;
  gameState: 'disconnected' | 'lobby' | 'quiz' | 'results';
  ongoingQuestion: number;
  acceptingAnswers: boolean;
}

@Injectable()
export class KahootService {
  Client = Client;

  kahootClients: Map<string, typeof Client> = new Map();
  dbReference: Reference;
  constructor(@InjectFirebaseAdmin() private readonly firebase: FirebaseAdmin) {
    const database = firebase.database;
    this.dbReference = database.ref(`/sessions`);
  }

  async joinSession(sessionId: string, playerName: string): Promise<void> {
    const client = new Client();
    console.log('Joining session: ' + sessionId + ' as ' + playerName);
    await client.join(sessionId, playerName).catch((err: Error) => {
      console.error(
        `Unable to join session, session ID [${sessionId}] or player name [${playerName}] invalid: `,
        err,
      );
      return Promise.reject();
    });
    const sessionKey = this.keyOf(sessionId, playerName);
    this.setCallbacks(sessionKey, client);
    this.kahootClients.set(sessionKey, client);
    this.dbReference.child(sessionKey).set({
      sessionKey,
      gameState: 'lobby',
      ongoingQuestion: -2,
      acceptingAnswers: false,
    } as SessionState);
    return Promise.resolve();
  }

  async answerQuestion(
    sessionId: string,
    playerName: string,
    answer: number,
  ): Promise<void> {
    const sessionKey = this.keyOf(sessionId, playerName);
    const client = this.kahootClients.get(sessionKey);
    const sessionState = await this.getSessionState(sessionKey);
    if (!this.isPlayableSession(sessionState)) {
      console.error('Session not playable: ' + sessionKey);
      return Promise.reject();
    }
    if (!sessionState.acceptingAnswers) {
      console.error('Session not accepting answers: ' + sessionKey);
      console.error('Session state: ' + JSON.stringify(sessionState));
      return Promise.reject();
    }
    console.log('Answering question: ' + answer + ' for ' + sessionKey);
    await client.answer(answer);
    await this.updateSession(sessionKey, { acceptingAnswers: false });
    return Promise.resolve();
  }

  async disconnect(sessionId: string, playerName: string) {
    const sessionKey = this.keyOf(sessionId, playerName);
    const client = this.kahootClients.get(sessionKey);
    if (!client) {
      console.log('No session to disconnect for ' + sessionKey);
      return;
    }
    console.log('Disconnecting ' + sessionKey);
    await client.leave();
    this.kahootClients.delete(sessionKey);
    await this.dbReference.child(sessionKey).remove();
  }

  private keyOf(sessionId: string, playerName: string) {
    return sessionId + ' ' + playerName;
  }

  private async updateSession(
    sessionKey: string,
    changes: Partial<SessionState>,
  ) {
    return this.dbReference.child(sessionKey).update(changes);
  }

  private setCallbacks(sessionKey: string, client: typeof Client) {
    client.on('Joined', async () => {
      console.log('Joined session: ' + sessionKey);
      await this.updateSession(sessionKey, { gameState: 'lobby' });
    });
    client.on('QuizStart', async () => {
      console.log('Quiz started: ' + sessionKey);
      await this.updateSession(sessionKey, { gameState: 'quiz' });
    });
    client.on('QuestionStart', async (question: any) => {
      console.log('Question started: ' + sessionKey, question);
      await this.updateSession(sessionKey, {
        ongoingQuestion: question.index,
        acceptingAnswers: true,
      });
    });
    client.on('QuestionEnd', async () => {
      console.log('Question ended: ' + sessionKey);
      // await this.updateSession(sessionKey, { ongoingQuestion: -1 });
      await this.updateSession(sessionKey, { acceptingAnswers: false });
    });
    client.on('QuizEnd', async () => {
      console.log('Quiz ended: ' + sessionKey);
      await this.updateSession(sessionKey, {
        gameState: 'results',
        acceptingAnswers: false,
      });
    });
    client.on('Disconnect', async () => {
      console.log('Disconnected: ' + sessionKey);
      await this.updateSession(sessionKey, { gameState: 'disconnected' });
      return this.kahootClients.delete(sessionKey) /* && client.leave() */;
    });
    return client;
  }

  private async getSessionState(sessionKey: string): Promise<SessionState> {
    return this.dbReference
      .child(sessionKey)
      .get()
      .then((snapshot) => {
        const sessionState = snapshot.val();
        if (!sessionState) {
          throw new Error('Session not found: ' + sessionKey);
        }
        return sessionState;
      });
  }

  private isPlayableSession(sessionState?: SessionState) {
    if (!sessionState) {
      console.error('No session state to play');
      return false;
    }
    if (sessionState.gameState !== 'quiz' || sessionState.ongoingQuestion < 0) {
      console.error('Session quiz phase not started yet');
      return false;
    }
    if (!sessionState.acceptingAnswers) {
      console.error('Session not accepting answers yet');
      return false;
    }
    return sessionState.gameState === 'quiz';
  }
}
