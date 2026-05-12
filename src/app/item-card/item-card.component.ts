import { Component, computed, Input, OnInit, signal, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { Product } from '../models/product.model';
import { Bucket } from '../models/bucket.model';
import {
  increaseQuantity,
  decreaseQuantity,
} from '../store/actions/grocery.action';
import {
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addToBucket, removeFromBucket } from '../store/actions/bucket.action';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-item-card',
  templateUrl: './item-card.component.html',
  styleUrls: ['./item-card.component.scss'],
  imports: [IonIcon, IonButton, IonCard, IonCardContent, CurrencyPipe],
})
export class ItemCardComponent implements OnInit {
  @Input() item!: Product;

  itemSignal = signal<Product | null>(null);

  discountedPrice = computed(() => {
    const product = this.itemSignal();

    if (!product) return 0;

    const price = product.price?.amount ?? 0;
    const discount = product.discountPercentage ?? 0;

    return Number((price - (price * discount) / 100).toFixed(2));
  });

  constructor(private store: Store) {}
  ngOnInit(): void {}

   ngOnChanges(changes: SimpleChanges): void {
    if (changes['item']) {
      this.itemSignal.set(this.item);
    }
  }

  increase(item: Product) {
    // Ensure all product properties are explicitly preserved
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

  decrease(item: Product) {
    const payload = {
      id: item.id,
    };
    this.store.dispatch(removeFromBucket({ payload }));
    this.store.dispatch(decreaseQuantity({ payload }));
  }
}
