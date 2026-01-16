import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonCol, IonGrid, IonRow, IonButton, IonButtons, IonInput, IonIcon, IonBadge } from '@ionic/angular/standalone';
import { Grocery } from '../models/grocery.model';
import { provideState, Store } from '@ngrx/store';
import { groceryReducer } from '../store/reducers/grocery.reducer';
import { map, Observable } from 'rxjs';
import { addIcons } from 'ionicons';
import { remove, add, cart, trash } from 'ionicons/icons';
import { addToBucket, removeFromBucket } from '../store/actions/bucket.action';
import { Bucket } from '../models/bucket.model';
import { decreaseQuantity, increaseQuantity } from '../store/actions/grocery.action';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../components/header/header.component';
import { ApiService } from '../common/api-service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonList, IonItem, IonCol, IonGrid, IonRow, IonButton,
    IonButtons, IonInput, IonIcon, RouterLink, IonBadge, HeaderComponent, HttpClientModule]
})
export class DashboardPage implements OnInit {
  groceries$?: Observable<Grocery[]>
  constructor(private store: Store<{ groceries: Grocery[] }>, private apiService: ApiService) {
    addIcons({ remove, trash, add, cart });
  }

  ngOnInit() {
    // this.groceries$ = this.store.select("groceries")
    // this.apiService.getData("/api/products").subscribe((res) => {
    //   console.log(res);
    //   this.groceries$ = res;
    // })

    this.groceries$ = this.apiService.getData("/api/products").pipe(
      map((res: any) => res.products || res)
    );
  }

  increment(item: Grocery) {
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
