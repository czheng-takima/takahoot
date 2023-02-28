import { Injectable } from '@angular/core';
import { from, Observable, of, Subject, throwError } from 'rxjs';

const CARRIAGE_RETURN = 0x0D;
const LINE_FEED = 0x0A;

const ARDUINO_VENDOR_ID = 0x2341;
const ARDUINO_PRODUCT_ID = 0x8036;

export interface SerialConnection {
  port: SerialPort;
  readSubject: Subject<Uint8Array>;
  writeSubject: Subject<Uint8Array>;
  index: number;
}

@Injectable({
  providedIn: 'root'
})
export class WebSerialService {
  private connections: SerialConnection[] = [];
  private connectionCount = 0;

  requestPort(): Observable<SerialConnection> {
    if (!("serial" in navigator)) {
      console.error("The Web Serial API is not supported.");
      return throwError("Web Serial API not supported");
    }
    const filters: SerialPortFilter = {
      usbProductId: ARDUINO_PRODUCT_ID,
      usbVendorId: ARDUINO_VENDOR_ID
    };
    const serialConnection = navigator.serial.requestPort({ filters: [filters] })
      .then(async (port) => {
        await port.open({ baudRate: 115200 });
        console.log("🚀 ~ file: webserial.service.ts:36 ~ WebSerialService ~ requestPort ~ port:", port)
        return port;
      })
      .then(port => {
        const infos = port.getInfo();
        console.log("🚀 ~ file: webserial.service.ts:38 ~ WebSerialService ~ requestPort ~ infos:", infos)

        const readSubject = this.createSerialPortReadSubject(port);
        const writeSubject = this.createSerialPortWriteSubject(port);
        const connection: SerialConnection = {
          port,
          readSubject: readSubject,
          writeSubject: writeSubject,
          index: this.connectionCount++
        };
        this.connections.push(connection);
        return connection;
      });
    return from(serialConnection);
    // const requestedPort = from(navigator.serial.requestPort({ filters: [filters] }));
    // const openedPort = requestedPort.pipe(
    //   switchMap(port => {
    //     port.open({ baudRate: 115200 });
    //     return of(port);
    //   })
    // );
    // const serialConnection = openedPort.pipe(
    //   switchMap(port => {
    //     const infos = port.getInfo();
    //     console.log("🚀 ~ file: webserial.service.ts:38 ~ WebSerialService ~ requestPort ~ infos:", infos)

    //     const connection: SerialConnection = {
    //       port,
    //       readSubject: this.createSerialPortReadSubject(port),
    //       writeSubject: this.createSerialPortWriteSubject(port),
    //       index: this.connectionCount++
    //     };
    //     this.connections.push(connection);
    //     return of(connection);
    //   }),
    //   catchError(err => {
    //     console.error("Error while connecting to port:", err);
    //     return throwError(err);
    //   })
    // );
    // return serialConnection;
  }

  private createSerialPortReadSubject(port: SerialPort): Subject<Uint8Array> {
    const subject = new Subject<Uint8Array>();

    if (!port || !port.readable) {
      throw new Error('Invalid or closed SerialPort.');
    }

    const reader = port.readable.getReader();

    const read = async () => {
      const { value, done } = await reader.read();
      console.log("🚀 ~ file: webserial.service.ts:95 ~ WebSerialService ~ read ~ value:", value)
      if (!done && value) {
        subject.next(value);
      }
    };

    subject.subscribe({
      next: read,
      complete: () => {
        reader.cancel();
      },
      error: err => console.error('Error while reading data from serial port:', err)
    });

    read();

    return subject;
  }

  private createSerialPortWriteSubject(port: SerialPort): Subject<Uint8Array> {
    const subject = new Subject<Uint8Array>();

    if (!port || !port.writable) {
      throw new Error('Invalid or closed SerialPort.');
    }

    const writer = port.writable.getWriter();

    const write = async (data: Uint8Array) => {
      console.log("🚀 ~ file: webserial.service.ts:124 ~ WebSerialService ~ write ~ data:", data)
      await writer.write(data);
    };

    subject.subscribe({
      next: write,
      complete: () => {
        writer.close();
      },
      error: err => console.error('Error while writing data to serial port:', err)
    });

    return subject;
  }

  async disconnectPort(connection: SerialConnection): Promise<void> {
    if (connection) {
      await connection.port.close();
      const index = this.connections.indexOf(connection);
      if (index !== -1) {
        this.connections.splice(index, 1);
      }
    }
  }

  send(connection: SerialConnection, message: number[]) {
    console.log("🚀 ~ file: webserial.service.ts:153 ~ WebSerialService ~ sendToDevice ~ message:", message)
    connection.writeSubject.next(new Uint8Array([...message, CARRIAGE_RETURN, LINE_FEED]));
    return of(true);
  }

}
