import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { loadCategories, loadCategoriesSuccess, loadCategoriesFailure } from '../actions/category.action';
import { catchError, map, switchMap, of } from 'rxjs';
import { ApiService } from 'src/app/services/api-service/api-service';

@Injectable()
export class CategoryEffects {

  private actions$ = inject(Actions);
  private api = inject(ApiService);

  loadCategories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadCategories),
      switchMap(() => {
        return this.api.getData('categories').pipe(
          map((response: any) => {
            const rawCategories: any[] = Array.isArray(response)
              ? response
              : Array.isArray(response?.categories)
              ? response.categories
              : Array.isArray(response?.data)
              ? response.data
              : [];

            const categories = rawCategories.map((category: any, index: number) => ({
              id: category.id ?? category._id ?? category.name ?? category.title ?? index,
              name: category.name ?? category.title ?? String(category),
              title: category.title ?? category.name ?? String(category),
              image: category.image ?? category.thumbnail ?? category.icon ?? '',
            }));

            return loadCategoriesSuccess({ categories });
          }),
          catchError(error => {
            console.error('Error loading categories:', error);
            return of(loadCategoriesFailure({ error }));
          }),
        );
      }),
    ),
  );
}
