import { Component, OnInit, computed, signal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonItem,
  IonButton,
  IonInput,
  IonIcon,
} from '@ionic/angular/standalone';
import { Grocery } from '../models/grocery.model';
import { Store } from '@ngrx/store';
import { addIcons } from 'ionicons';
import {
  remove,
  add,
  cart,
  trash,
  search,
  location,
  chevronDown,
} from 'ionicons/icons';
import { addToBucket, removeFromBucket } from '../store/actions/bucket.action';
import { Bucket } from '../models/bucket.model';
import {
  decreaseQuantity,
  increaseQuantity,
  loadGroceries,
} from '../store/actions/grocery.action';
import { RouterLink } from '@angular/router';
import { ApiService } from '../common/api-service';
import { FirebaseCrashlytics } from '@capacitor-firebase/crashlytics';
import { LoggerService } from '../services/logger-service';
import { ItemCardComponent } from '../item-card/item-card.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    IonButton,
    IonItem,
    IonIcon,
    IonInput,
    RouterLink,
    ItemCardComponent,
  ],
})
export class DashboardPage implements OnInit {
  groceries: Signal<Grocery[]> = signal<Grocery[]>([]);
  bucketItems: Signal<Bucket[]> = signal([]);
  bucketCount = computed(() =>
    this.bucketItems().reduce((count, item) => count + item.quantity, 0),
  );
  searchTerm = signal('');
  selectedCategory = signal('All');
  filteredGroceries = computed(() =>
    this.filterGroceries(
      this.groceries(),
      this.searchTerm(),
      this.selectedCategory(),
    ),
  );
  categories: { id: number; name: string; image: string }[] = [
    {
      id: 1,
      name: 'All',
      image: './assets/icon/favicon.png',
    },
    {
      id: 2,
      name: 'Vegetables',
      image: './assets/icon/favicon.png',
    },
    {
      id: 3,
      name: 'Fruits',
      image: './assets/icon/favicon.png',
    },
    {
      id: 4,
      name: 'Beverages',
      image: './assets/icon/favicon.png',
    },
    {
      id: 5,
      name: 'Dairy',
      image: './assets/icon/favicon.png',
    },
    {
      id: 6,
      name: 'Snacks',
      image: './assets/icon/favicon.png',
    },
  ];

  constructor(
    private store: Store<{ groceries: Grocery[]; myBucket: Bucket[] }>,
    private apiService: ApiService,
    private logger: LoggerService,
  ) {
    addIcons({ location, chevronDown, search, remove, trash, add, cart });
    this.groceries = toSignal(this.store.select('groceries'), {
      initialValue: [],
    });
    this.bucketItems = toSignal(this.store.select('myBucket'), {
      initialValue: [],
    });
  }

  ngOnInit() {
    this.store.dispatch(loadGroceries());
  }

  onSearchChange(event: any) {
    this.searchTerm.set(event.detail?.value ?? '');
  }

  setCategory(category: string) {
    this.selectedCategory.set(category);
  }

  private filterGroceries(
    groceries: Grocery[],
    search: string,
    category: string,
  ): Grocery[] {
    return groceries.filter((grocery) => {
      const matchesSearch =
        !search ||
        grocery.name.toLowerCase().includes(search.toLowerCase()) ||
        grocery.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = category === 'All' || grocery.type === category;

      return matchesSearch && matchesCategory;
    });
  }

  ionViewDidEnter() {
    this.setUserContext({ id: '10', role: 'user' });
  }

  setUserContext(user: any) {
    FirebaseCrashlytics.setUserId(user.id); // Use hashed ID in real apps
    FirebaseCrashlytics.setCustomKey({
      key: 'role',
      value: user.role,
      type: 'string',
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
