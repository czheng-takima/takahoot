import { Injectable } from '@angular/core';
import { from, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

const ARDUINO_VENDOR_ID = 0x2341;
const ARDUINO_PRODUCT_ID = 0x8036;

export interface SerialConnection {
  port: SerialPort;
  readSubject: Subject<Uint8Array>;
  writeSubject: Subject<Uint8Array>;
}

@Injectable({
  providedIn: 'root'
})
export class WebSerialService {
  private connections: SerialConnection[] = [];

  requestPort(): Observable<SerialConnection> {
    if (!("serial" in navigator)) {
      console.error("The Web Serial API is not supported.");
      return throwError("Web Serial API not supported");
    }
    const filters: SerialPortFilter = {
      usbProductId: ARDUINO_PRODUCT_ID,
      usbVendorId: ARDUINO_VENDOR_ID
    };
    return from(navigator.serial.requestPort({ filters: [filters] })).pipe(
      switchMap(port => {
        const connection: SerialConnection = {
          port,
          readSubject: this.createSerialPortReadSubject(port),
          writeSubject: this.createSerialPortWriteSubject(port)
        };
        this.connections.push(connection);
        return of(connection);
      }),
      catchError(err => {
        console.error("Error while connecting to port:", err);
        return throwError(err);
      })
    );
  }

  private createSerialPortReadSubject(port: SerialPort): Subject<Uint8Array> {
    const subject = new Subject<Uint8Array>();

    if (!port || !port.readable) {
      throw new Error('Invalid or closed SerialPort.');
    }

    const reader = port.readable.getReader();

    const read = async () => {
      const { value, done } = await reader.read();
      if (!done && value) {
        subject.next(value);
      }
    };

    subject.subscribe({
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

}
