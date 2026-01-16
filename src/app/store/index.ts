import { ActionReducerMap } from '@ngrx/store';
import { bucketReducer } from './reducers/bucket.reducer';
import { groceryReducer } from './reducers/grocery.reducer';

export interface AppState {
//   groceries: GroceryState;
//   myBucket: BucketState;
}

export const reducers: ActionReducerMap<AppState> = {
  groceries: groceryReducer,
  myBucket: bucketReducer,
};