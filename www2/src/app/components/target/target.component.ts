import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, map, pairwise, startWith, tap } from 'rxjs/operators';
import { SessionState } from 'src/app/models/session-state.model';
import { BumperState, Target } from 'src/app/models/target.model';
import { FirebaseService } from '../../services/firebase.service';
import { KahootEngineService } from '../../services/kahoot-engine.service';
import { TargetsService } from '../../services/targets.service';
import { keyOf } from '../../utils/session-key';

export enum QuizResponse {
  Triangle = 'red',
  Diamond = 'blue',
  Circle = 'yellow',
  Square = 'green',
}

@Component({
  selector: 'app-target',
  templateUrl: './target.component.html',
  styleUrls: ['./target.component.scss']
})
export class TargetComponent implements OnInit {
  @Input() gamePin: string = '';
  @Input() target$?: BehaviorSubject<Target>;

  QuizResponse = QuizResponse;

  playerName: string = "Undefined";
  isConnected = false;
  counter = 0;
  target: Target = {} as Target;

  sessionState: SessionState = {
    sessionKey: '',
    gameState: 'disconnected',
    ongoingQuestion: -1,
    acceptingAnswers: false,
  };

  constructor(private targetsService: TargetsService, private kahootEngineService: KahootEngineService, private firebaseService: FirebaseService) {
  }

  async initialize() {
    await this.targetsService.initializeTarget(this.target, this.onAnswer.bind(this));
    this.playerName = this.target.name;
    this.isConnected = true;
  }

  ngOnInit(): void {
    this.target$?.subscribe((target) => this.target = target);

    this.firebaseService.getSessions()
      .pipe(
        tap((sessions) => this.syncSessionState(sessions)),
        map((sessions: Record<string, SessionState>) => sessions[keyOf(this.gamePin, this.playerName)]),
        startWith({ acceptingAnswers: true } as SessionState),
        pairwise(),
        filter(value => value !== undefined && value[0] !== undefined && value[1] !== undefined), // filter out undefined elements
      )
      .subscribe(([previous, current]) => {
        if (previous.acceptingAnswers && !current.acceptingAnswers) {  // transition acceptingAnswers from true to false
          this.targetsService.disableBumpersAndBlink(this.target);
        } else if (!previous.acceptingAnswers && current.acceptingAnswers) { // transition acceptingAnswers from false to true
          this.targetsService.enableBumpers(this.target);
        } else if (previous.acceptingAnswers === current.acceptingAnswers) { // no transition
        } else { // unexpected transition
          console.log("Unexpected transition for acceptingAnswers attribute", previous, current);
        }
      });

  }

  getDetails() {
    return `Connected: ${this.isConnected} |\n
    Game state: ${this.sessionState.gameState} |\n
    Ongoing question: ${this.sessionState.ongoingQuestion} |\n
    Accepting answers: ${this.sessionState.acceptingAnswers} |\n
    `;
  }

  private syncSessionState(sessions: Record<string, SessionState>) {
    Object.entries(sessions).forEach(([sessionKey, sessionState]: [string, SessionState]) => {
      if (sessionKey === keyOf(this.gamePin, this.playerName)) {
        Object.assign(this.sessionState, sessionState);
      }
    });
  }
  disconnect() {
    this.isConnected = false;
  }

  joinGame() {
    this.kahootEngineService.joinSession(this.gamePin, this.playerName).subscribe((sessionState) => {
      console.log("Joining session " + this.gamePin + " as " + this.playerName);
    });
  }

  onAnswer(answer: QuizResponse) {
    const indexOf = (value: QuizResponse) => Object.values(QuizResponse).indexOf(value);
    this.kahootEngineService.answerQuestion(this.gamePin, this.playerName, indexOf(answer).toString()).subscribe(() => {
    });
  }

  reset() {
    this.targetsService.reset(this.target);
  }
  activateTarget() {
    this.targetsService.enableBumpers(this.target);
  }

  deactivateTarget() {
    this.targetsService.disableBumpersAndBlink(this.target);
  }

  getState() {
    this.targetsService.getState(this.target);
    this.target.state$.subscribe((stateHistory: BumperState) => {
      console.log("🚀 ~ file: target.component.ts:119 ~ TargetComponent ~ this.target.state$.subscribe ~ stateHistory:", stateHistory)
    });
  }

}
