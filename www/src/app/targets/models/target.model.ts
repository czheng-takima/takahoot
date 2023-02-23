import {Bumper} from './bumper.model';
import { SerialConnection } from '../../shared/services/webserial.service';

export interface Target {
  index: number;
  name: string;
  connection: SerialConnection;
  state: Bumper[];
}
