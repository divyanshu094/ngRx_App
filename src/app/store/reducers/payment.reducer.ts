import { createReducer, on } from '@ngrx/store';
import { PaymentTransaction } from '../../models/payment-transaction.model';
import * as PaymentActions from '../actions/payment.actions';

export interface PaymentState {
  transactions: PaymentTransaction[];
  total: number;
  loading: boolean;
  error: string | null;
}

export const initialPaymentState: PaymentState = {
  transactions: [],
  total: 0,
  loading: false,
  error: null,
};

export const paymentReducer = createReducer(
  initialPaymentState,
  on(PaymentActions.loadPaymentHistory, (state) => ({ ...state, loading: true, error: null })),
  on(PaymentActions.loadPaymentHistorySuccess, (state, { transactions, total }) => ({
    ...state,
    transactions,
    total,
    loading: false,
  })),
  on(PaymentActions.loadPaymentHistoryFailure, (state, { error }) => ({ ...state, loading: false, error })),
);