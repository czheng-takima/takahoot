import { Component, OnInit } from '@angular/core';
import { SerialConnection } from 'src/app/models/serial-connection.model';
import { WebSerialService } from 'src/app/services/webserial.service';

@Component({
  selector: 'app-serial',
  templateUrl: './serial.component.html',
  styleUrls: ['./serial.component.scss']
})
export class SerialComponent implements OnInit {
  selectedPort = null;
  connections: SerialConnection[] = [];

  constructor(private webSerialService: WebSerialService) { }

  ngOnInit(): void {
    this.connections = this.webSerialService.getMockConnections();
  }

  getConnectionLabel(connection: SerialConnection) {
    const { usbProductId, usbVendorId } = connection.port.getInfo();
    return `Port ${connection.index} - ${usbProductId} ${usbVendorId}`;
  }
}
