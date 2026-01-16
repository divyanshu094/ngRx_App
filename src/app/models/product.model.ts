export interface Price {
  currency: string;
  amount: number;
  discount?: {
    type: 'percentage' | 'flat';
    value: number;
  };
  finalAmount: number;
}

export interface Stock {
  quantity: number;
  availability: boolean;
}

export interface Rating {
  average: number;
  count: number;
}

export interface Attributes {
  color?: string;
  connectivity?: string;
  batteryLife?: string;
  weight?: string;
  [key: string]: string | number | boolean | undefined; // flexibility
}

export interface Product {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  brand: string;
  price: Price;
  stock: Stock;
  images: string[];
  rating: Rating;
  attributes: Attributes;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
