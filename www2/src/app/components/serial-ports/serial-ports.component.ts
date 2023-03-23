import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { SerialConnection } from 'src/app/models/serial-connection.model';
import { Target } from 'src/app/models/target.model';
import { WebSerialService } from 'src/app/services/webserial.service';
import { TargetsService } from '../../services/targets.service';

interface SerialBinding {
  connection: SerialConnection;
  target: Target;
}

@Component({
  selector: 'app-serial-ports',
  templateUrl: './serial-ports.component.html',
  // styleUrls: ['./serial-ports.component.scss']
})
export class SerialPortsComponent implements OnInit {
  displayedColumns: string[] = ['index', 'port', 'target', 'actions'];
  dataSource: { index: number; port: string; target: string; actions: string; }[] = [];
  openedConnections$: BehaviorSubject<SerialConnection[]> = this.webSerialService.getConnections();
  serialBindings$: BehaviorSubject<SerialBinding[]> = new BehaviorSubject<SerialBinding[]>([]);
  targets$: BehaviorSubject<Target>[] = this.targetService.getTargets();
  targets: Target[] = [];

  constructor(private webSerialService: WebSerialService, private targetService: TargetsService) {
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

    // Make sure the datasource used to display the table is updated when the serial bindings change
    combineLatest([this.openedConnections$, this.targets$])
      .pipe(
        map(([connections, target$]) => {

          return connections.map((connection: SerialConnection, index) => {
            return {
              // default binding
              connection: connection,
              target: this.targets$[index].getValue(),
            };
          });
        })
      )
      .subscribe((serialBindings: SerialBinding[]) => {
        this.serialBindings$.next(serialBindings);
        this.serialBindings$.subscribe(
          (serialBindings: SerialBinding[]) => {
            this.dataSource = serialBindings.map((binding: SerialBinding) => {
              const portLabel: string = this.webSerialService.getConnectionLabel(binding.connection);
              return {
                index: binding.connection.index,
                port: portLabel,
                target: '',
                actions: '',
              };
            });
          }
        );
      });
  }

  addPort() {
    this.webSerialService.requestPort();
  }

}
