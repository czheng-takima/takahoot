import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  of,
  ReplaySubject,
  Subject,
  throwError,
} from 'rxjs';
import { SerialConnection } from '../models/serial-connection.model';
import { WebSerialServiceMock } from './webserial.service.mock';

const CARRIAGE_RETURN = 0x0d;
const LINE_FEED = 0x0a;

const ARDUINO_VENDOR_ID = 0x2341;
const ARDUINO_PRODUCT_ID = 0x8036;

@Injectable({
  providedIn: 'root',
})
export class WebSerialService {
  private readonly connectionsSubject: BehaviorSubject<SerialConnection[]> =
    new BehaviorSubject<SerialConnection[]>([]);
  readonly connections$: Observable<SerialConnection[]> =
    this.connectionsSubject.asObservable();
  private connectionCount = 0;

  constructor() {
    this.loadExistingConnections();
  }

  private async loadExistingConnections() {
    const alreadyConnectedPorts = await navigator.serial.getPorts();

    const connections = alreadyConnectedPorts.map(async (port: SerialPort) => {
      const connection = await this.openPort(port)
        .then((port) => this.createConnection(port))
        .then((connection) => this.addConnection(connection));
      return connection;
    });
    return connections;
  }

  requestPort(): Promise<SerialConnection> {
    if (!('serial' in navigator)) {
      console.error('The Web Serial API is not supported.');
      throwError(() => new Error('Web Serial API not supported'));
    }
    const filters: SerialPortFilter = {
      usbProductId: ARDUINO_PRODUCT_ID,
      usbVendorId: ARDUINO_VENDOR_ID,
    };
    const serialConnection = navigator.serial
      .requestPort({ filters: [filters] })
      .then((port) => this.openPort(port))
      .then((port) => this.createConnection(port))
      .then((connection) => this.addConnection(connection));
    return serialConnection;
  }

  private addConnection(connection: SerialConnection) {
    const currentConnections = this.connectionsSubject.getValue();
    currentConnections.push(connection);
    this.connectionsSubject.next(currentConnections);
    return connection;
  }

  private async openPort(port: SerialPort, baudRate = 115200) {
    await port.open({ baudRate });
    return port;
  }

  private createConnection(port: SerialPort) {
    const infos = port.getInfo();

    if (!port || !port.readable) {
      throw new Error('Invalid or closed SerialPort.');
    }
    const reader: ReadableStreamDefaultReader = port.readable.getReader();
    const readSubject = this.createSerialPortReadSubject(reader);

    if (!port || !port.writable) {
      throw new Error('Invalid or closed SerialPort.');
    }
    const writer: WritableStreamDefaultWriter = port.writable.getWriter();
    const writeSubject = this.createSerialPortWriteSubject(writer);

    const connection: SerialConnection = {
      port,
      readSubject: readSubject,
      writeSubject: writeSubject,
      index: this.connectionCount++,
    };

    return connection;
  }

  private createSerialPortReadSubject(
    reader: ReadableStreamDefaultReader
  ): Subject<Uint8Array> {
    const subject = new Subject<Uint8Array>();

    const read = async () => {
      const { value, done } = await reader.read();
      if (!done && value) {
        subject.next(value);
      }
    };

    subject.subscribe({
      next: read,
      complete: () => {
        reader.cancel();
        reader.releaseLock();
      },
      error: (err) =>
        console.error('Error while reading data from serial port:', err),
    });

    read();

    return subject;
  }

  private createSerialPortWriteSubject(
    writer: WritableStreamDefaultWriter
  ): Subject<Uint8Array> {
    const subject = new Subject<Uint8Array>();

    const write = async (data: Uint8Array) => {
      await writer.write(data);
    };

    subject.subscribe({
      next: write,
      complete: () => {
        writer.close();
        writer.releaseLock();
      },
      error: (err) =>
        console.error('Error while writing data to serial port:', err),
    });

    return subject;
  }

  async disconnectPort(connection: SerialConnection) {
    if (connection) {
      connection.readSubject.complete();
      connection.writeSubject.complete();
      try {
        await connection.port.close();
      } catch (error) {
        console.error('Error while closing serial port:', error);
      }
      const index = this.connectionsSubject.getValue().indexOf(connection);
      if (index !== -1) {
        this.connectionsSubject.getValue().splice(index, 1);
      }
    }
    console.log(`Disconnected port ${connection.index}`);
    return of(true);
  }

  async disconnect() {
    const connections = this.connectionsSubject.getValue();
    for (let c of connections) {
      await this.disconnectPort(c);
    }

    this.connectionsSubject.next([]);
  }

  sendMessage(connection: SerialConnection, message: number[]) {
    connection.writeSubject.next(
      new Uint8Array([...message, CARRIAGE_RETURN, LINE_FEED])
    );
    return of(true);
  }

  /**
   *
   * @returns @deprecated use connections$ instead
   */
  getConnections(): Observable<SerialConnection[]> {
    return this.connections$;
  }

  getConnectionLabel(connection: SerialConnection) {
    const { usbProductId, usbVendorId } = connection.port.getInfo();
    return `Port ${connection.index} - ${usbProductId} ${usbVendorId}`;
  }
}
