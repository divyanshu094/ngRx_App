export interface OrderItem {
  _id?: string;
  product: {
    _id?: string;
    name?: string;
    images?: string[];
    image?: string;
  } | string;
  quantity: number;
  price: number;
}

export interface CustomerOrder {
  _id: string;
  status: string;
  total: number;
  subtotal: number;
  items: OrderItem[];
  payment: {
    method: string;
    status: string;
  };
  tracking?: {
    trackingNumber?: string;
    status?: string;
    estimatedDelivery?: string | null;
  };
  createdAt?: string;
}

export interface DeliveryOrder extends CustomerOrder {
  user?: { name?: string; phone?: string };
}

export interface OrderTracking {
  orderId: string;
  status: string;
  tracking: CustomerOrder['tracking'];
  deliveryAgent: {
    name: string;
    phone?: string;
    vehicleType?: string;
  } | null;
}

export interface PlaceOrderRequest {
  addressId: string;
  paymentMethod: 'card' | 'upi' | 'wallet' | 'cod';
  notes?: string;
  items: Array<{ product: string; quantity: number }>;
}