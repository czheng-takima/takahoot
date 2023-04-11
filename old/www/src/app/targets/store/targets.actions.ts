import {Action} from '@ngrx/store';
import {Target} from '../models/target.model';
import {TargetInboundMessage} from '../models/target-inbound-message.model';
import {TargetOutboundMessage} from '../models/target-outbound-message.model';

export enum TargetsActionTypes {
  TARGETS_QUERY = '[Targets] Targets query',
  TARGETS_LOADED = '[Targets] Targets loaded',

  TARGET_CLAIM = '[Targets] Claiming target',
  TARGET_UNCLAIM = '[Targets] Target unclaimed',

  TARGET_SEND_MESSAGE = '[Targets] Sending message',
  TARGETS_ERROR = '[Targets] Targets error',

  TARGET_INBOUND_MESSAGE_RECEIVED = '[Targets] Target inbound message received'
}

export class TargetsRefresh implements Action {
  readonly type = TargetsActionTypes.TARGETS_QUERY;
}

export class TargetsLoaded implements Action {
  readonly type = TargetsActionTypes.TARGETS_LOADED;

  constructor(public payload: { targets: Target[] }) {
  }
}

export class TargetClaim implements Action {
  readonly type = TargetsActionTypes.TARGET_CLAIM;

  constructor(public payload: { target: Target }) {
  }
}

export class TargetUnclaim implements Action {
  readonly type = TargetsActionTypes.TARGET_UNCLAIM;

  constructor(public payload: { target: Target }) {
  }
}


export class TargetSendMessage implements Action {
  readonly type = TargetsActionTypes.TARGET_SEND_MESSAGE;
  constructor(public payload: {
    message: TargetOutboundMessage,
    target: Target
  }) {
  }
}

export class TargetsError implements Action {
  readonly type = TargetsActionTypes.TARGETS_ERROR;

  constructor(public payload: { error: any }) {
  }
}

export class TargetInboundMessageReceived implements Action {
  readonly type = TargetsActionTypes.TARGET_INBOUND_MESSAGE_RECEIVED;

  constructor(public payload: { targetIndex: number, message: TargetInboundMessage }) {
  }
}

export type TargetsActions =
    | TargetsRefresh
    | TargetsLoaded
    | TargetClaim
    | TargetUnclaim
    | TargetSendMessage
    | TargetsError
    | TargetInboundMessageReceived;
