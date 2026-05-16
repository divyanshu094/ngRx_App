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
  imports: [IonContent, CommonModule, IonButton, IonIcon, RouterLink],
})
export class CartPage implements OnInit {
  bucketItems: Signal<Bucket[]> = signal([]);
  selectedAddress = signal('');
  totalPrice = computed(() =>
    this.bucketItems().reduce(
      (total, item) =>
        total +
        ((item.price?.finalAmount ?? item.price?.amount ?? 0) || 0) *
          item.quantity,
      0,
    ),
  );
  deliveryFee = signal(0); // ₹29 delivery fee like Zepto
  // gst = computed(() => Math.round(this.totalPrice() * 0.05)); // 5% GST
  gst = computed(() => Math.round(this.totalPrice() * 0)); // 0% GST
  grandTotal = computed(
    () => this.totalPrice() + this.deliveryFee() + this.gst(),
  );
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

  ionViewWillEnter() {
    const savedAddress = localStorage.getItem('selectedAddress');
    if (savedAddress) {
      const address = JSON.parse(savedAddress);

      this.selectedAddress.set(
        `${address.type} - ${address.street}, ${address.city}`,
      );
    }
  }

  increment(item: Bucket) {
    // Ensure all product properties are explicitly preserved when incrementing
    const payload: Bucket = {
      id: item.id,
      _id: item._id,
      name: item.name,
      description: item.description,
      type: item.type,
      category: item.category,
      brand: item.brand,
      price: item.price,
      stock: item.stock,
      images: item.images,
      image: item.image,
      thumbnail: item.thumbnail,
      discountPercentage: item.discountPercentage,
      rating: item.rating,
      attributes: item.attributes,
      tags: item.tags,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      quantity: 1,
    };
    this.store.dispatch(addToBucket({ payload }));
    this.store.dispatch(increaseQuantity({ payload }));
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
    this.paymentService.payNow(this.grandTotal()); // Using the computed grand total
    // this.paymentService.payViaUPI('phonepe', this.grandTotal());
  }
}
