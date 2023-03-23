import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Target } from 'src/app/models/target.model';
import { TargetsService } from 'src/app/services/targets.service';

@Component({
  selector: 'app-targets',
  templateUrl: './targets.component.html',
  styleUrls: ['./targets.component.scss']
})
export class TargetsComponent implements OnInit {
  gamePin = '123456';
  targets$: BehaviorSubject<Target>[] = this.targetsService.getTargets();

  constructor(private targetsService: TargetsService) { }

  ngOnInit(): void {
  }

}
