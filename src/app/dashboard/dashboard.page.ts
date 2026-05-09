import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonItem, IonButton, IonInput, IonIcon, IonBadge, IonRadioGroup, IonRadio } from '@ionic/angular/standalone';
import { Grocery } from '../models/grocery.model';
import { provideState, Store } from '@ngrx/store';
import { groceryReducer } from '../store/reducers/grocery.reducer';
import { map, Observable, of, combineLatest, startWith } from 'rxjs';
import { addIcons } from 'ionicons';
import { remove, add, cart, trash, search, location, chevronDown } from 'ionicons/icons';
import { addToBucket, removeFromBucket } from '../store/actions/bucket.action';
import { Bucket } from '../models/bucket.model';
import { decreaseQuantity, increaseQuantity, loadGroceries } from '../store/actions/grocery.action';
import { RouterLink } from '@angular/router';
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
  imports: [IonContent, CommonModule, FormsModule, IonButton, IonItem, IonIcon, IonInput, IonBadge, RouterLink, HttpClientModule, ItemCardComponent]
})
export class DashboardPage implements OnInit {
  groceries$?: Observable<Grocery[]>
  filteredGroceries$?: Observable<Grocery[]>
  bucketCount$?: Observable<number>;
  searchTerm: string = '';
  selectedCategory: string = 'All';
  categories: string[] = ['Vegetables', 'Fruits', 'Beverages', 'Dairy', 'Snacks'];

  constructor(private store: Store<{ groceries: Grocery[]; myBucket: Bucket[] }>, private apiService: ApiService, private logger: LoggerService) {
    addIcons({location,chevronDown,search,remove,trash,add,cart});
  }

  ngOnInit() {
    this.store.dispatch(loadGroceries());
    this.groceries$ = this.store.select("groceries");
    this.bucketCount$ = this.store.select("myBucket").pipe(
      map(items => items ? items.reduce((count, item) => count + item.quantity, 0) : 0)
    );

    // Create filtered groceries observable
    this.filteredGroceries$ = combineLatest([
      this.groceries$.pipe(startWith([])),
      of(this.searchTerm).pipe(startWith('')),
      of(this.selectedCategory).pipe(startWith('All'))
    ]).pipe(
      map(([groceries, search, category]) => this.filterGroceries(groceries, search, category))
    );

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

  onSearchChange(event: any) {
    this.searchTerm = event.target.value || '';
    this.updateFilteredGroceries();
  }

  setCategory(category: string) {
    this.selectedCategory = category;
    this.updateFilteredGroceries();
  }

  private updateFilteredGroceries() {
    this.filteredGroceries$ = combineLatest([
      this.groceries$!,
      of(this.searchTerm),
      of(this.selectedCategory)
    ]).pipe(
      map(([groceries, search, category]) => this.filterGroceries(groceries, search, category))
    );
  }

  private filterGroceries(groceries: Grocery[], search: string, category: string): Grocery[] {
    return groceries.filter(grocery => {
      const matchesSearch = !search ||
        grocery.name.toLowerCase().includes(search.toLowerCase()) ||
        grocery.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = category === 'All' || grocery.type === category;

      return matchesSearch && matchesCategory;
    });
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

  // increment(item: Grocery) {
  //   const payload: any = {
  //     id: item.id,
  //     name: item.name,
  //     quantity: 1
  //   }
  //   this.store.dispatch(addToBucket({ payload: payload }));
  //   this.store.dispatch(increaseQuantity({ payload: payload }));
  // }

  // decrement(item: any) {
  //   const payload: any = {
  //     id: item.id,
  //   }
  //   this.store.dispatch(removeFromBucket({ payload: payload }));
  //   this.store.dispatch(decreaseQuantity({ payload: payload }));
  // }

}
