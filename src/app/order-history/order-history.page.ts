import { Component, computed, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { AppState } from '../store';
import { cancelOrder, loadOrders, payOrder, stopTrackingOrder, trackOrder } from '../store/actions/order.actions';
import { initialOrderState } from '../store/reducers/order.reducer';
import { CustomerOrder, OrderItem } from '../models/order.model';
import { MOBILE_APP_TEXT } from '../constants/app.constants';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.page.html',
  styleUrls: ['./order-history.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonIcon, CommonModule],
})
export class OrderHistoryPage implements OnInit, OnDestroy {
  readonly text = MOBILE_APP_TEXT;
  private readonly orderState = toSignal(this.store.select('orders'), { initialValue: initialOrderState });
  orders = computed(() => this.orderState().orders);
  loading = computed(() => this.orderState().loading);
  trackingOrderId = computed(() => this.orderState().trackingOrderId);
  tracking = computed(() => this.orderState().tracking);
  errorMessage = computed(() => this.orderState().error || '');

  constructor(private store: Store<AppState>) {}

  ngOnInit() {
    this.load();
  }

  ngOnDestroy() {
    this.store.dispatch(stopTrackingOrder());
  }

  load() {
    this.store.dispatch(loadOrders());
  }

  track(orderId: string) {
    this.store.dispatch(trackOrder({ orderId }));
  }

  pay(orderId: string) {
    this.store.dispatch(payOrder({ orderId }));
  }

  cancel(orderId: string) {
    this.store.dispatch(cancelOrder({ orderId }));
  }

  productName(item: OrderItem): string {
    return typeof item.product === 'string' ? this.text.errors.productFallback : item.product?.name || this.text.errors.productFallback;
  }

  productImage(item: OrderItem): string {
    if (typeof item.product === 'string') return './assets/icon/favicon.png';
    return item.product?.images?.[0] || item.product?.image || './assets/icon/favicon.png';
  }

  canCancel(order: CustomerOrder): boolean {
    return ['pending', 'confirmed'].includes(order.status);
  }

  canPay(order: CustomerOrder): boolean {
    return order.payment?.method !== 'cod' &&
      order.payment?.status !== 'completed' &&
      !['cancelled', 'delivered', 'refunded'].includes(order.status);
  }
}
