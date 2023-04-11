import {Injectable} from '@angular/core';
import {defer, Observable, of, Subject} from 'rxjs';

const ARDUINO_VENDOR_ID = 0x2341;
const ARDUINO_PRODUCT_ID = 0x8036;
const IN_ENDPOINT = 5; // In endpoint ID of WebUSB for Arduino (4 for Out endpoint)
const CONFIG_NUMBER = 1; // Device specific configuration value
const INTERFACE_NUMBER = 2; // Device specific interface number
const REQUEST_TYPE = 'class'; // industry-standard class of devices
const TRANSFER_RECIPIENT = 'interface'; // target on the transfer on the device
const ARDUINO_CORE_REQUEST = 0x22; // see 'USBCore.h' > #define CDC_SET_CONTROL_LINE_STATE	0x22
const ARDUINO_CONTROL_CONNECT = 0x01; // Vendor-specific, 0x00 for DISCONNECT
const RECIPIENT_INTERFACE_NUMBER = 0x02; // Interface number on the recipient
const BUFFER_LENGTH = 64; // Interface number on the recipient


/*class WebUSBDeviceListener {
  onReceive = (device: any, data: any) => {
    console.info('WebUSBDevice received data: ');
    const out = buf2hex(data.buffer);
    let cmd, b0, b1, b2, b3;
    if (out.length === 30) {
      cmd = out.substring(0, 2);
      b0 = out.substring(2, 8);
      b1 = out.substring(8, 14);
      b2 = out.substring(14, 20);
      b3 = out.substring(20, 26);
      device.state = {
        cmd, b0, b1, b2, b3
      };

      switch (cmd) {
        case '84'://OUT_COMPUTER_TARGET_HIT
          let hit = [b0, b1, b2, b3].filter(s => s.indexOf('09') > 0);//identify bumper
          let hitIndex = hit[0].substring(1, 2);
          console.info(`Target ${device.index} hit bumper ${hitIndex}`);
          if (device.kahootSession) {
            device.kahootSession.answerQuestion(hitIndex);
          }
          break;
        case '88'://OUT_COMPUTER_CONTROLLER_STATE
          console.info(`Reading #getState target ${device.index} - state: ${device.state}`);
          break;
        case '82'://OUT_COMPUTER_CALIBRATION_FINISHED
          console.info(`Reading #calibrationFinished target ${device.index} - state: ${device.state}`);
          break;
        case '81'://OUT_COMPUTER_CALIBRATION_STARTED
          console.info(`Reading #calibrationStarted target ${device.index} - state: ${device.state}`);
          break;
        case '80'://OUT_COMPUTER_CONNECTED
          console.info(`Reading #computerConnected target ${device.index} - state: ${device.state}`);
          break;
      }
    }
  };

  onReceiveError = (error: any) => {
    console.error('WebUSBDevice received error: ');
    console.error(error);
  };
}*/

@Injectable({
  providedIn: 'root'
})
export class WebusbService {

  private devices: Array<USBDevice> = [];

  constructor() {
  }

  claim(device: USBDevice | undefined): Observable<boolean> {
    if (!device) {
      return of(false);
    }
    return defer(async () => {
      await device.open();
      await device.selectConfiguration(CONFIG_NUMBER);
      await device.claimInterface(INTERFACE_NUMBER);
      await device.controlTransferOut({
        requestType: REQUEST_TYPE,
        recipient: TRANSFER_RECIPIENT,
        request: ARDUINO_CORE_REQUEST,
        value: ARDUINO_CONTROL_CONNECT,
        index: RECIPIENT_INTERFACE_NUMBER
      });
      await device.controlTransferIn({
        requestType: REQUEST_TYPE,
        recipient: TRANSFER_RECIPIENT,
        request: ARDUINO_CORE_REQUEST,
        value: ARDUINO_CONTROL_CONNECT,
        index: RECIPIENT_INTERFACE_NUMBER
      }, 0);
      return true;
    });

  };

  unclaim(device: USBDevice | undefined): Observable<boolean> {
    if (!device) {
      return of(false);
    }
    return defer(async () => {
      await device.close();
      return true;
    });
  };

  // Get the plugged devices and extract the one having the Arduino's vendor id, then asks the user
  // to choose from the resulting list
  async configureNewDevices() {
    // @ts-ignore
    const authorizedDevice = await navigator.usb.requestDevice({
      filters: [{vendorId: ARDUINO_VENDOR_ID, productId: ARDUINO_PRODUCT_ID}]
    });
    this.devices.push(authorizedDevice);
  };

  refreshDevices(): Observable<USBDevice[]> {
    return defer(async () => {
      this.devices = await navigator.usb.getDevices().then(devices => devices.filter(d => d.vendorId === ARDUINO_VENDOR_ID && d.productId === ARDUINO_PRODUCT_ID));
      return this.devices;
    });
  }

  sendToDevice(deviceIndex: number, message: number[]): Observable<USBOutTransferResult> {
    const selectedInterface = this.devices[deviceIndex].configuration!.interfaces.filter((i: any) => i.claimed)[0];
    const {
      endpointNumber
    } = selectedInterface.alternate.endpoints.filter((e: any) => e.direction === 'out')[0];
    return defer(() => {
      try {
        return this.devices[deviceIndex].transferOut(endpointNumber, new Uint8Array([...message, 0x0D, 0x0A]));
      } catch (e) {
        console.error('Error while writing message to WebUSB device');
        throw e;
      }
    });
  }

  private listenToNextInboundMessage(device: USBDevice, sub: Subject<USBInTransferResult>) {
    return device.transferIn(IN_ENDPOINT, BUFFER_LENGTH).then(r => {
      if (!sub.closed) {
        sub.next(r);
        setTimeout(() => this.listenToNextInboundMessage(device, sub), 0);
      }
    })
  }

  listen(device: any): Observable<USBInTransferResult> {
    let sub = new Subject<USBInTransferResult>();
    this.listenToNextInboundMessage(device, sub);
    return sub;
  }
}
