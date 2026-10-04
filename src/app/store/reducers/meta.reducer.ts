import { Action, ActionReducer, INIT, MetaReducer, UPDATE } from '@ngrx/store';
import * as AppActions from '../actions/app.actions';
import { MOBILE_STORAGE_KEYS } from '../../constants/app.constants';

export const hydrationMetaReducer: MetaReducer<any> =
  (reducer: ActionReducer<any>): ActionReducer<any> => {
    return (state, action) => {
      if (action.type === AppActions.resetState.type || action.type === AppActions.logout.type) {
        const nextState = reducer(undefined, action);
        localStorage.removeItem(MOBILE_STORAGE_KEYS.persistedState);
        return nextState;
      }

      const storageValue = localStorage.getItem(MOBILE_STORAGE_KEYS.persistedState);
      if ((action.type === INIT || action.type === UPDATE) && storageValue) {
        try {
          const persistedState = JSON.parse(storageValue);
          return { ...reducer(undefined, action), ...persistedState };
        } catch {
          localStorage.removeItem(MOBILE_STORAGE_KEYS.persistedState);
        }
      }

      const nextState = reducer(state, action);
      const persistedState = nextState?.auth
        ? {
            ...nextState,
            auth: {
              ...nextState.auth,
              debugVerificationCode: null,
              loading: false,
              error: null,
            },
          }
        : nextState;
      localStorage.setItem(MOBILE_STORAGE_KEYS.persistedState, JSON.stringify(persistedState));
      return nextState;
    };
  };