import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SessionState } from '../models/session-state.model';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
  }),
  context: undefined,
  withCredentials: undefined
};

@Injectable({
  providedIn: 'root'
})
export class KahootEngineService {
  // url = 'http://localhost:3000/kahoot';
  url = 'http://127.0.0.1:3000/kahoot';
  constructor(private httpClient: HttpClient) {
  }

  joinSession(sessionId: string, playerName: string): Observable<SessionState> {
    console.log("Joining session " + sessionId + " as " + playerName)
    return this.httpClient.post<SessionState>(this.url, {}, {
      params: {
        sessionId: sessionId,
        playerName: playerName,
      }
    })
      .pipe(catchError(this.handleError<SessionState>('joinSession')));
  }

  answerQuestion(sessionId: string, playerName: string, answer: string): Observable<SessionState> {
    console.log("Answering question " + answer + " in session " + sessionId + " as " + playerName);
    return this.httpClient.put<SessionState>(this.url, {}, {
      ...httpOptions, params: {
        sessionId: sessionId,
        playerName: playerName,
        answer: answer,
      }
    })
      .pipe(catchError(this.handleError<SessionState>('answerQuestion')));
  }

  leaveSession(sessionId: string, playerName: string): Observable<SessionState> {
    return this.httpClient.delete<SessionState>(this.url, {
      ...httpOptions, params: {
        sessionId: sessionId,
        playerName: playerName,
      }
    }).pipe(catchError(this.handleError<SessionState>('leaveSession')));
  }

  waitForNewQuestion(sessionId: string, playerName: string): Observable<SessionState> {
    return this.httpClient.get<SessionState>(`${this.url}/newQuestion`, {
      ...httpOptions, params: {
        sessionId: sessionId,
        playerName: playerName,
      }
    }).pipe(catchError(this.handleError<SessionState>('waitForNewQuestion')));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(operation + ' ' + error);
      return of(result as T);
    };
  }
}
