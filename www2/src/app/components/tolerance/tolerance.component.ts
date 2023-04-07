import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { Bumper } from 'src/app/models/bumper.model';
import { Target } from 'src/app/models/target.model';
import { TargetsService } from 'src/app/services/targets.service';

@Component({
  selector: 'app-tolerance',
  templateUrl: './tolerance.component.html',
  styleUrls: ['./tolerance.component.scss']
})
export class ToleranceComponent implements OnInit {
  @Input() target$?: BehaviorSubject<Target>;
  state$?: ReplaySubject<Bumper[]>;

  tolerances: number[] = [0, 0, 0, 0];
  target?: Target;

  constructor(private targetService: TargetsService) { }

  ngOnInit(): void {
    this.target$?.subscribe((target: Target) => {
      this.target = target;
      this.state$ = target.state$;
      this.state$.subscribe((state: Bumper[]) => {
        const t = state.map((bumper: Bumper) => bumper.tolerance || 0);
        this.tolerances = t;
      });
    });
  }

  toleranceChange(newTolerance: number, index: number) {
    this.tolerances[index] = newTolerance;
  }

  submitTolerances() {
    this.tolerances.forEach((tolerance: number, index: number) => {
      this.targetService.changeTolerance(this.target!, index, tolerance);
    });
    this.targetService.getState(this.target!);
  }

  formatSliderLabel(value: number) {
    return `0x${value.toString(16)}`;
  }
}
