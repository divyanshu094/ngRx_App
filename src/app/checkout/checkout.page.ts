import { Component, computed, OnInit, signal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonRadioGroup, IonRadio } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { location, card, cash, checkmarkCircle, arrowBack, documentText, phonePortrait, wallet } from 'ionicons/icons';
import { Bucket } from '../models/bucket.model';
import { Store } from '@ngrx/store';
import { HeaderComponent } from '../components/header/header.component';
import { ApiService } from '../services/api-service/api-service';
import { AppState } from '../store';
import { placeOrder } from '../store/actions/order.actions';
import { initialOrderState } from '../store/reducers/order.reducer';
import { MOBILE_API_ENDPOINTS, MOBILE_APP_TEXT, MOBILE_STORAGE_KEYS } from '../constants/app.constants';

interface SavedAddress {
  _id: string;
  type: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonRadioGroup, IonRadio, HeaderComponent, RouterLink]
})
export class CheckoutPage implements OnInit {
  readonly text = MOBILE_APP_TEXT;
  bucketItems: Signal<Bucket[]>;
  addresses = signal<SavedAddress[]>([]);
  selectedAddressId = signal('');
  selectedPaymentMethod: 'card' | 'upi' | 'wallet' | 'cod' = 'card';
  deliveryInstructions: string = '';
  private readonly orderState = toSignal(this.store.select('orders'), { initialValue: initialOrderState });
  private readonly addressError = signal('');
  isSubmitting = computed(() => this.orderState().placingOrder);
  errorMessage = computed(() => this.orderState().error || this.addressError());
  successMessage = computed(() => '');
  subtotal = computed(() =>
    this.bucketItems().reduce(
      (total, item) => total + (item.price?.finalAmount ?? item.price?.amount ?? 0) * item.quantity,
      0,
    ),
  );

  constructor(
    private store: Store<AppState>,
    private apiService: ApiService,
  ) {
    this.bucketItems = toSignal(this.store.select('myBucket'), { initialValue: [] });
    addIcons({location,documentText,card,phonePortrait,cash,wallet,checkmarkCircle,arrowBack});
  }

  ngOnInit() {
    this.apiService.getData(MOBILE_API_ENDPOINTS.addresses.list).subscribe({
      next: (response) => {
        this.addresses.set(response?.addresses ?? []);
        const savedAddressId = this.getSavedAddressId();
        const addresses = this.addresses();
        this.selectedAddressId.set(
          addresses.find((address) => address._id === savedAddressId)?._id ??
          addresses.find((address) => address.isDefault)?._id ??
          addresses[0]?._id ??
          '',
        );
      },
      error: (error) => this.addressError.set(this.messageFrom(error)),
    });
  }

  formatAddress(address: SavedAddress): string {
    return `${address.type} · ${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
  }

  placeOrder() {
    if (this.isSubmitting()) return;
    this.addressError.set('');

    if (!this.bucketItems().length) {
      this.addressError.set(this.text.checkout.cartEmpty);
      return;
    }
    if (!this.selectedAddressId()) {
      this.addressError.set(this.text.checkout.chooseAddress);
      return;
    }

    this.addressError.set('');
    localStorage.setItem(MOBILE_STORAGE_KEYS.selectedAddress, JSON.stringify(
      this.addresses().find((address) => address._id === this.selectedAddressId()),
    ));
    this.store.dispatch(placeOrder({
      request: {
        addressId: this.selectedAddressId(),
        paymentMethod: this.selectedPaymentMethod,
        notes: this.deliveryInstructions,
        items: this.bucketItems().map((item) => ({
          product: item._id ?? item.id,
          quantity: item.quantity,
        })),
      },
    }));
  }

  private getSavedAddressId(): string {
    try {
      return JSON.parse(localStorage.getItem(MOBILE_STORAGE_KEYS.selectedAddress) || '{}')._id ?? '';
    } catch {
      return '';
    }
  }

  private messageFrom(error: any): string {
    return error?.error?.message || error?.message || this.text.errors.unableCheckout;
  }
}
