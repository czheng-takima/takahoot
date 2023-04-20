import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Target } from '../../models/target.model';
import { WebSerialService } from '../../services/webserial.service';
import { TargetsService } from '../../services/targets.service';

// interface SerialBinding {
//   connection: SerialConnection;
//   target: Target;
// }

@Component({
  selector: 'app-serial-ports',
  templateUrl: './serial-ports.component.html',
  styleUrls: ['./serial-ports.component.scss'],
})
export class SerialPortsComponent implements OnInit {
  displayedColumns: string[] = ['index', 'port', 'target', 'actions'];

  openedConnections$ = this.webSerialService.connections$;

  readonly dataSource$: Observable<
    {
      index: number;
      port: string;
      target$?: BehaviorSubject<Target>;
      actions: string;
    }[]
  > = this.openedConnections$.pipe(
    map((connections, index) => {
      return connections.map((connection) => {
        const port: string =
          this.webSerialService.getConnectionLabel(connection);
        return {
          index,
          port,
          target: this.selectedTargets[index],
          actions: '',
        };
      });
    })
  );

  // serialBindings$: BehaviorSubject<SerialBinding[]> = new BehaviorSubject<SerialBinding[]>([]);
  targetsSubjects: BehaviorSubject<Target>[] = this.targetService.getTargets();
  // targets: Target[] = [];
  selectedTargets: { [key: number]: BehaviorSubject<Target> } = {};

  constructor(
    private webSerialService: WebSerialService,
    private targetService: TargetsService
  ) {}

  onTargetSelected(
    data: {
      index: number;
      port: string;
      target$: BehaviorSubject<Target>;
      actions: string;
    },
    selectedTarget: BehaviorSubject<Target>
  ) {
    // Update the selectedTargets object with the selected target for the current row
    this.selectedTargets[data.index] = selectedTarget;
    this.openedConnections$.subscribe((connections) => {
      this.targetService.setConnection(selectedTarget, connections[data.index]);
    });
  }

  getSelectedTarget(index: number): BehaviorSubject<Target> {
    // Return the selected target for the given row index, or null if none is selected
    return this.selectedTargets[index] || null;
  }

  ngOnInit() {
    // Initialize the selectedTargets object with existing connections stored in target.connection
    this.targetsSubjects.forEach((targetSubject) => {
      targetSubject.subscribe((target) => {
        if (target.connection) {
          const index = this.openedConnections$
            .getValue()
            .indexOf(target.connection);
          this.selectedTargets[index] = targetSubject;
        }
      });
    });
  }

  addPort() {
    this.webSerialService.requestPort();
  }

  reset(target: unknown) {
    this.targetService.reset(target as Target);
  }

  getState(target: unknown) {
    this.targetService.getState(target as Target);
  }

  activate(target: unknown) {
    this.targetService.enableBumpers(target as Target);
  }

  deactivate(target: unknown) {
    this.targetService.disableBumpersAndBlink(target as Target);
  }

  disconnect() {
    // console.log(this.selectedTargets)
    this.webSerialService.disconnect();
  }
}
