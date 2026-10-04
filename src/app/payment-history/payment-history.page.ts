import { Component, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { addIcons } from 'ionicons';
import { refreshOutline } from 'ionicons/icons';
import { AppState } from '../store';
import { loadPaymentHistory } from '../store/actions/payment.actions';
import { initialPaymentState } from '../store/reducers/payment.reducer';
import { PaymentTransaction } from '../models/payment-transaction.model';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule, IonButton, IonContent, IonIcon],
  templateUrl: './payment-history.page.html',
})
export class PaymentHistoryPage implements OnInit {
  private readonly paymentState = toSignal(this.store.select('payments'), { initialValue: initialPaymentState });
  transactions = computed(() => this.paymentState().transactions);
  total = computed(() => this.paymentState().total);
  loading = computed(() => this.paymentState().loading);
  errorMessage = computed(() => this.paymentState().error || '');

  constructor(private store: Store<AppState>) {
    addIcons({ refreshOutline });
  }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.store.dispatch(loadPaymentHistory());
  }

  orderNumber(transaction: PaymentTransaction): string {
    if (typeof transaction.order === 'string') return transaction.order;
    return transaction.order?.tracking?.trackingNumber || transaction.order?._id || 'Order';
  }

  amountMajor(transaction: PaymentTransaction): number {
    return transaction.amountMinor / 100;
  }
}