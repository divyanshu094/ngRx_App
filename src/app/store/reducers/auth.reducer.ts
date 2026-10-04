import { createReducer, on } from '@ngrx/store';
import { User } from '../../models/user.model';
import * as AuthActions from '../actions/auth.actions';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  pendingEmail: string | null;
  emailVerified: boolean;
  debugVerificationCode: string | null;
  recoveryLoading: boolean;
  recoveryMessage: string | null;
  recoveryLink: string | null;
  passwordResetComplete: boolean;
}

export const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  pendingEmail: null,
  emailVerified: false,
  debugVerificationCode: null,
  recoveryLoading: false,
  recoveryMessage: null,
  recoveryLink: null,
  passwordResetComplete: false,
};

export const authReducer = createReducer(
  initialAuthState,
  on(AuthActions.login, AuthActions.verifyOtp, AuthActions.resendOtp, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.register, (state) => ({
    ...state,
    loading: true,
    error: null,
    emailVerified: false,
    pendingEmail: null,
    debugVerificationCode: null,
  })),
  on(AuthActions.loginSuccess, (state, { user }) => ({
    ...state,
    user,
    isAuthenticated: true,
    loading: false,
    error: null,
  })),
  on(AuthActions.loginFailure, AuthActions.registerFailure, AuthActions.verifyOtpFailure, AuthActions.resendOtpFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(AuthActions.registerSuccess, (state, { email, verificationCode }) => ({
    ...state,
    loading: false,
    error: null,
    pendingEmail: email,
    debugVerificationCode: verificationCode || null,
  })),
  on(AuthActions.verifyOtpSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
    emailVerified: true,
    debugVerificationCode: null,
  })),
  on(AuthActions.resendOtpSuccess, (state, { verificationCode }) => ({
    ...state,
    loading: false,
    error: null,
    debugVerificationCode: verificationCode || null,
  })),
  on(AuthActions.requestPasswordReset, (state) => ({
    ...state,
    recoveryLoading: true,
    recoveryMessage: null,
    recoveryLink: null,
    passwordResetComplete: false,
    error: null,
  })),
  on(AuthActions.requestPasswordResetSuccess, (state, { message, resetLink }) => ({
    ...state,
    recoveryLoading: false,
    recoveryMessage: message,
    recoveryLink: resetLink || null,
    error: null,
  })),
  on(AuthActions.resetPassword, (state) => ({
    ...state,
    recoveryLoading: true,
    recoveryMessage: null,
    recoveryLink: null,
    passwordResetComplete: false,
    error: null,
  })),
  on(AuthActions.resetPasswordSuccess, (state) => ({
    ...state,
    recoveryLoading: false,
    recoveryMessage: 'Password updated. Sign in with your new password.',
    recoveryLink: null,
    passwordResetComplete: true,
    error: null,
  })),
  on(AuthActions.requestPasswordResetFailure, AuthActions.resetPasswordFailure, (state, { error }) => ({
    ...state,
    recoveryLoading: false,
    error,
  })),
  on(AuthActions.clearAuthError, (state) => ({ ...state, error: null })),
  on(AuthActions.logoutSuccess, () => initialAuthState),
);