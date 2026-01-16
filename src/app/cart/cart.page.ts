import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonCol, IonGrid, IonRow, IonButton, IonButtons, IonInput, IonIcon } from '@ionic/angular/standalone';
import { Observable } from 'rxjs';
import { addIcons } from 'ionicons';
import { remove, add, cart, trash } from 'ionicons/icons';
import { Bucket } from '../models/bucket.model';
import { Store } from '@ngrx/store';
import { addToBucket, removeFromBucket } from '../store/actions/bucket.action';
import { decreaseQuantity, increaseQuantity } from '../store/actions/grocery.action';
import { HeaderComponent } from '../components/header/header.component';


@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonList, IonItem, IonCol, IonGrid, IonRow, IonButton,
    IonButtons, IonInput, IonIcon,HeaderComponent]
})
export class CartPage implements OnInit {

    bucket$?: Observable<Bucket[]>
    constructor(private store: Store<{ myBucket: Bucket[] }>) {
      addIcons({ add, remove, cart,trash });
    }

  ngOnInit() {
      this.bucket$ = this.store.select("myBucket")
    }
  
    increment(item: Bucket) {
      const payload: any = {
        id: item.id,
        name: item.name,
        quantity: 1
      }
      this.store.dispatch(addToBucket({ payload: payload }));
      this.store.dispatch(increaseQuantity({ payload: payload }));
    }
  
    decrement(item: any) {
      const payload: any = {
        id: item.id,
      }
      this.store.dispatch(removeFromBucket({ payload: payload }));
      this.store.dispatch(decreaseQuantity({ payload: payload }));
    }
  

}
