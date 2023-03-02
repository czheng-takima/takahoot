import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { TargetsService } from 'src/app/targets/services/targets.service';
const Kahoot = require('@venixthedev/kahootjs');

@Injectable({
  providedIn: 'root'
})
export class KahootEngineService {
  kahoot: any;
  constructor(private targetService: TargetsService) {
    this.kahoot = Kahoot;
  }

  async getNewClient(gameId: number, playerName: string) {
    const client = new Kahoot();
    console.log('Joining kahoot...');
    const answers$ = new Subject<number>();
    await client.join(gameId, playerName);
    client.on('Joined', () => {
      console.log('I joined the Kahoot!');
    });
    client.on('QuizStart', () => {
      console.log('The quiz has started!');
    });
    client.on('QuestionStart', (question: any) => {
      console.log('A new question has started, answering the first answer.');
      // lire la prochaine valeur du controller à partir de enableBumbers
      question.answer(0);

    });
    client.on('QuizEnd', () => {
      console.log('The quiz has ended.');
      client.leave();
    });

    return {
      clientSession: client,
      answers: answers$
    };
  }
}

interface Player {
  clientSession: any;
  answers: Subject<number>;
}
