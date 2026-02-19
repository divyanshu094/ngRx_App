import { createAction, props } from "@ngrx/store"
import { Grocery } from "src/app/models/grocery.model"


export const loadGroceries = createAction(
    '[Grocery] Load'
);

export const loadGroceriesSuccess = createAction(
    '[Grocery] Load Success',
    props<{ groceries: Grocery[] }>()
);

export const loadGroceriesFailure = createAction(
    '[Grocery] Load Failure',
    props<{ error: any }>()
);


export const increaseQuantity = createAction(
    "[Grocery] increase",
    props<{ payload: Grocery }>()
)

export const decreaseQuantity = createAction(
    "[Grocery] decrease",
    props<{ payload: Partial<Grocery> }>()
)