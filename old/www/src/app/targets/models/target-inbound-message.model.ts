import {Bumper} from './bumper.model';

export const OUT_COMPUTER_CONNECTED = 0x80;
export const OUT_COMPUTER_CALIBRATION_STARTED = 0x81;
export const OUT_COMPUTER_CALIBRATION_FINISHED = 0x82;
export const OUT_COMPUTER_BUMPER_HIT = 0x84;
export const OUT_COMPUTER_CONTROLLER_STATE = 0x88;

export interface TargetInboundMessage {
  code: number;
  state?: Bumper[];
}
