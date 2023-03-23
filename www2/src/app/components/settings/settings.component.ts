import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SerialConnection } from 'src/app/models/serial-connection.model';
import { WebSerialService } from 'src/app/services/webserial.service';

import { Observable } from 'rxjs';
import { TargetOutboundMessageCode } from 'src/app/models/target-outbound-message.model';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  form!: FormGroup;

  connections: Observable<SerialConnection[]> = this.webSerialService.getMockConnections();
  selectedConnection: SerialConnection | undefined;

  targetOutboundMessageCodes = Object.entries(TargetOutboundMessageCode)
    .filter(([key, value]) => typeof value === 'number' && typeof key !== 'number')
    .map(([key, value]) => {
      console.log(key, value);
      return {
        value: value,
        displayName: `${key} - 0x${value.toString(16)}`,
      };
    }); selectedTargetOutboundMessageCode: TargetOutboundMessageCode | undefined;

  constructor(private webSerialService: WebSerialService) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      selectedConnection: new FormControl(null, Validators.required),
      selectedTargetOutboundMessageCode: new FormControl(null, Validators.required),
      // either empty, or 0x00, or 0x00 0x00, or 0x00 0x00 0x00 allowed
      args: new FormControl(0x00, [Validators.pattern(/^$|^0x[0-9a-fA-F]{2}( +0x[0-9a-fA-F]{2}){0,2}$/)]),
    });
  }

  onSend() {
    const { selectedConnection, selectedTargetOutboundMessageCode, args } = this.form.value;
    console.log("🚀 ~ file: settings.component.ts:39 ~ SettingsComponent ~ onSend ~  selectedConnection, selectedTargetOutboundMessageCode, args:", selectedConnection, selectedTargetOutboundMessageCode, args)

    this.webSerialService.send(selectedConnection, [selectedTargetOutboundMessageCode, args]);
  }

  toLabel(connection: SerialConnection): string {
    return this.webSerialService.getConnectionLabel(connection);
  }
}
