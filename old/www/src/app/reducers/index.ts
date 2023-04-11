import {
  ActionReducerMap,
  MetaReducer,
  ActionReducer,
  Action
} from '@ngrx/store';

export interface AppState {

}

export const reducers: ActionReducerMap<AppState> = {

};

export function clearState(reducer: ActionReducer<AppState>): ActionReducer<AppState> {
  return function(state: AppState | undefined, action: Action): AppState {
    return reducer(state, action);
  };
}


export const metaReducers: MetaReducer<AppState>[] = [clearState];
