import { Component, OnInit, computed, signal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonItem,
  IonButton,
  IonInput,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
} from '@ionic/angular/standalone';
import { Product } from '../models/product.model';
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
import { loadCategories } from '../store/actions/category.action';
import { RouterLink } from '@angular/router';
import { FirebaseCrashlytics } from '@capacitor-firebase/crashlytics';
import { LoggerService } from '../services/logger-service';
import { ItemCardComponent } from '../item-card/item-card.component';
import { AppState } from '../store';
import { Category } from '../models/category.model';

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
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    RouterLink,
    ItemCardComponent,
  ],
})
export class DashboardPage implements OnInit {
  isScrolled = signal(false);
  groceries: Signal<Product[]> = signal<Product[]>([]);
  bucketItems: Signal<Bucket[]> = signal([]);
  categories: Signal<Category[]> = signal<Category[]>([]);
  currentPage = 1;
  hasMore = signal(true);
  isLoadingMore = signal(false);
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

  constructor(
    private store: Store<AppState>,
    private logger: LoggerService,
  ) {
    addIcons({ location, chevronDown, search, remove, trash, add, cart });
    this.groceries = toSignal(this.store.select('groceries'), {
      initialValue: [],
    });
    this.bucketItems = toSignal(this.store.select('myBucket'), {
      initialValue: [],
    });
    this.categories = toSignal(this.store.select('categories'), {
      initialValue: [],
    });
  }

  ngOnInit() {
    this.currentPage = 1;
    this.store.dispatch(loadGroceries({ page: 1, append: false }));
    this.store.dispatch(loadCategories());
  }

  loadMore(event: any) {
    if (this.isLoadingMore() || !this.hasMore()) {
      event.target.complete();
      return;
    }

    this.isLoadingMore.set(true);
    const nextPage = this.currentPage + 1;
    this.store.dispatch(loadGroceries({ page: nextPage, append: true }));
    this.currentPage = nextPage;
    this.isLoadingMore.set(false);
    event.target.complete();
  }

  onScroll(event: any) {
    const scrollTop = event.detail.scrollTop;
    this.isScrolled.set(scrollTop > 40);
  }

  onSearchChange(event: any) {
    this.searchTerm.set(event.detail?.value ?? '');
  }

  setCategory(category: string) {
    this.selectedCategory.set(category);
  }

  private filterGroceries(
    groceries: Product[],
    search: string,
    category: string,
  ): Product[] {
    return groceries.filter((grocery) => {
      const matchesSearch =
        !search ||
        grocery.name.toLowerCase().includes(search.toLowerCase()) ||
        grocery.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || grocery.category === category;

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
