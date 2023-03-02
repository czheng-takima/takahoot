
export const IN_COMPUTER_CONNECTED = 0x30;

export const IN_COMPUTER_START_CALIBRATION = 0x31;
export const IN_COMPUTER_CHANGE_TOLERANCE = 0x32;
export const IN_COMPUTER_ENABLE_BUMPER = 0x33;
export const IN_COMPUTER_ENABLE_BUMPERS = 0x34;
export const IN_COMPUTER_DISABLE_BUMPER = 0x35;
export const IN_COMPUTER_DISABLE_BUMPER_AND_BLINK = 0x36;
export const IN_COMPUTER_DISABLE_BUMPERS_AND_BLINK = 0x37;
export const IN_COMPUTER_GET_STATE = 0x38;
export const IN_COMPUTER_RESET = 0x3F;

export interface TargetOutboundMessage {
  code: number;
  bumperId?: number;
  tolerance?: number;
}
