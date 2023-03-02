import { Subject } from "rxjs";

export interface SerialConnection {
    port: SerialPort;
    readSubject: Subject<Uint8Array>;
    writeSubject: Subject<Uint8Array>;
    index: number;
}

