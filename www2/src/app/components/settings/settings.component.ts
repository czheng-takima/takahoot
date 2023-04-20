import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SerialConnection } from 'src/app/models/serial-connection.model';
import { WebSerialService } from 'src/app/services/webserial.service';

import { Observable } from 'rxjs';
import { TargetOutboundMessageCode } from 'src/app/models/target-outbound-message.model';
import { notEmptyValidator } from './not-empty.validator';
import { assert } from 'console';
import { AssertionError } from 'assert';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  readonly form = new FormGroup({
    selectedConnection: new FormControl(null, Validators.required),
    selectedTargetOutboundMessageCode: new FormControl(
      null,
      Validators.required
    ),
    args: new FormControl(0x00, [notEmptyValidator]),
  });

  connections$ = this.webSerialService.connections$;
  selectedConnection: SerialConnection | undefined;

  targetOutboundMessageCodes = Object.entries(TargetOutboundMessageCode)
    .filter(
      ([key, value]) => typeof value === 'number' && typeof key !== 'number'
    )
    .map(([key, value]) => {
      return {
        value: value,
        displayName: `${key} - 0x${value.toString(16)}`,
      };
    });
  selectedTargetOutboundMessageCode: TargetOutboundMessageCode | undefined;

  constructor(private webSerialService: WebSerialService) {}

  ngOnInit(): void {}

  onSend() {
    const { selectedConnection, selectedTargetOutboundMessageCode, args } =
      this.form.value;
    console.log(
      '🚀 ~ file: settings.component.ts:39 ~ SettingsComponent ~ onSend ~  selectedConnection, selectedTargetOutboundMessageCode, args:',
      selectedConnection,
      selectedTargetOutboundMessageCode,
      args
    );
    if (!selectedConnection || !selectedTargetOutboundMessageCode || !args) {
      throw new AssertionError();
    }

    this.webSerialService.sendMessage(selectedConnection, [
      selectedTargetOutboundMessageCode,
      args,
    ]);
  }

  toLabel(connection: SerialConnection): string {
    return this.webSerialService.getConnectionLabel(connection);
  }
}
