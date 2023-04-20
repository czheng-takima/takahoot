export type GameState = 'disconnected' | 'lobby' | 'quiz' | 'results';

export interface SessionState {
  sessionKey: string;
  gameState: GameState;
  ongoingQuestion: number;
  acceptingAnswers: boolean;
}
