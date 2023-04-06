import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, of } from 'rxjs';
import { last, map } from 'rxjs/operators';
import { QuizResponse } from '../components/target/target.component';
import { Bumper } from '../models/bumper.model';
import { SerialConnection } from '../models/serial-connection.model';
import {
  OUT_COMPUTER_BUMPER_HIT,
  OUT_COMPUTER_CALIBRATION_FINISHED,
  OUT_COMPUTER_CONNECTED,
  OUT_COMPUTER_CONTROLLER_STATE,
  OutCode,
  TargetInboundMessage
} from '../models/target-inbound-message.model';
import {
  IN_COMPUTER_CHANGE_TOLERANCE,
  IN_COMPUTER_CONNECTED,
  IN_COMPUTER_DISABLE_BUMPER, IN_COMPUTER_DISABLE_BUMPERS_AND_BLINK, IN_COMPUTER_DISABLE_BUMPER_AND_BLINK, IN_COMPUTER_ENABLE_BUMPER, IN_COMPUTER_ENABLE_BUMPERS,
  IN_COMPUTER_GET_STATE,
  IN_COMPUTER_RESET,
  IN_COMPUTER_START_CALIBRATION,
  TargetOutboundMessage
} from '../models/target-outbound-message.model';
import { Target } from '../models/target.model';
import { WebSerialService } from './webserial.service';


function readState(data: DataView | undefined): Bumper[] | undefined {
  if (!data) {
    return undefined;
  }
  let state: Bumper[] = [];
  let offset = 1;
  for (let i = 0; i < 4; i++) {
    let id = data.getUint8(offset + 3 * i);
    let mask = data.getUint8(offset + 3 * i + 1);
    let tolerance = data.getUint8(offset + 3 * i + 2);
    state.push({
      id: id,
      connected: (mask & 0b00000001) === 1,
      calibrating: (mask & 0b00000010) === 2,
      enabled: (mask & 0b00000100) === 4,
      hit: (mask & 0b00001000) === 8,
      tolerance: tolerance
    });
  }
  return state;
}

@Injectable({
  providedIn: 'root'
})
export class TargetsService {

  targets$: BehaviorSubject<Target>[] = [
    new BehaviorSubject<Target>({
      index: 1,
      name: 'Target 1',
      connection: null as any as SerialConnection,
      state$: this.createBumpersStateReplaySubject()
    }),
    new BehaviorSubject<Target>({
      index: 2,
      name: 'Target 2',
      connection: null as any as SerialConnection,
      state$: this.createBumpersStateReplaySubject()
    }),
    new BehaviorSubject<Target>({
      index: 3,
      name: 'Target 3',
      connection: null as any as SerialConnection,
      state$: this.createBumpersStateReplaySubject()
    })
  ];

  getTargetSubject(target: Target) {
    return this.targets$.find(target$ => target$.getValue() === target);
  }

  getTargets(): BehaviorSubject<Target>[] {
    return this.targets$;
  }

  constructor(private webSerialService: WebSerialService) {
  }

  setConnection(target$: BehaviorSubject<Target>, connection: SerialConnection): void {
    const updatedTarget = { ...target$?.getValue(), connection };
    target$?.next(updatedTarget);
  }

  async initializeTarget(target: Target, onAnswer: (response: QuizResponse) => void) {
    await (this.connect(target).toPromise());
    await (this.startCalibration(target, 3).toPromise());
    await (this.startCalibration(target, 2).toPromise());
    await (this.startCalibration(target, 1).toPromise());
    await (this.startCalibration(target, 0).toPromise());
    await (this.changeTolerance(target, 3, 0x82).toPromise());
    await (this.changeTolerance(target, 2, 0x82).toPromise());
    await (this.changeTolerance(target, 1, 0x82).toPromise());
    await (this.changeTolerance(target, 0, 0x82).toPromise());
    await (this.getState(target).toPromise());
    this.readInboundMessages(target)
      .pipe(
      // compare by value instead of reference
      // distinctUntilChanged((old: TargetInboundMessage, current: TargetInboundMessage) => old.code && current.code && old.code === current.code),
    )
      .subscribe((message: TargetInboundMessage) => {
        console.log(`${target.name} --- Message received: ${message.code} as ${OutCode[message.code]}`);
        console.table(message.state);
        if (message.code === OUT_COMPUTER_BUMPER_HIT) {
          // index is the index of the element that has the attribute hit equals to true inside the array message.state
          const index = message.state?.findIndex((bumper) => bumper.hit === true) ?? -1;
          onAnswer(Object.values(QuizResponse)[index] as QuizResponse);
        }
      });
  }


  connect(target: Target): Observable<boolean> {
    return this.webSerialService.send(target.connection, [IN_COMPUTER_CONNECTED]);
  }

  reset(target: Target): Observable<boolean> {
    return this.webSerialService.send(target.connection, [IN_COMPUTER_RESET]);
  }

