import { Component, computed, OnInit, signal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonRadioGroup, IonRadio } from '@ionic/angular/standalone';
import { Router, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { location, card, cash, checkmarkCircle, arrowBack, documentText, phonePortrait, wallet } from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
import { Bucket } from '../models/bucket.model';
import { Store } from '@ngrx/store';
import { HeaderComponent } from '../components/header/header.component';
import { ApiService } from '../services/api-service/api-service';
import { PaymentService } from '../services/payment.service';
import { clearBucket } from '../store/actions/bucket.action';

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
  bucketItems: Signal<Bucket[]>;
  addresses = signal<SavedAddress[]>([]);
  selectedAddressId = signal('');
  selectedPaymentMethod: 'card' | 'upi' | 'wallet' | 'cod' = 'card';
  deliveryInstructions: string = '';
  isSubmitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  subtotal = computed(() =>
    this.bucketItems().reduce(
      (total, item) => total + (item.price?.finalAmount ?? item.price?.amount ?? 0) * item.quantity,
      0,
    ),
  );

  constructor(
    private store: Store<{ myBucket: Bucket[] }>,
    private router: Router,
    private apiService: ApiService,
    private paymentService: PaymentService,
  ) {
    this.bucketItems = toSignal(this.store.select('myBucket'), { initialValue: [] });
    addIcons({location,documentText,card,phonePortrait,cash,wallet,checkmarkCircle,arrowBack});
  }

  ngOnInit() {
    this.apiService.getData('addresses').subscribe({
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
      error: (error) => this.errorMessage.set(this.messageFrom(error)),
    });
  }

  formatAddress(address: SavedAddress): string {
    return `${address.type} · ${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
  }

  async placeOrder() {
    if (this.isSubmitting()) return;
    this.errorMessage.set('');

    if (!this.bucketItems().length) {
      this.errorMessage.set('Your cart is empty.');
      return;
    }
    if (!this.selectedAddressId()) {
      this.errorMessage.set('Choose or add a delivery address to continue.');
      return;
    }

    this.isSubmitting.set(true);
    try {
      const response = await firstValueFrom(
        this.apiService.postData('orders', {
          addressId: this.selectedAddressId(),
          paymentMethod: this.selectedPaymentMethod,
          notes: this.deliveryInstructions,
          items: this.bucketItems().map((item) => ({
            product: item._id ?? item.id,
            quantity: item.quantity,
          })),
        }),
      );
      const order = response?.order ?? response;
      const orderId = order?._id ?? order?.id;
      if (!orderId) throw new Error('The server did not return an order.');

      localStorage.setItem('selectedAddress', JSON.stringify(
        this.addresses().find((address) => address._id === this.selectedAddressId()),
      ));

      if (this.selectedPaymentMethod === 'cod') {
        this.completeOrder('Order placed. Payment is due on delivery.');
        return;
      }

      const paymentOrder = await firstValueFrom(
        this.paymentService.createRazorpayOrder(orderId),
      );
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const payment = await this.paymentService.openCheckout({
        key: paymentOrder.key,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: 'Grocery Delivery',
        description: 'Payment for your order',
        order_id: paymentOrder.orderId,
        prefill: { email: user.email, contact: user.phone },
        theme: { color: '#16a34a' },
      });
      const verification = await firstValueFrom(
        this.paymentService.verifyRazorpayPayment({ ...payment, orderId }),
      );
      if (!verification.success) throw new Error('Payment verification failed.');

      this.completeOrder('Payment confirmed. Your order is placed.');
    } catch (error) {
      this.errorMessage.set(this.messageFrom(error));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private completeOrder(message: string) {
    this.store.dispatch(clearBucket());
    this.successMessage.set(message);
  }

  private getSavedAddressId(): string {
    try {
      return JSON.parse(localStorage.getItem('selectedAddress') || '{}')._id ?? '';
    } catch {
      return '';
    }
  }

  private messageFrom(error: any): string {
    return error?.error?.message || error?.message || 'Unable to complete checkout.';
  }
}
