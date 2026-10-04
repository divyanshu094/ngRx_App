import { ActionReducerMap } from '@ngrx/store';
import { bucketReducer } from './reducers/bucket.reducer';
import { categoryReducer } from './reducers/category.reducer';
import { groceryReducer } from './reducers/grocery.reducer';
import { Bucket } from '../models/bucket.model';
import { Category } from '../models/category.model';
import { Product } from '../models/product.model';
import { AuthState, authReducer } from './reducers/auth.reducer';
import { OrderState, orderReducer } from './reducers/order.reducer';
import { PaymentState, paymentReducer } from './reducers/payment.reducer';

export interface AppState {
  groceries: Product[];
  myBucket: Bucket[];
  categories: Category[];
  auth: AuthState;
  orders: OrderState;
  payments: PaymentState;
}

export const reducers: ActionReducerMap<AppState> = {
  groceries: groceryReducer,
  myBucket: bucketReducer,
  categories: categoryReducer,
  auth: authReducer,
  orders: orderReducer,
  payments: paymentReducer,
};