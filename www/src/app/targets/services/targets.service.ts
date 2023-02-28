import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { WebSerialService } from 'src/app/shared/services/webserial.service';
import { SerialConnection } from '../../shared/services/webserial.service';
import { Bumper } from '../models/bumper.model';
import {
  OUT_COMPUTER_BUMPER_HIT,
  OUT_COMPUTER_CALIBRATION_FINISHED,
  OUT_COMPUTER_CONNECTED,
  OUT_COMPUTER_CONTROLLER_STATE,
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

  constructor(private webSerialService: WebSerialService) {
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
        console.log("Message!");
        const code = msg[0] || -1;
        let state = undefined;
        switch (code) {
          case OUT_COMPUTER_CONNECTED:
          case OUT_COMPUTER_CALIBRATION_FINISHED:
          case OUT_COMPUTER_BUMPER_HIT:
          case OUT_COMPUTER_CONTROLLER_STATE:
            state = readState(new DataView(msg));
            break;
        }
        return {
          code: code,
          state: state
        };
      })
    );
  }


  selectPort(): Observable<Target> {
    return this.webSerialService
      .requestPort()
      .pipe(map(serialConnectionToTarget));
  }

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
}
const serialConnectionToTarget = (serialConnection: SerialConnection): Target => {
  return {
    index: serialConnection.index,
    name: Object.values(serialConnection.port.getInfo()).join(" - ") || '',
    connection: serialConnection,
    state: []
  };
};
