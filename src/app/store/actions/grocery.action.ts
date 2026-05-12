import { createAction, props } from "@ngrx/store"
import { Product } from "src/app/models/product.model"


export const loadGroceries = createAction(
    '[Grocery] Load'
);

export const loadGroceriesSuccess = createAction(
    '[Grocery] Load Success',
    props<{ groceries: Product[] }>()
);

export const loadGroceriesFailure = createAction(
    '[Grocery] Load Failure',
    props<{ error: any }>()
);


export const increaseQuantity = createAction(
    "[Grocery] increase",
    props<{ payload: Product }>()
)

export const decreaseQuantity = createAction(
    "[Grocery] decrease",
    props<{ payload: Partial<Product> }>()
)