import { Injectable } from '@angular/core';
import { Database } from '@angular/fire/database';
import { onValue, ref } from "firebase/database";
import { Observable } from 'rxjs';
import { SessionState } from 'src/app/models/session-state.model';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  sessionsRef = ref(this.db, 'sessions/');
  constructor(private db: Database) { }

  getSessions(): Observable<Record<string, SessionState>> {
    return new Observable((observer) => {
      onValue(this.sessionsRef, (snapshot) => {
        const data: Record<string, SessionState> = snapshot.val();
        observer.next(data);
      });
    });
  }

}
