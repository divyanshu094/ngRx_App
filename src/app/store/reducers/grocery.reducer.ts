import { createReducer, on } from "@ngrx/store";
import { Grocery } from "src/app/models/grocery.model";
import { decreaseQuantity, increaseQuantity } from "../actions/grocery.action";


const initialState:Grocery[] = [
    { "id": 1, "name": "milk", "type": "fruit","quantity":0 },
    { "id": 2, "name": "banana", "type": "fruit","quantity":0 },
    { "id": 3, "name": "chips", "type": "snacks","quantity":0 },
    { "id": 4, "name": "chocolate", "type": "snacks","quantity":0 }
]

// export const groceryReducer=createReducer(initialState);

export const groceryReducer = createReducer(
    initialState,
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