import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from 'src/app/reducers';
import { getTargets } from 'src/app/targets/store/targets.selectors';

@Component({
  selector: 'app-store',
  template: `
    <h2>Content:</h2>
    <ul>
      <li *ngFor="let item of content$ | async">{{item | json}}</li>
    </ul>
  `})
export class StoreComponent implements OnInit {

  content$: Observable<any>;

  constructor(private store: Store<AppState>) { }

  ngOnInit() {
    this.content$ = this.store.pipe(
      select(getTargets)
    );
    console.log("🚀 ~ file: store.component.ts:25 ~ StoreComponent ~ ngOnInit ~ content:", this.content$)

  }
}
