import { createAction, props } from '@ngrx/store';
import { Category } from 'src/app/models/category.model';

export const loadCategories = createAction('[Category] Load');

export const loadCategoriesSuccess = createAction(
  '[Category] Load Success',
  props<{ categories: Category[] }>(),
);

export const loadCategoriesFailure = createAction(
  '[Category] Load Failure',
  props<{ error: any }>(),
);
