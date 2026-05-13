import { createReducer, on } from '@ngrx/store';
import { Category } from 'src/app/models/category.model';
import { loadCategoriesSuccess } from '../actions/category.action';

const initialState: Category[] = [];

export const categoryReducer = createReducer(
  initialState,
  on(loadCategoriesSuccess, (_state, { categories }) => categories),
);
