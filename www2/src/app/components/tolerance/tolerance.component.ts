import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { AssertionError } from 'assert';
import { BehaviorSubject, ReplaySubject, Subscription } from 'rxjs';
import { Bumper } from 'src/app/models/bumper.model';
import { Target } from 'src/app/models/target.model';
import { TargetsService } from 'src/app/services/targets.service';

@Component({
  selector: 'app-tolerance',
  templateUrl: './tolerance.component.html',
  styleUrls: ['./tolerance.component.scss'],
})
export class ToleranceComponent implements OnInit, OnChanges, OnDestroy {
  @Input() target?: Target;

  state$?: ReplaySubject<Bumper[]>;

  tolerances: number[] = [0, 0, 0, 0];
  private subs: Subscription[] = [];

  constructor(private targetService: TargetsService) {}

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['target'] && !changes['target'].currentValue) {
      throw new AssertionError();
    }
    if (changes['target']?.currentValue) {
      this.subs.forEach((s) => s.unsubscribe());
      this.target = changes['target'].currentValue;
      this.state$ = this.target!.state$;
      this.subs = [
        this.state$.subscribe(
          (state: Bumper[]) =>
            (this.tolerances = state.map(
              (bumper: Bumper) => bumper.tolerance || 0
            ))
        ),
      ];
    }
  }

  toleranceChange(newTolerance: number, index: number) {
    this.tolerances[index] = newTolerance;
  }

  submitTolerances() {
    this.tolerances.forEach((tolerance, index) => {
      this.targetService.changeTolerance(this.target!, index, tolerance);
    });
    this.targetService.getState(this.target!);
  }

  formatSliderLabel(value: number) {
    return `0x${value.toString(16)}`;
  }
}
