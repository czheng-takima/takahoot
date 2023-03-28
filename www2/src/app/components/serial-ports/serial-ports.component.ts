import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SerialConnection } from 'src/app/models/serial-connection.model';
import { Target } from 'src/app/models/target.model';
import { WebSerialService } from 'src/app/services/webserial.service';
import { TargetsService } from '../../services/targets.service';

// interface SerialBinding {
//   connection: SerialConnection;
//   target: Target;
// }

@Component({
  selector: 'app-serial-ports',
  templateUrl: './serial-ports.component.html',
  // styleUrls: ['./serial-ports.component.scss']
})
export class SerialPortsComponent implements OnInit {
  displayedColumns: string[] = ['index', 'port', 'target', 'actions'];
  dataSource: { index: number; port: string; target: Target; actions: string; }[] = [];
  openedConnections$: BehaviorSubject<SerialConnection[]> = this.webSerialService.getConnections();
  // serialBindings$: BehaviorSubject<SerialBinding[]> = new BehaviorSubject<SerialBinding[]>([]);
  targets$: BehaviorSubject<Target>[] = this.targetService.getTargets();
  targets: Target[] = [];
  selectedTargets: { [key: number]: Target } = {};

  constructor(private webSerialService: WebSerialService, private targetService: TargetsService) {
  }

  onTargetSelected(port: { index: number; port: string; target: Target; actions: string; }, selectedTarget: Target) {

    // Update the selectedTargets object with the selected target for the current row
    this.selectedTargets[port.index] = selectedTarget;

    const connections = this.openedConnections$.getValue();
    selectedTarget.connection = connections[port.index];
  }

  getSelectedTarget(index: number): Target {
    // Return the selected target for the given row index, or null if none is selected
    return this.selectedTargets[index] || null;
  }

  ngOnInit() {

    // Convert each BehaviorSubject<Target> to a Target object and push it to the targets array
    this.targets$.forEach(target$ => {
      this.targets.push(target$.getValue());
    });

    // Subscribe to each BehaviorSubject<Target> and update the targets array with the latest value
    this.targets$.forEach((target$, index) => {
      target$.subscribe(value => {
        this.targets[index] = value;
      });
    });

    // Subscribe to the openedConnections$ observable
    this.openedConnections$.subscribe((connections: SerialConnection[]) => {
      // Update the dataSource array with the new connections
      this.dataSource = connections.map((connection, index) => {
        const target = this.selectedTargets[index] || this.targets[index] || null;
        const portLabel: string = this.webSerialService.getConnectionLabel(connection);
        return {
          index: index,
          port: portLabel,
          target: target,
          actions: '',
        };
      });
    });
  }

  addPort() {
    this.webSerialService.requestPort();
  }

}
