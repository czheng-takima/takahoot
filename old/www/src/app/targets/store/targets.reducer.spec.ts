import { targetsReducer } from './targets.reducer';
import { targetsInitialState } from './targets.state';

describe('Targets Reducer', () => {
  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = targetsReducer(targetsInitialState, action);

      expect(result).toBe(targetsInitialState);
    });
  });
});
