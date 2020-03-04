import { TargetsActions, TargetsActionTypes } from './targets.actions';
import { targetsInitialState, TargetsState } from './targets.state';
import {Target} from '../models/target.model';

const MESSAGE_LOG_MAX_SIZE = 1000;

export function targetsReducer(state = targetsInitialState, action: TargetsActions): TargetsState {
  switch (action.type) {

    case TargetsActionTypes.TARGETS_QUERY: {
      return Object.assign({}, state, {
        loading: true,
      });
    }

    case TargetsActionTypes.TARGETS_LOADED: {
      return Object.assign({}, state, {
        targets: action.payload.targets,
        loading: false,
      });
    }

    case TargetsActionTypes.TARGET_INBOUND_MESSAGE_RECEIVED: {
      console.log(action.payload.message);
      let messageLog = [...state.messageLog];
      if (messageLog.length > MESSAGE_LOG_MAX_SIZE) {
        messageLog.shift();
      }
      messageLog.push(action.payload.message);
      let targets: Target[] = [];
      state.targets.forEach((s, i) => {
        if (action.payload.targetIndex === i && action.payload.message.state) {
          targets.push(Object.assign({}, s, {state: action.payload.message.state}));
        } else {
          targets.push(s);
        }
      });

      return Object.assign({}, state, {
        targets: targets,
        messageLog: messageLog
      });
    }

    case TargetsActionTypes.TARGETS_ERROR: {
      return Object.assign({}, state, {
        loading: false,
        error: action.payload.error
      });
    }

    default:
      return state;
  }
}
