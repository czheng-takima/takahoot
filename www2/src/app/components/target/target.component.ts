import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { SessionState } from 'src/app/models/session-state.model';
import { OUT_COMPUTER_BUMPER_HIT, TargetInboundMessage } from 'src/app/models/target-inbound-message.model';
import { IN_COMPUTER_DISABLE_BUMPERS_AND_BLINK } from 'src/app/models/target-outbound-message.model';
import { Target } from 'src/app/models/target.model';
import { FirebaseService } from '../../services/firebase.service';
import { KahootEngineService } from '../../services/kahoot-engine.service';
import { TargetsService } from '../../services/targets.service';
import { keyOf } from '../../utils/session-key';

enum QuizResponse {
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
    ongoingQuestion: NaN
  };

  constructor(private targetsService: TargetsService, private kahootEngineService: KahootEngineService, private firebaseService: FirebaseService) {
  }

  ngOnInit(): void {
    this.firebaseService.getSessions().subscribe((sessions) => {
      this.syncSessionState(sessions);
    });
    this.target$?.subscribe(async (target) => {
      this.playerName = target.name;
      this.target = target;
      await lastValueFrom(this.targetsService.connect(target));
      await lastValueFrom(this.targetsService.startCalibration(target, 0));
      await lastValueFrom(this.targetsService.startCalibration(target, 1));
      await lastValueFrom(this.targetsService.startCalibration(target, 2));
      await lastValueFrom(this.targetsService.startCalibration(target, 3));
      await lastValueFrom(this.targetsService.changeTolerance(target, 0, 0xA0));
      await lastValueFrom(this.targetsService.changeTolerance(target, 1, 0xA0));
      await lastValueFrom(this.targetsService.changeTolerance(target, 2, 0xA0));
      await lastValueFrom(this.targetsService.changeTolerance(target, 3, 0xA0));
      this.isConnected = true;
      this.targetsService.readInboundMessages(target).subscribe((message: TargetInboundMessage) => {
        console.log('code: ' + message.code + ' state: [ ' + JSON.stringify(message.state) + ' ]');
        if (message.code === OUT_COMPUTER_BUMPER_HIT) {
          // index is the index of the element that has the attribute hit equals to true inside the array message.state
          const index = message.state?.findIndex((bumper) => bumper.hit === true) ?? -1;
          this.onAnswer(Object.values(QuizResponse)[index] as QuizResponse);
        }
      });
    });
  }

  getDetails() {
    return `Connected: ${this.isConnected} |\n
    Game state: ${this.sessionState.gameState} |\n
    Ongoing question: ${this.sessionState.ongoingQuestion}`;
  }

  private syncSessionState(sessions: Record<string, SessionState>) {
    Object.entries(sessions).forEach(([sessionKey, sessionState]: [string, SessionState]) => {
      console.log('syncSessionState', sessionKey, sessionState, keyOf(this.gamePin, this.playerName));
      if (sessionKey === keyOf(this.gamePin, this.playerName)) {
        Object.assign(this.sessionState, sessionState);
      }
    });
  }
  // connect() {
  //   this.firebaseService.getSessions().subscribe((sessions) => {
  //     this.syncSessionState(sessions);
  //   });
  //   this.target$ = this.targetsService.selectPort();
  //   this.target$.pipe(
  //     switchMap((target: Target) => this.targetsService.connect(target).pipe(map(() => target))),
  //     switchMap((target: Target) => this.targetsService.startCalibration(target, 0).pipe(map(() => target))),
  //     switchMap((target: Target) => this.targetsService.startCalibration(target, 1).pipe(map(() => target))),
  //     switchMap((target: Target) => this.targetsService.startCalibration(target, 2).pipe(map(() => target))),
  //     switchMap((target: Target) => this.targetsService.startCalibration(target, 3).pipe(map(() => target))),
  //     switchMap((target: Target) => this.targetsService.changeTolerance(target, 0, 0xA0).pipe(map(() => target))),
  //     switchMap((target: Target) => this.targetsService.changeTolerance(target, 1, 0xA0).pipe(map(() => target))),
  //     switchMap((target: Target) => this.targetsService.changeTolerance(target, 2, 0xA0).pipe(map(() => target))),
  //     switchMap((target: Target) => this.targetsService.changeTolerance(target, 3, 0xA0).pipe(map(() => target))),
  //   ).subscribe((target: Target) => {
  //     this.isConnected = true;
  //     this.deviceId = target.connection.port.getInfo().usbProductId + ' ' + target.connection.port.getInfo().usbVendorId;
  //     this.targetsService.readInboundMessages(target).subscribe((message: TargetInboundMessage) => {
  //       console.log('code: ' + message.code + ' state: [ ' + JSON.stringify(message.state) + ' ]');
  //       if (message.code === OUT_COMPUTER_BUMPER_HIT) {
  //         // index is the index of the element that has the attribute hit equals to true inside the array message.state
  //         const index = message.state?.findIndex((bumper) => bumper.hit === true) ?? -1;
  //         this.onAnswer(Object.values(QuizResponse)[index] as QuizResponse);
  //       }
  //     });
  //     // this.kahootEngineService.waitForNewQuestion(this.gamePin, this.playerName);
  //     this.target = target;
  //   });
  // }

  disconnect() {
    this.isConnected = false;
  }

  joinGame() {
    this.kahootEngineService.joinSession(this.gamePin, this.playerName).subscribe((sessionState) => {
      console.log("Joining session " + this.gamePin + " as " + this.playerName);
      console.log(sessionState);
    });
  }

  onAnswer(answer: QuizResponse) {
    console.log('Answering ' + answer + ' for ' + this.playerName);
    const indexOf = (value: QuizResponse) => Object.values(QuizResponse).indexOf(value);
    this.kahootEngineService.answerQuestion(this.gamePin, this.playerName, indexOf(answer).toString()).subscribe(() => {
      this.targetsService.sendMessage({ code: IN_COMPUTER_DISABLE_BUMPERS_AND_BLINK }, this.target);
    });
    console.log('Waiting for next question...');
    // this.kahootEngineService.waitForNewQuestion(this.gamePin, this.playerName).subscribe(() => {
    //   this.targetsService.sendMessage({ code: IN_COMPUTER_ENABLE_BUMPERS }, this.target!);
    // });
  }

  reset() {
    this.targetsService.reset(this.target);
  }
}
