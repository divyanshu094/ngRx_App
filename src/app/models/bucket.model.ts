import { Product } from './product.model';

export interface Bucket extends Omit<Product, 'quantity'> {
    quantity: number;
}