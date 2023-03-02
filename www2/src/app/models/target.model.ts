import { Bumper } from './bumper.model';
import { SerialConnection } from './serial-connection.model';

export interface Target {
  index: number;
  name: string;
  connection: SerialConnection;
  state: Bumper[];
}
