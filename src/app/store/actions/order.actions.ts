import { createAction, props } from '@ngrx/store';
import { CustomerOrder, DeliveryOrder, OrderTracking, PlaceOrderRequest } from '../../models/order.model';

export const loadOrders = createAction('[Orders] Load');
export const loadOrdersSuccess = createAction(
  '[Orders] Load Success',
  props<{ orders: CustomerOrder[] }>(),
);
export const loadOrdersFailure = createAction(
  '[Orders] Load Failure',
  props<{ error: string }>(),
);

export const placeOrder = createAction(
  '[Checkout] Place Order',
  props<{ request: PlaceOrderRequest }>(),
);
export const placeOrderSuccess = createAction(
  '[Checkout] Place Order Success',
  props<{ order: CustomerOrder }>(),
);
export const placeOrderFailure = createAction(
  '[Checkout] Place Order Failure',
  props<{ error: string; order?: CustomerOrder }>(),
);

export const payOrder = createAction('[Orders] Pay Order', props<{ orderId: string }>());
export const payOrderSuccess = createAction('[Orders] Pay Order Success');
export const payOrderFailure = createAction(
  '[Orders] Pay Order Failure',
  props<{ error: string }>(),
);

export const cancelOrder = createAction('[Orders] Cancel Order', props<{ orderId: string }>());
export const cancelOrderSuccess = createAction(
  '[Orders] Cancel Order Success',
  props<{ order: CustomerOrder }>(),
);
export const cancelOrderFailure = createAction(
  '[Orders] Cancel Order Failure',
  props<{ error: string }>(),
);

export const trackOrder = createAction('[Orders] Track Order', props<{ orderId: string }>());
export const trackOrderUpdate = createAction(
  '[Orders] Track Order Update',
  props<{ tracking: OrderTracking }>(),
);
export const trackOrderFailure = createAction(
  '[Orders] Track Order Failure',
  props<{ error: string }>(),
);
export const stopTrackingOrder = createAction('[Orders] Stop Tracking');

export const loadDeliveryQueue = createAction('[Delivery] Load Queue');
export const loadDeliveryQueueSuccess = createAction(
  '[Delivery] Load Queue Success',
  props<{ available: DeliveryOrder[]; assigned: DeliveryOrder[] }>(),
);
export const loadDeliveryQueueFailure = createAction(
  '[Delivery] Load Queue Failure',
  props<{ error: string }>(),
);
export const updateDeliveryOrder = createAction(
  '[Delivery] Update Order',
  props<{ orderId: string; action: 'accept' | 'picked' | 'delivered' }>(),
);
export const updateDeliveryOrderSuccess = createAction('[Delivery] Update Order Success');
export const updateDeliveryOrderFailure = createAction(
  '[Delivery] Update Order Failure',
  props<{ error: string }>(),
);
export const updateAgentLocation = createAction(
  '[Delivery] Update Location',
  props<{ latitude: number; longitude: number }>(),
);
export const updateAgentLocationFailure = createAction(
  '[Delivery] Update Location Failure',
  props<{ error: string }>(),
);