import { createAction, props } from "@ngrx/store"
import { Grocery } from "src/app/models/grocery.model"

export const increaseQuantity = createAction(
    "[Grocery] increase",
    props<{ payload: Grocery }>()
)

export const decreaseQuantity = createAction(
    "[Grocery] decrease",
    props<{ payload: Partial<Grocery> }>()
)