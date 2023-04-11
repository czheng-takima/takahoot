import {Component, OnInit, Input, ChangeDetectionStrategy, Output, EventEmitter} from '@angular/core';
import { Target } from '../../../targets/models/target.model';

@Component({
  selector: 'app-targets-list',
  templateUrl: './targets-list.component.html',
  styleUrls: ['./targets-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TargetsListComponent implements OnInit {
  @Input() targets: Target[];
  @Output() calibrate = new EventEmitter<Target>();
  @Output() enableBumpers = new EventEmitter<Target>();
  @Output() disableBumpers = new EventEmitter<Target>();
  @Output() refreshState = new EventEmitter<Target>();
  @Output() connect = new EventEmitter<Target>();
  @Output() reset = new EventEmitter<Target>();

  constructor() { }

  ngOnInit() {
  }

  trackByFunction(index: any) {
    return index;
  }

  onConnect(target: Target) {
    this.connect.emit(target);
  }

  onRefreshState(target: Target) {
    this.refreshState.emit(target);
  }

  onCalibrate(target: Target) {
    this.calibrate.emit(target);
  }

  onReset(target: Target) {
    this.reset.emit(target);
  }

  onEnableBumpers(target: Target) {
    this.enableBumpers.emit(target);
  }

  onDisableBumpers(target: Target) {
    this.disableBumpers.emit(target);
  }
}
