import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Target } from '../../../targets/models/target.model';

@Component({
  selector: 'app-target',
  templateUrl: './target.component.html',
  styleUrls: ['./target.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TargetComponent implements OnInit {
  @Input() target: Target;
  @Input() showControls: boolean = false;
  @Output() calibrate = new EventEmitter<Target>();
  @Output() enableBumpers = new EventEmitter<Target>();
  @Output() disableBumpers = new EventEmitter<Target>();
  @Output() refreshState = new EventEmitter<Target>();
  @Output() connect = new EventEmitter<Target>();
  @Output() reset = new EventEmitter<Target>();

  constructor() { }

  ngOnInit() {
  }

  onConnectClicked() {
    this.connect.emit(this.target);
  }

  onRefreshState() {
    this.refreshState.emit(this.target);
  }

  onCalibrateClicked() {
    this.calibrate.emit(this.target);
  }

  onEnableBumpersClicked() {
    this.enableBumpers.emit(this.target);
  }

  onDisableBumpersClicked() {
    this.disableBumpers.emit(this.target);
  }

  onResetClicked() {
    this.reset.emit(this.target);
  }
}
