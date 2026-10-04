import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { Geolocation } from '@capacitor/geolocation';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { addIcons } from 'ionicons';
import { locateOutline, logOutOutline, refreshOutline } from 'ionicons/icons';
import { AppState } from '../store';
import { logout } from '../store/actions/auth.actions';
import { loadDeliveryQueue, updateAgentLocation, updateDeliveryOrder } from '../store/actions/order.actions';
import { initialOrderState } from '../store/reducers/order.reducer';
import { DeliveryOrder, OrderItem } from '../models/order.model';

@Component({
  selector: 'app-delivery',
  standalone: true,
  imports: [CommonModule, IonContent, IonButton, IonIcon],
  templateUrl: './delivery.page.html',
})
export class DeliveryPage implements OnInit {
  private readonly orderState = toSignal(this.store.select('orders'), { initialValue: initialOrderState });
  availableOrders = computed(() => this.orderState().availableDeliveryOrders);
  assignedOrders = computed(() => this.orderState().assignedDeliveryOrders);
  loading = computed(() => this.orderState().loadingDeliveryQueue);
  busyOrderId = computed(() => this.orderState().deliveryActionOrderId);
  errorMessage = computed(() => this.orderState().error || this.locationError());
  locationError = signal('');

  constructor(private store: Store<AppState>) {
    addIcons({ locateOutline, logOutOutline, refreshOutline });
  }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.store.dispatch(loadDeliveryQueue());
  }

  accept(orderId: string) {
    this.store.dispatch(updateDeliveryOrder({ orderId, action: 'accept' }));
  }

  updateStatus(orderId: string, action: 'picked' | 'delivered') {
    this.store.dispatch(updateDeliveryOrder({ orderId, action }));
  }

  signOut() {
    this.store.dispatch(logout());
  }

  async updateLocation() {
    this.locationError.set('');
    try {
      const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
      this.store.dispatch(updateAgentLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }));
    } catch {
      this.locationError.set('Location is unavailable. Check this device’s location permission.');
    }
  }

  customerName(order: DeliveryOrder): string {
    return order.user?.name || 'Customer';
  }

  productName(item: OrderItem): string {
    return typeof item.product === 'string' ? 'Product' : item.product?.name || 'Product';
  }

  nextAction(order: DeliveryOrder): 'picked' | 'delivered' | null {
    if (order.status !== 'shipped') return null;
    return order.tracking?.status === 'Picked up' ? 'delivered' : 'picked';
  }
}