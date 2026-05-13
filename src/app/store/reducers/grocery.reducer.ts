import { createReducer, on } from "@ngrx/store";
import { Product } from "src/app/models/product.model";
import { decreaseQuantity, increaseQuantity, loadGroceriesSuccess } from "../actions/grocery.action";


const initialState: Product[] = []

export const groceryReducer = createReducer(
    initialState,
  
    on(loadGroceriesSuccess, (state, { groceries, append }) => {
        const nextProducts = groceries.map(product => {
            const existing = state.find(s => s.id === product.id);

            return {
                ...product,
                quantity: existing?.quantity ?? product.quantity ?? 0
            };
        });

        if (append) {
            const newProducts = nextProducts.filter(product => !state.some(s => s.id === product.id));
            return [...state, ...newProducts];
        }

        return nextProducts;
    }),

    on(increaseQuantity, (state, action) => {
        const bucketItem = state.find(item => item.id === action.payload.id)
        if (bucketItem) {
            return state.map(item => {
                return item.id === action.payload.id ? { ...item, quantity: (item.quantity ?? 0) + (action.payload.quantity ?? 0) } : item;
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
        if (existingItem && (existingItem.quantity ?? 0) >= 1) {
            return state.map(item => {
                return item.id === action.payload.id ? { ...item, quantity: (item.quantity ?? 0) - 1 } : item;
            })
        } else {
            return state//.filter(item => item.id !== action.payload.id)
        }
    })
);