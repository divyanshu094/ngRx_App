import { createAction, props } from '@ngrx/store';
import { PaymentTransaction } from '../../models/payment-transaction.model';

export const loadPaymentHistory = createAction('[Payments] Load History');
export const loadPaymentHistorySuccess = createAction(
  '[Payments] Load History Success',
  props<{ transactions: PaymentTransaction[]; total: number }>(),
);
export const loadPaymentHistoryFailure = createAction(
  '[Payments] Load History Failure',
  props<{ error: string }>(),
);