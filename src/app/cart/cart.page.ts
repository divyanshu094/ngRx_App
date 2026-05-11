import {
  Component,
  inject,
  OnInit,
  signal,
  Signal,
  computed,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonCol,
  IonGrid,
  IonRow,
  IonButton,
  IonButtons,
  IonInput,
  IonIcon,
  IonCard,
  IonLabel,
} from '@ionic/angular/standalone';
import { Observable } from 'rxjs';
import { addIcons } from 'ionicons';
import { remove, add, cart, trash, arrowBack, bagCheck } from 'ionicons/icons';
import { Bucket } from '../models/bucket.model';
import { Grocery } from '../models/grocery.model';
import { Store } from '@ngrx/store';
import { addToBucket, removeFromBucket } from '../store/actions/bucket.action';
import {
  decreaseQuantity,
  increaseQuantity,
} from '../store/actions/grocery.action';
import { RouterLink } from '@angular/router';
import { PaymentService } from '../services/payment.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    IonCard,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    RouterLink,
  ],
})
export class CartPage implements OnInit {
  bucketItems: Signal<Bucket[]> = signal([]);
  totalPrice = computed(() =>
    this.bucketItems().reduce(
      (total, item) => total + (item.price || 0) * item.quantity,
      0,
    ),
  );
  deliveryFee = signal(29); // ₹29 delivery fee like Zepto
  gst = computed(() => Math.round(this.totalPrice() * 0.05)); // 5% GST
  grandTotal = computed(
    () => this.totalPrice() + this.deliveryFee() + this.gst(),
  );
  getFinalPrice = computed(() => this.grandTotal());
  hasItems = computed(() => this.bucketItems().length > 0);
  constructor(
    private store: Store<{ myBucket: Bucket[] }>,
    private paymentService: PaymentService,
  ) {
    addIcons({ arrowBack, remove, add, bagCheck, cart, trash });
    this.bucketItems = toSignal(this.store.select('myBucket'), {
      initialValue: [],
    });
  }

  ngOnInit() {
    // No need for ngOnInit since toSignal handles it
  }

  increment(item: Bucket) {
    const payload: Bucket = {
      id: item.id,
      name: item.name,
      type: item.type || '',
      quantity: 1,
      price: item.price,
      image: item.image,
      description: item.description,
    };
    this.store.dispatch(addToBucket({ payload }));

    const groceryPayload: Grocery = {
      id: item.id,
      name: item.name,
      type: item.type || '',
      quantity: 1,
      price: item.price || 0,
      stock: 0,
      description: item.description || '',
      image: item.image || '',
    };
    this.store.dispatch(increaseQuantity({ payload: groceryPayload }));
  }

  decrement(item: Bucket) {
    const payload = {
      id: item.id,
    };
    this.store.dispatch(removeFromBucket({ payload }));
    this.store.dispatch(decreaseQuantity({ payload: { id: item.id } }));
  }

  async initiatePayment() {
    // const paymentService = inject(PaymentService);
    // const total = this.grandTotal();
    // this.paymentService.payNow(this.grandTotal()); // Using the computed grand total
    this.paymentService.payViaUPI('phonepe');
  }
}