  startCalibration(target: Target, bumperId: number): Observable<boolean> {
    return this.webSerialService.send(target.connection, [IN_COMPUTER_START_CALIBRATION, bumperId]);
  }

  getTolerance(target: Target, bumperId: number) {
    return target.state$.pipe(
      last(),
      map((state: Bumper[]) => state[bumperId].tolerance)
    );
  }

  changeTolerance(target: Target, bumperId: number, tolerance: number) {
    return this.webSerialService.send(target.connection, [IN_COMPUTER_CHANGE_TOLERANCE, bumperId, tolerance]);
  }

  enableBumper(target: Target, bumperId: number) {
    return this.webSerialService.send(target.connection, [IN_COMPUTER_ENABLE_BUMPER, bumperId]);
  }

  enableBumpers(target: Target) {
    return this.webSerialService.send(target.connection, [IN_COMPUTER_ENABLE_BUMPERS]);
  }

  disableBumper(target: Target, bumperId: number) {
    return this.webSerialService.send(target.connection, [IN_COMPUTER_DISABLE_BUMPER, bumperId]);
  }

  disableBumperAndBlink(target: Target, bumperId: number) {
    return this.webSerialService.send(target.connection, [IN_COMPUTER_DISABLE_BUMPER_AND_BLINK, bumperId]);
  }

  disableBumpersAndBlink(target: Target) {
    return this.webSerialService.send(target.connection, [IN_COMPUTER_DISABLE_BUMPERS_AND_BLINK]);
  }

  getState(target: Target): Observable<boolean> {
    return this.webSerialService.send(target.connection, [IN_COMPUTER_GET_STATE]);
  }

  readInboundMessages(target: Target): Observable<TargetInboundMessage> {
    if (!target.connection) {
      throw 'Target needs to be claimed before being able to listen';
    }
    return target.connection.readSubject.pipe(
      map(msg => {

        const code = msg[0] || -1;
        let state = undefined;
        switch (code) {
          case OUT_COMPUTER_CONNECTED:
          case OUT_COMPUTER_CALIBRATION_FINISHED:
          case OUT_COMPUTER_BUMPER_HIT:
          case OUT_COMPUTER_CONTROLLER_STATE:
            state = readState(new DataView(msg.buffer)) as Bumper[];
            break;
        }
        if (state) {
          target.state$.next(state);
        }
        return {
          code: code,
          state: state
        };
      })
    );
  }


  // selectPort(): Observable<Target> {
  //   return this.webSerialService
  //     .requestPort()
  //     .pipe(map(serialConnectionToTarget));
  // }

  sendMessage(message: TargetOutboundMessage, target: Target): Observable<boolean> {
    console.log("🚀 ~ file: targets.service.ts:129 ~ TargetsService ~ sendMessage ~ message:", message)
    switch (message.code) {
      case IN_COMPUTER_CONNECTED:
        return this.connect(target);
      case IN_COMPUTER_START_CALIBRATION:
        return this.startCalibration(target, message.bumperId!);
      case IN_COMPUTER_CHANGE_TOLERANCE:
        return this.changeTolerance(target, message.bumperId!, message.tolerance!);
      case IN_COMPUTER_ENABLE_BUMPER:
        return this.enableBumper(target, message.bumperId!);
      case IN_COMPUTER_ENABLE_BUMPERS:
        return this.enableBumpers(target);
      case IN_COMPUTER_DISABLE_BUMPER:
        return this.disableBumper(target, message.bumperId!);
      case IN_COMPUTER_DISABLE_BUMPER_AND_BLINK:
        return this.disableBumperAndBlink(target, message.bumperId!);
      case IN_COMPUTER_DISABLE_BUMPERS_AND_BLINK:
        return this.disableBumpersAndBlink(target);
      case IN_COMPUTER_RESET:
        return this.reset(target);
      case IN_COMPUTER_GET_STATE:
        return this.getState(target);

    }
    return of(false);
  }

  private createBumpersStateReplaySubject(length = 100): ReplaySubject<Bumper[]> {
    const subject = new ReplaySubject<Bumper[]>(length);
    subject.next([
      { calibrating: false, connected: false, enabled: false, hit: false, id: 0, tolerance: 0 },
      { calibrating: false, connected: false, enabled: false, hit: false, id: 1, tolerance: 0 },
      { calibrating: false, connected: false, enabled: false, hit: false, id: 2, tolerance: 0 },
      { calibrating: false, connected: false, enabled: false, hit: false, id: 3, tolerance: 0 }] as Bumper[]);


    setInterval(() => {
      subject.next([
        { calibrating: false, connected: false, enabled: false, hit: false, id: 0, tolerance: 30 },
        { calibrating: false, connected: false, enabled: false, hit: false, id: 1, tolerance: 60 },
        { calibrating: false, connected: false, enabled: false, hit: false, id: 2, tolerance: 90 },
        { calibrating: false, connected: false, enabled: false, hit: false, id: 3, tolerance: 120 }] as Bumper[]);
    }, 10000);
    return subject;
  }

}

