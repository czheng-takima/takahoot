import { Target } from '../models/target.model';
import { TargetsActions, TargetsActionTypes } from './targets.actions';
import { targetsInitialState, TargetsState } from './targets.state';

const MESSAGE_LOG_MAX_SIZE = 1000;

export function targetsReducer(state = targetsInitialState, action: TargetsActions): TargetsState {
  switch (action.type) {

    case TargetsActionTypes.TARGET_ESTABLISH_CONNECTION: {
      return Object.assign({}, state, {
        loading: true,
      });
    }

    // @ts-ignore
    case TargetsActionTypes.TARGET_ESTABLISH_CONNECTION_SUCCESS: {
      return Object.assign({}, state, {
        loading: false,
      });
    }

    case TargetsActionTypes.TARGET_INBOUND_MESSAGE_RECEIVED: {
      let messageLog = [...state.messageLog];
      if (messageLog.length > MESSAGE_LOG_MAX_SIZE) {
        messageLog.shift();
      }
      messageLog.push(action.payload.message);
      let targets: Target[] = [];
      state.targets.forEach((s, i) => {
        if (action.payload.target.index === i && action.payload.message.state) {
          let t = Object.assign({}, s, { state: action.payload.message.state, connected: true });
          // Specificity for computer connected
          targets.push(t);
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
