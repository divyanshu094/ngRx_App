import { AppState } from '@capacitor/app';
import { Action, ActionReducer, INIT, MetaReducer, UPDATE } from '@ngrx/store';

export const hydrationMetaReducer: MetaReducer<any> =
  (reducer: ActionReducer<any>): ActionReducer<any> => {
    return (state, action) => {
      const storageValue = localStorage.getItem('app_state');
      if ((action.type === INIT || action.type === UPDATE) && storageValue) {
        try {
          return JSON.parse(storageValue);
        } catch {
          localStorage.removeItem('app_state');
        }
      }
      const nextState = reducer(state, action);
      localStorage.setItem('app_state', JSON.stringify(nextState));
      return nextState;
    };
  };