import { ReplaySubject, Subject, BehaviorSubject } from 'rxjs';
import { SerialConnection } from '../models/serial-connection.model';
import { WebSerialService } from './webserial.service';

export class WebSerialServiceMock extends WebSerialService {
  override getConnections() {
    const mockConnection1: SerialConnection = {
      port: {
        getSignals: () => {
          return Promise.resolve({
            dataCarrierDetect: true,
            clearToSend: true,
            ringIndicator: true,
            dataSetReady: true,
          });
        },
        getInfo: () => {
          return {
            usbProductId: 0x8036,
            usbVendorId: 0x2341,
            usbManufacturerName: 'Arduino (www.arduino.cc)',
            usbProductName: 'Arduino Micro',
          };
        },
        open: () => {
          return Promise.resolve();
        },
        close: () => {
          return Promise.resolve();
        },
        setSignals: () => {
          return Promise.resolve();
        },
        readable: {
          getReader: (): ReadableStreamDefaultReader => {
            return {
              read: () => {},
              releaseLock: () => {},
              cancel: () => {},
              closed: () => {},
            } as any as ReadableStreamDefaultReader;
          },
        } as ReadableStream,
        writable: null,
      } as any as SerialPort,
      readSubject: new ReplaySubject<Uint8Array>(),
      writeSubject: new Subject<Uint8Array>(),
      index: 1,
    };
    const mockConnection2: SerialConnection = {
      port: {
        getSignals: () => {
          return Promise.resolve({
            dataCarrierDetect: true,
            clearToSend: true,
            ringIndicator: true,
            dataSetReady: true,
          });
        },
        getInfo: () => {
          return {
            usbProductId: 0x8037,
            usbVendorId: 0x2342,
            usbManufacturerName: 'Arduino (www.arduino.cc)',
            usbProductName: 'Arduino Micro 2',
          };
        },
        open: () => {
          return Promise.resolve();
        },
        close: () => {
          return Promise.resolve();
        },
        setSignals: () => {
          return Promise.resolve();
        },
        readable: {
          getReader: (): ReadableStreamDefaultReader => {
            return {
              read: () => {},
              releaseLock: () => {},
              cancel: () => {},
              closed: () => {},
            } as any as ReadableStreamDefaultReader;
          },
        } as ReadableStream,
        writable: null,
      } as any as SerialPort,
      readSubject: new ReplaySubject<Uint8Array>(),
      writeSubject: new Subject<Uint8Array>(),
      index: 2,
    };
    const mockConnection3: SerialConnection = {
      port: {
        getSignals: () => {
          return Promise.resolve({
            dataCarrierDetect: true,
            clearToSend: true,
            ringIndicator: true,
            dataSetReady: true,
          });
        },
        getInfo: () => {
          return {
            usbProductId: 0x8037,
            usbVendorId: 0x2342,
            usbManufacturerName: 'Arduino (www.arduino.cc)',
            usbProductName: 'Arduino Micro 3',
          };
        },
        open: () => {
          return Promise.resolve();
        },
        close: () => {
          return Promise.resolve();
        },
        setSignals: () => {
          return Promise.resolve();
        },
        readable: {
          getReader: (): ReadableStreamDefaultReader => {
            return {
              read: () => {},
              releaseLock: () => {},
              cancel: () => {},
              closed: () => {},
            } as any as ReadableStreamDefaultReader;
          },
        } as ReadableStream,
        writable: null,
      } as any as SerialPort,
      readSubject: new ReplaySubject<Uint8Array>(),
      writeSubject: new Subject<Uint8Array>(),
      index: 2,
    };
    const subject = new BehaviorSubject<SerialConnection[]>([
      mockConnection1,
      mockConnection2,
      mockConnection3,
    ]);
    return subject;
  }
}
