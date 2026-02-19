import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { loadGroceries, loadGroceriesSuccess, loadGroceriesFailure } from '../actions/grocery.action';
import { catchError, map, switchMap, of } from 'rxjs';
import { ApiService } from 'src/app/common/api-service';

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
          catchError(error => of(loadGroceriesFailure({ error })))
        )
      )
    )
  );
}
