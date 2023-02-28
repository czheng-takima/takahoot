import { Action } from '@ngrx/store';
import { TargetInboundMessage } from '../models/target-inbound-message.model';
import { TargetOutboundMessage } from '../models/target-outbound-message.model';
import { Target } from '../models/target.model';

export enum TargetsActionTypes {
  TARGET_ESTABLISH_CONNECTION = '[Targets] Establish connection',
  TARGET_CONNECTION_SUCCESS = '[Targets] Establish connection success',
  TARGETS_ERROR = '[Targets] Targets error',
  TARGET_SEND_MESSAGE = '[Targets] Sending message',
  TARGET_INBOUND_MESSAGE_RECEIVED = '[Targets] Target inbound message received',
  TARGETS_REFRESH = '[Targets] Refresh targets'
}

export class TargetEstablishConnection implements Action {
  readonly type = TargetsActionTypes.TARGET_ESTABLISH_CONNECTION;
}

export class TargetEstablishConnectionSuccess implements Action {
  readonly type = TargetsActionTypes.TARGET_CONNECTION_SUCCESS;
  constructor(public payload: {
    target: Target
  }) {
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
  constructor(public payload: { target: Target, message: TargetInboundMessage }) {
  }
}

export class TargetsRefresh implements Action {
  readonly type = TargetsActionTypes.TARGETS_REFRESH;
}

export type TargetsActions =
  TargetEstablishConnection
  | TargetEstablishConnectionSuccess
  | TargetsError
  | TargetSendMessage
  | TargetInboundMessageReceived
  | TargetsRefresh;
