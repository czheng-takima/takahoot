import { Injectable } from '@angular/core';
import { Database } from '@angular/fire/database';
import { onValue, ref } from 'firebase/database';
import { Observable } from 'rxjs';
import { SessionState } from 'src/app/models/session-state.model';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private readonly sessionsRef = ref(this.db, 'sessions/');

  public readonly sessions$ = new Observable<Record<string, SessionState>>(
    (observer) => {
      onValue(this.sessionsRef, (snapshot) => {
        const data: Record<string, SessionState> = snapshot.val();
        observer.next(data);
      });
    }
  );
  constructor(private db: Database) {}

  /**
   *
   * @returns @deprecated use session$ instead
   */
  getSessions(): Observable<Record<string, SessionState>> {
    return this.sessions$;
  }
}
