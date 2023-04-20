import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SessionState } from 'src/app/models/session-state.model';
import { environment } from 'src/environments/environment.development';
import { FirebaseService } from './firebase.service';

const httpOptions = {};

@Injectable({
  providedIn: 'root',
})
export class KahootEngineService {
  url = environment.serverUrl;
  constructor(private httpClient: HttpClient) {}

  joinSession(sessionId: string, playerName: string): Observable<SessionState> {
    return this.httpClient
      .post<SessionState>(
        this.url,
        {},
        {
          params: {
            sessionId,
            playerName,
          },
        }
      )
      .pipe(catchError(this.handleError<SessionState>('joinSession')));
  }

  answerQuestion(
    sessionId: string,
    playerName: string,
    answer: string
  ): Observable<SessionState> {
    return this.httpClient
      .put<SessionState>(
        this.url,
        {},
        {
          ...httpOptions,
          params: {
            sessionId,
            playerName,
            answer,
          },
        }
      )
      .pipe(catchError(this.handleError<SessionState>('answerQuestion')));
  }

  leaveSession(
    sessionId: string,
    playerName: string
  ): Observable<SessionState> {
    return this.httpClient
      .delete<SessionState>(this.url, {
        ...httpOptions,
        params: {
          sessionId,
          playerName,
        },
      })
      .pipe(catchError(this.handleError<SessionState>('leaveSession')));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(operation + ' ' + error);
      return of(result as T);
    };
  }
}
