import {Component, Input, OnInit} from '@angular/core';
import {Bumper} from '../../../targets/models/bumper.model';

@Component({
  selector: 'app-bumper',
  templateUrl: './bumper.component.html',
  styleUrls: ['./bumper.component.scss']
})
export class BumperComponent implements OnInit {

  @Input()
  bumper: Bumper;

  constructor() { }

  ngOnInit(): void {
  }

}
