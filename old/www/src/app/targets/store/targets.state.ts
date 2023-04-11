import { Target } from '../models/target.model';
import {TargetInboundMessage} from '../models/target-inbound-message.model';

export interface TargetsState {
  targets: Target[];
  messageLog: TargetInboundMessage[];
  loading: boolean;
  error: any;
}

export const targetsInitialState: TargetsState = {
  targets: [],
  messageLog: [],
  loading: false,
  error: null
};
