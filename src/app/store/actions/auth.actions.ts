import { createAction, props } from '@ngrx/store';
import { LoginRequest, RegisterRequest, User } from '../../models/user.model';

export const login = createAction(
  '[Auth] Login',
  props<{ credentials: LoginRequest; returnUrl: string | null }>(),
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{
    token: string;
    refreshToken?: string;
    user: User;
    returnUrl: string | null;
  }>(),
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>(),
);

export const register = createAction(
  '[Auth] Register',
  props<{ user: RegisterRequest }>(),
);

export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ email: string; verificationCode?: string }>(),
);

export const registerFailure = createAction(
  '[Auth] Register Failure',
  props<{ error: string }>(),
);

export const verifyOtp = createAction(
  '[Auth] Verify OTP',
  props<{ email: string; otp: string }>(),
);
export const verifyOtpSuccess = createAction('[Auth] Verify OTP Success');
export const verifyOtpFailure = createAction(
  '[Auth] Verify OTP Failure',
  props<{ error: string }>(),
);

export const resendOtp = createAction('[Auth] Resend OTP', props<{ email: string }>());
export const resendOtpSuccess = createAction(
  '[Auth] Resend OTP Success',
  props<{ verificationCode?: string }>(),
);
export const resendOtpFailure = createAction(
  '[Auth] Resend OTP Failure',
  props<{ error: string }>(),
);

export const clearAuthError = createAction('[Auth] Clear Error');

export const requestPasswordReset = createAction(
  '[Auth] Request Password Reset',
  props<{ email: string }>(),
);
export const requestPasswordResetSuccess = createAction(
  '[Auth] Request Password Reset Success',
  props<{ message: string; resetLink?: string }>(),
);
export const requestPasswordResetFailure = createAction(
  '[Auth] Request Password Reset Failure',
  props<{ error: string }>(),
);
export const resetPassword = createAction(
  '[Auth] Reset Password',
  props<{ token: string; password: string }>(),
);
export const resetPasswordSuccess = createAction('[Auth] Reset Password Success');
export const resetPasswordFailure = createAction(
  '[Auth] Reset Password Failure',
  props<{ error: string }>(),
);

export const logout = createAction('[Auth] Logout');

export const logoutSuccess = createAction('[Auth] Logout Success');