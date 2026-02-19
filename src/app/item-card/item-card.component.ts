import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Grocery } from '../models/grocery.model';
import { increaseQuantity, decreaseQuantity } from '../store/actions/grocery.action';
import { IonCard, IonCardContent, IonButton, IonIcon } from "@ionic/angular/standalone";
import { addToBucket, removeFromBucket } from '../store/actions/bucket.action';

@Component({
  selector: 'app-item-card',
  templateUrl: './item-card.component.html',
  styleUrls: ['./item-card.component.scss'],
  imports: [IonIcon, IonButton, IonCard, IonCardContent],
})
export class ItemCardComponent implements OnInit {

  @Input() item!: Grocery;

  constructor(private store: Store) { }
  ngOnInit(): void {
  }

  increase(item: Grocery) {
    const payload: any = {
      id: item.id,
      name: item.name,
      quantity: 1
    }
    this.store.dispatch(addToBucket({ payload: payload }));
    this.store.dispatch(increaseQuantity({ payload: payload }));
  }

  decrease(item: any) {
    const payload: any = {
      id: item.id,
    }
    this.store.dispatch(removeFromBucket({ payload: payload }));
    this.store.dispatch(decreaseQuantity({ payload: payload }));
  }

}
