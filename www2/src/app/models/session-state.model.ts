export interface SessionState {
    client: any;
    sessionId: string;
    playerName: string;
    gameState: 'disconnected' | 'lobby' | 'quiz' | 'results' | string;
    ongoingQuestion: boolean;
    key: string;
  }
