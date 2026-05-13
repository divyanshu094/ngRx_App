import { ActionReducerMap } from '@ngrx/store';
import { bucketReducer } from './reducers/bucket.reducer';
import { categoryReducer } from './reducers/category.reducer';
import { groceryReducer } from './reducers/grocery.reducer';
import { Bucket } from '../models/bucket.model';
import { Category } from '../models/category.model';
import { Product } from '../models/product.model';

export interface AppState {
  groceries: Product[];
  myBucket: Bucket[];
  categories: Category[];
}

export const reducers: ActionReducerMap<AppState> = {
  groceries: groceryReducer,
  myBucket: bucketReducer,
  categories: categoryReducer,
};