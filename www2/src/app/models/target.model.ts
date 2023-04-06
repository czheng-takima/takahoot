import { ReplaySubject } from 'rxjs';
import { Bumper } from './bumper.model';
import { SerialConnection } from './serial-connection.model';

export type BumperState = Bumper[];
export interface Target {
  index: number;
  name: string;
  connection: SerialConnection;
  state$: ReplaySubject<BumperState>;
}

