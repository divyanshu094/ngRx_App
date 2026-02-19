import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonCol, IonGrid, IonRow, IonButton, IonButtons, IonInput, IonIcon, IonBadge } from '@ionic/angular/standalone';
import { Grocery } from '../models/grocery.model';
import { provideState, Store } from '@ngrx/store';
import { groceryReducer } from '../store/reducers/grocery.reducer';
import { map, Observable, of } from 'rxjs';
import { addIcons } from 'ionicons';
import { remove, add, cart, trash } from 'ionicons/icons';
import { addToBucket, removeFromBucket } from '../store/actions/bucket.action';
import { Bucket } from '../models/bucket.model';
import { decreaseQuantity, increaseQuantity, loadGroceries } from '../store/actions/grocery.action';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../components/header/header.component';
import { ApiService } from '../common/api-service';
import { HttpClientModule } from '@angular/common/http';
import { FirebaseCrashlytics } from '@capacitor-firebase/crashlytics';
import { LoggerService } from '../services/logger-service';
import { ItemCardComponent } from "../item-card/item-card.component";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonList, IonItem, IonCol, IonGrid, IonRow, IonButton,
    IonButtons, IonInput, IonIcon, RouterLink, IonBadge, HeaderComponent, HttpClientModule, ItemCardComponent]
})
export class DashboardPage implements OnInit {
  groceries$?: Observable<Grocery[]>
  constructor(private store: Store<{ groceries: Grocery[] }>, private apiService: ApiService, private logger: LoggerService) {
    addIcons({ remove, trash, add, cart });
  }

  ngOnInit() {
    this.store.dispatch(loadGroceries());
    this.groceries$ = this.store.select("groceries")
    // this.apiService.getData("/api/products").subscribe((res) => {
    //   console.log(res);
    //   this.groceries$ = of(res);
    // })

  //   this.groceries$ = this.apiService.getData("/api/products").pipe(
  //   map((products: any[]) =>
  //     products.map(({ _id, ...rest }) => ({
  //       id: _id,
  //       ...rest
  //     }))
  //   )
  // );

    // this.groceries$ = this.apiService.getData("/api/products").pipe(
    //   map((res: any) => res.products || res)
    // );
  }

  ionViewDidEnter() {
    this.setUserContext({ id: "10", role: "user" });
  }

  setUserContext(user: any) {
    FirebaseCrashlytics.setUserId(user.id); // Use hashed ID in real apps
    FirebaseCrashlytics.setCustomKey({
      key: 'role',
      value: user.role,
      type: 'string'
    });
    this.logger.debug('Entered PaymentPage');
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
