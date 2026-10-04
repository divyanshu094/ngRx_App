import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of } from 'rxjs';
import { ApiService } from '../../services/api-service/api-service';
import { MOBILE_APP_TEXT } from '../../constants/app.constants';
import { MOBILE_API_ENDPOINTS, MOBILE_CONFIG } from '../../constants/app.constants';
import * as PaymentActions from '../actions/payment.actions';

@Injectable()
export class PaymentEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(ApiService);

  loadPaymentHistory$ = createEffect(() => this.actions$.pipe(
    ofType(PaymentActions.loadPaymentHistory),
    exhaustMap(() => this.api.getData(MOBILE_API_ENDPOINTS.payments.transactions(MOBILE_CONFIG.transactionPageSize)).pipe(
      map((response: any) => PaymentActions.loadPaymentHistorySuccess({
        transactions: response?.transactions ?? [],
        total: response?.total ?? 0,
      })),
      catchError((error) => of(PaymentActions.loadPaymentHistoryFailure({
        error: error?.error?.message || MOBILE_APP_TEXT.errors.unablePaymentHistory,
      }))),
    )),
  ));
}