import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, firstValueFrom, forkJoin, from, map, of, switchMap, takeUntil, takeWhile, tap, timer } from 'rxjs';
import { Store } from '@ngrx/store';
import { ApiService } from '../../services/api-service/api-service';
import { PaymentService } from '../../services/payment.service';
import { CustomerOrder, PlaceOrderRequest } from '../../models/order.model';
import { clearBucket } from '../actions/bucket.action';
import * as OrderActions from '../actions/order.actions';

@Injectable()
export class OrderEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(ApiService);
  private readonly payment = inject(PaymentService);
  private readonly router = inject(Router);
  private readonly store = inject(Store);

  loadOrders$ = createEffect(() => this.actions$.pipe(
    ofType(OrderActions.loadOrders),
    exhaustMap(() => this.api.getData('orders').pipe(
      map((response: any) => OrderActions.loadOrdersSuccess({ orders: response?.orders ?? [] })),
      catchError((error) => of(OrderActions.loadOrdersFailure({ error: this.messageFrom(error) }))),
    )),
  ));

  placeOrder$ = createEffect(() => this.actions$.pipe(
    ofType(OrderActions.placeOrder),
    exhaustMap(({ request }) => from(this.finishCheckout(request)).pipe(
      map(({ order }) => OrderActions.placeOrderSuccess({ order })),
      catchError((error) => of(OrderActions.placeOrderFailure({
        error: error?.order
          ? `${this.messageFrom(error)} Your order is saved and can be paid from order history.`
          : this.messageFrom(error),
        order: error?.order,
      }))),
    )),
  ));

  completeCheckout$ = createEffect(() => this.actions$.pipe(
    ofType(OrderActions.placeOrderSuccess),
    map(() => clearBucket()),
  ));

  reloadAfterCheckout$ = createEffect(() => this.actions$.pipe(
    ofType(OrderActions.placeOrderSuccess),
    map(() => OrderActions.loadOrders()),
  ));

  navigateAfterCheckout$ = createEffect(() => this.actions$.pipe(
    ofType(OrderActions.placeOrderSuccess),
    tap(() => {
      void this.router.navigateByUrl('/order-history');
    }),
  ), { dispatch: false });

  payOrder$ = createEffect(() => this.actions$.pipe(
    ofType(OrderActions.payOrder),
    exhaustMap(({ orderId }) => from(this.payExistingOrder(orderId)).pipe(
      map(() => OrderActions.payOrderSuccess()),
      catchError((error) => of(OrderActions.payOrderFailure({ error: this.messageFrom(error) }))),
    )),
  ));

  reloadAfterPayment$ = createEffect(() => this.actions$.pipe(
    ofType(OrderActions.payOrderSuccess),
    map(() => OrderActions.loadOrders()),
  ));

  cancelOrder$ = createEffect(() => this.actions$.pipe(
    ofType(OrderActions.cancelOrder),
    exhaustMap(({ orderId }) => this.api.updateData(`orders/${orderId}/cancel`, {}).pipe(
      map((response: any) => OrderActions.cancelOrderSuccess({ order: response.order })),
      catchError((error) => of(OrderActions.cancelOrderFailure({ error: this.messageFrom(error) }))),
    )),
  ));

  trackOrder$ = createEffect(() => this.actions$.pipe(
    ofType(OrderActions.trackOrder),
    switchMap(({ orderId }) => timer(0, 15000).pipe(
      exhaustMap(() => this.api.getData(`orders/${orderId}/track`)),
      takeWhile((tracking: any) => !['delivered', 'cancelled', 'refunded'].includes(tracking?.status), true),
      map((tracking) => OrderActions.trackOrderUpdate({ tracking })),
      takeUntil(this.actions$.pipe(ofType(OrderActions.stopTrackingOrder, OrderActions.trackOrder))),
      catchError((error) => of(OrderActions.trackOrderFailure({ error: this.messageFrom(error) }))),
    )),
  ));

  loadDeliveryQueue$ = createEffect(() => this.actions$.pipe(
    ofType(OrderActions.loadDeliveryQueue),
    exhaustMap(() => forkJoin({
      available: this.api.getData('delivery/orders?status=available'),
      assigned: this.api.getData('delivery/orders?status=assigned'),
    }).pipe(
      map(({ available, assigned }) => OrderActions.loadDeliveryQueueSuccess({
        available: available?.orders ?? [],
        assigned: assigned?.orders ?? [],
      })),
      catchError((error) => of(OrderActions.loadDeliveryQueueFailure({ error: this.messageFrom(error) }))),
    )),
  ));

  updateDeliveryOrder$ = createEffect(() => this.actions$.pipe(
    ofType(OrderActions.updateDeliveryOrder),
    exhaustMap(({ orderId, action }) => this.api.updateData(`delivery/orders/${orderId}/${action}`, {}).pipe(
      map(() => OrderActions.updateDeliveryOrderSuccess()),
      catchError((error) => of(OrderActions.updateDeliveryOrderFailure({ error: this.messageFrom(error) }))),
    )),
  ));

  refreshDeliveryQueue$ = createEffect(() => this.actions$.pipe(
    ofType(OrderActions.updateDeliveryOrderSuccess),
    map(() => OrderActions.loadDeliveryQueue()),
  ));

  updateAgentLocation$ = createEffect(() => this.actions$.pipe(
    ofType(OrderActions.updateAgentLocation),
    exhaustMap(({ latitude, longitude }) => this.api.updateData('delivery/location', { latitude, longitude }).pipe(
      map(() => OrderActions.loadDeliveryQueue()),
      catchError((error) => of(OrderActions.updateAgentLocationFailure({ error: this.messageFrom(error) }))),
    )),
  ));

  private async finishCheckout(request: PlaceOrderRequest): Promise<{ order: CustomerOrder }> {
    const response = await firstValueFrom(this.api.postData('orders', request));
    const order = (response?.order ?? response) as CustomerOrder;
    if (!order?._id) throw new Error('The server did not return an order.');
    if (request.paymentMethod === 'cod') return { order };

    try {
      await this.completePayment(order._id);
    } catch (error: any) {
      error.order = order;
      throw error;
    }
    return { order: { ...order, status: 'confirmed', payment: { ...order.payment, status: 'completed' } } };
  }

  private async payExistingOrder(orderId: string): Promise<void> {
    await this.completePayment(orderId);
  }

  private async completePayment(orderId: string): Promise<void> {
    const paymentOrder = await firstValueFrom(this.payment.createRazorpayOrder(orderId));
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const payment = await this.payment.openCheckout({
      key: paymentOrder.key,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      name: 'Grocery Delivery',
      description: 'Payment for your order',
      order_id: paymentOrder.orderId,
      prefill: { email: user.email, contact: user.phone },
      theme: { color: '#16a34a' },
    });
    const verification = await firstValueFrom(this.payment.verifyRazorpayPayment({ ...payment, orderId }));
    if (!verification.success) throw new Error('Payment verification failed.');
  }

  private messageFrom(error: any): string {
    return error?.error?.message || error?.message || 'Unable to complete the request.';
  }
}