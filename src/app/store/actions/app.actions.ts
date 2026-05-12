import { createAction } from '@ngrx/store';

export const resetState = createAction('[App] Reset State');
export const logout = createAction('[Auth] Logout');