import { TestBed, inject } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { TargetsEffects } from './targets.effects';

describe('TargetsEffects', () => {
  let actions$: Observable<any>;
  let effects: TargetsEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TargetsEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get(TargetsEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
