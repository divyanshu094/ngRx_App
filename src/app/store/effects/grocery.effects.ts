import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { loadGroceries, loadGroceriesSuccess, loadGroceriesFailure } from '../actions/grocery.action';
import { catchError, map, switchMap, of } from 'rxjs';
import { ApiService } from 'src/app/services/api-service/api-service';

@Injectable()
export class GroceryEffects {

  private actions$ = inject(Actions);
  private api = inject(ApiService);

  loadGroceries$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadGroceries),
      switchMap(() =>
        this.api.getData('products').pipe(
          map((response: any) => {
            const products: any[] = Array.isArray(response)
              ? response
              : response?.data ?? response?.products ?? [];

            return loadGroceriesSuccess({
              groceries: products.map((product) => ({
                id: product._id ?? product.id,
                _id: product._id ?? undefined,
                quantity: 0,
                name: product.name ?? product.title ?? 'Unknown',
                type: product.type ?? product.category ?? 'Other',
                category: product.category ?? product.type ?? 'General',
                brand: product.brand ?? 'Unknown',
                description: product.description ?? product.summary ?? '',
                price: typeof product.price === 'object'
                  ? {
                      currency: product.price.currency ?? 'INR',
                      amount: product.price.amount ?? product.price.finalAmount ?? 0,
                      discount: product.price.discount,
                      finalAmount: product.price.finalAmount ?? product.price.amount ?? 0,
                    }
                  : {
                      currency: 'INR',
                      amount: Number(product.price ?? 0),
                      finalAmount: Number(product.price ?? 0),
                    },
                stock: typeof product.stock === 'object'
                  ? {
                      quantity: product.stock.quantity ?? 0,
                      availability: product.stock.availability ?? true,
                    }
                  : {
                      quantity: Number(product.stock ?? 0),
                      availability: Number(product.stock ?? 0) > 0,
                    },
                images: Array.isArray(product.images)
                  ? product.images
                  : product.images ? [product.images] : [],
                image: Array.isArray(product.images)
                  ? product.images[0] ?? ''
                  : product.image ?? product.thumbnail ?? '',
                discountPercentage: product.discountPercentage ?? product.discount ?? product.discountPercent ?? 0,
                rating: typeof product.rating === 'object'
                  ? {
                      average: product.rating.average ?? 0,
                      count: product.rating.count ?? 0,
                    }
                  : { average: 0, count: 0 },
                attributes: product.attributes ?? product.attrs ?? {},
                tags: Array.isArray(product.tags) ? product.tags : [],
                createdAt: product.createdAt ?? product.created_at ?? '',
                updatedAt: product.updatedAt ?? product.updated_at ?? '',
              }))
            });
          }),
          catchError(error => {
            console.error('Error loading groceries:', error);
            return of(loadGroceriesFailure({ error }));
          })
        )
      )
    )
  );
}
