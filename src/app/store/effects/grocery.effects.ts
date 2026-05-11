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
        this.api.getData('/api/products').pipe(
          map((data: any[]) =>
            loadGroceriesSuccess({
              groceries: data.map(({ _id, ...rest }) => ({
                id: _id,
                quantity: 0,  // initialize quantity
                ...rest
              }))
            })
          ),
          catchError(error => {
            // Return mock data if API fails
            const mockGroceries = [
              {
                id: 1,
                name: "Fresh Tomatoes",
                type: "Vegetables",
                quantity: 0,
                price: 40,
                stock: 50,
                description: "Organic red tomatoes, perfect for salads",
                image: "./assets/icon/favicon.png"
              },
              {
                id: 2,
                name: "Bananas",
                type: "Fruits",
                quantity: 0,
                price: 30,
                stock: 100,
                description: "Sweet and ripe bananas",
                image: "./assets/icon/favicon.png"
              },
              {
                id: 3,
                name: "Milk",
                type: "Dairy",
                quantity: 0,
                price: 25,
                stock: 30,
                description: "Fresh cow milk, 1 liter",
                image: "./assets/icon/favicon.png"
              },
              {
                id: 4,
                name: "Orange Juice",
                type: "Beverages",
                quantity: 0,
                price: 60,
                stock: 20,
                description: "Freshly squeezed orange juice",
                image: "./assets/icon/favicon.png"
              },
              {
                id: 5,
                name: "Potatoes",
                type: "Vegetables",
                quantity: 0,
                price: 20,
                stock: 80,
                description: "Fresh potatoes for cooking",
                image: "./assets/icon/favicon.png"
              },
              {
                id: 6,
                name: "Apples",
                type: "Fruits",
                quantity: 0,
                price: 80,
                stock: 40,
                description: "Crisp red apples",
                image: "./assets/icon/favicon.png"
              },
              {
                id: 7,
                name: "Bread",
                type: "Snacks",
                quantity: 0,
                price: 25,
                stock: 25,
                description: "Fresh whole wheat bread",
                image: "./assets/icon/favicon.png"
              },
              {
                id: 8,
                name: "Cheese",
                type: "Dairy",
                quantity: 0,
                price: 120,
                stock: 15,
                description: "Cheddar cheese block",
                image: "./assets/icon/favicon.png"
              }
            ];
            return of(loadGroceriesSuccess({ groceries: mockGroceries }));
          })
        )
      )
    )
  );
}
