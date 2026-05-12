import { ActionReducerMap } from '@ngrx/store';
import { bucketReducer } from './reducers/bucket.reducer';
import { groceryReducer } from './reducers/grocery.reducer';
import { Bucket } from '../models/bucket.model';
import { Product } from '../models/product.model';

export interface AppState {
  groceries: Product[];
  myBucket: Bucket[];
}

export const reducers: ActionReducerMap<AppState> = {
  groceries: groceryReducer,
  myBucket: bucketReducer,
};