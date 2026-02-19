import { createReducer, on } from "@ngrx/store";
import { Grocery } from "src/app/models/grocery.model";
import { decreaseQuantity, increaseQuantity, loadGroceriesSuccess } from "../actions/grocery.action";


const initialState: Grocery[] = []

// export const groceryReducer=createReducer(initialState);

export const groceryReducer = createReducer(
    initialState,
    on(loadGroceriesSuccess, (state, { groceries }) => {
        return groceries;
    }),

    on(increaseQuantity, (state, action) => {
        const bucketItem = state.find(item => item.id === action.payload.id)
        if (bucketItem) {
            return state.map(item => {
                return item.id === action.payload.id ? { ...item, quantity: item.quantity + action.payload.quantity } : item;
            })
        } else {
            return [
                ...state,
                action.payload
            ]
        }
    }),
    on(decreaseQuantity, (state, action) => {
        const existingItem = state.find(item => item.id === action.payload.id)
        if (existingItem && existingItem.quantity >= 1) {
            return state.map(item => {
                return item.id === action.payload.id ? { ...item, quantity: item.quantity - 1 } : item;
            })
        } else {
            return state//.filter(item => item.id !== action.payload.id)
        }
    })
);