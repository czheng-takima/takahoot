import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TargetsState } from './targets.state';

export const getTargetsState = createFeatureSelector<TargetsState>('targets');

export const getTargets = createSelector(
  getTargetsState,
  state => state.targets
);

export const getAllLoaded = createSelector(
  getTargetsState,
  state => state.loading
);

export const getError = createSelector(
  getTargetsState,
  state => state.error
);
