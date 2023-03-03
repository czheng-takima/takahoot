import { Component, Input } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { OUT_COMPUTER_BUMPER_HIT, TargetInboundMessage } from 'src/app/models/target-inbound-message.model';
import { IN_COMPUTER_DISABLE_BUMPERS_AND_BLINK, IN_COMPUTER_ENABLE_BUMPERS } from 'src/app/models/target-outbound-message.model';
import { Target } from 'src/app/models/target.model';
import { KahootEngineService } from '../../services/kahoot-engine.service';
import { TargetsService } from '../../services/targets.service';

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
export class TargetComponent {
  @Input() gamePin: string = '';
  @Input() playerName: string = 'Not a player';
  QuizResponse = QuizResponse;
  deviceId = 'Not Connected';
  target$: Observable<Target> | undefined;
  isConnected = false;
  counter = 0;
  target?: Target;
  constructor(private targetsService: TargetsService, private kahootEngineService: KahootEngineService) {

  }
  connect() {
    this.target$ = this.targetsService.selectPort();
    this.target$.pipe(
      switchMap((target: Target) => this.targetsService.connect(target).pipe(map(() => target))),
      switchMap((target: Target) => this.targetsService.startCalibration(target, 0).pipe(map(() => target))),
      switchMap((target: Target) => this.targetsService.startCalibration(target, 1).pipe(map(() => target))),
      switchMap((target: Target) => this.targetsService.startCalibration(target, 2).pipe(map(() => target))),
      switchMap((target: Target) => this.targetsService.startCalibration(target, 3).pipe(map(() => target))),
      switchMap((target: Target) => this.targetsService.changeTolerance(target, 0, 0xA0).pipe(map(() => target))),
      switchMap((target: Target) => this.targetsService.changeTolerance(target, 1, 0xA0).pipe(map(() => target))),
      switchMap((target: Target) => this.targetsService.changeTolerance(target, 2, 0xA0).pipe(map(() => target))),
      switchMap((target: Target) => this.targetsService.changeTolerance(target, 3, 0xA0).pipe(map(() => target))),
    ).subscribe((target: Target) => {
      this.isConnected = true;
      this.deviceId = target.connection.port.getInfo().usbProductId + ' ' + target.connection.port.getInfo().usbVendorId;
      this.targetsService.readInboundMessages(target).subscribe((message: TargetInboundMessage) => {
        console.log('code: ' + message.code + ' state: [ ' + JSON.stringify(message.state) + ' ]');
        if (message.code === OUT_COMPUTER_BUMPER_HIT) {
          // index is the index of the element that has the attribute hit equals to true inside the array message.state
          const index = message.state?.findIndex((bumper) => bumper.hit === true) ?? -1;
          this.onAnswer(Object.values(QuizResponse)[index] as QuizResponse);
        }
      });
      this.kahootEngineService.waitForNewQuestion(this.gamePin, this.playerName);
      this.target = target;
    });
  }

  disconnect() {
    this.isConnected = false;
    this.deviceId = 'Not Connected';
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
      this.targetsService.sendMessage({ code: IN_COMPUTER_DISABLE_BUMPERS_AND_BLINK }, this.target!);
    });
    console.log('Waiting for next question...');
    this.kahootEngineService.waitForNewQuestion(this.gamePin, this.playerName).subscribe(() => {
      this.targetsService.sendMessage({ code: IN_COMPUTER_ENABLE_BUMPERS }, this.target!);
    });
  }
}
