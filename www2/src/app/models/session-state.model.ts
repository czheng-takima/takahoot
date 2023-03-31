export interface SessionState {
  sessionKey: string;
  gameState: 'disconnected' | 'lobby' | 'quiz' | 'results';
  ongoingQuestion: number;
  acceptingAnswers: boolean;
}
