/* eslint-disable @typescript-eslint/no-var-requires */
/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';

const Client = require('@venixthedev/kahootjs');

export interface SessionState {
  client: any;
  sessionId: string;
  playerName: string;
  gameState: 'disconnected' | 'lobby' | 'quiz' | 'results' | string;
  ongoingQuestion: boolean;
  key: string;
}

const key = (sessionId: string, playerName: string) =>
  sessionId + ' ' + playerName;

@Injectable()
export class KahootService {
  Client = Client;
  sessions: Map<string, SessionState> = new Map();

  getKahoot() {
    return Client;
  }

  async joinSession(
    sessionId: string,
    playerName: string,
  ): Promise<SessionState> {
    const client = new Client();
    console.log('Joining session: ' + sessionId + ' as ' + playerName);
    await client.join(sessionId, playerName);
    const k = key(sessionId, playerName);

    client.on('Joined', () => {
      console.log('Joined session: ' + sessionId + ' as ' + playerName);
      this.sessions.get(key(sessionId, playerName)).gameState = 'lobby';
    });
    client.on('QuizStart', () => {
      console.log('The quiz has started for ' + k);
      this.sessions.get(key(sessionId, playerName)).gameState = 'quiz';
    });
    client.on('QuestionStart', (question: any) => {
      console.log(
        `A new question has started for ${k} question: ${JSON.stringify(
          question,
        )}`,
      );
      this.sessions.get(key(sessionId, playerName)).ongoingQuestion = true;
    });
    client.on('QuizEnd', () => {
      console.log('The quiz has ended for ' + k);
      this.sessions.get(key(sessionId, playerName)).gameState = 'results';
    });

    const v = {
      client: client,
      sessionId: sessionId,
      playerName: playerName,
      gameState: 'lobby',
      ongoingQuestion: false,
      key: k,
    };
    this.sessions.set(k, v);
    return Promise.resolve(v);
  }

  async answerQuestion(
    sessionId: string,
    playerName: string,
    answer: number,
  ): Promise<SessionState> {
    const k = key(sessionId, playerName);
    const session = this.sessions.get(k);
    if (!session) {
      console.log('No session to answer question for ' + k);
      return Promise.resolve(session);
    }
    if (!session.ongoingQuestion) {
      console.log('No question to answer for ' + k);
      return Promise.resolve(session);
    }
    console.log('Answering question: ' + answer + ' for ' + k);
    session.client.answer(answer);
    session.ongoingQuestion = false;
    return Promise.resolve(session);
  }

  async disconnect(sessionId: string, playerName: string) {
    const k = key(sessionId, playerName);
    const session = this.sessions.get(k);
    if (!session) {
      console.log('No session to disconnect for ' + k);
    }
    console.log('Disconnecting ' + k);
    session.client.leave();
    this.sessions.delete(k);
  }

  async waitForNewQuestion(sessionId: string, playerName: string) {
    const k = key(sessionId, playerName);
    const session = this.sessions.get(k);
    if (!session) {
      console.log('No session to wait for new question for ' + k);
      return Promise.resolve(session);
    }

    // Create a new Promise that resolves when the "QuestionStart" event is emitted
    const questionStartPromise = new Promise((resolve) => {
      session.client.on('QuestionStart', () => {
        console.log('Question started for ' + k);
        resolve(session);
      });
      session.client.on('QuizEnd', () => {
        console.log('Quiz ended for ' + k);
        resolve(session);
      });
    });

    // Wait for the "QuestionStart" event to be emitted before returning the session
    await questionStartPromise;

    console.log('New question ongoing for ' + k);
    return Promise.resolve(session);
  }
}
