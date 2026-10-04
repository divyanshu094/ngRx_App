import { createReducer, on } from '@ngrx/store';
import { CustomerOrder, DeliveryOrder, OrderTracking } from '../../models/order.model';
import * as OrderActions from '../actions/order.actions';

export interface OrderState {
  orders: CustomerOrder[];
  trackingOrderId: string | null;
  tracking: OrderTracking | null;
  loading: boolean;
  placingOrder: boolean;
  payingOrder: boolean;
  error: string | null;
  availableDeliveryOrders: DeliveryOrder[];
  assignedDeliveryOrders: DeliveryOrder[];
  loadingDeliveryQueue: boolean;
  deliveryActionOrderId: string | null;
}

export const initialOrderState: OrderState = {
  orders: [],
  trackingOrderId: null,
  tracking: null,
  loading: false,
  placingOrder: false,
  payingOrder: false,
  error: null,
  availableDeliveryOrders: [],
  assignedDeliveryOrders: [],
  loadingDeliveryQueue: false,
  deliveryActionOrderId: null,
};

export const orderReducer = createReducer(
  initialOrderState,
  on(OrderActions.loadOrders, (state) => ({ ...state, loading: true, error: null })),
  on(OrderActions.loadOrdersSuccess, (state, { orders }) => ({ ...state, orders, loading: false })),
  on(OrderActions.loadOrdersFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(OrderActions.placeOrder, (state) => ({ ...state, placingOrder: true, error: null })),
  on(OrderActions.placeOrderSuccess, (state, { order }) => ({
    ...state,
    placingOrder: false,
    orders: [order, ...state.orders.filter((item) => item._id !== order._id)],
  })),
  on(OrderActions.placeOrderFailure, (state, { error, order }) => ({
    ...state,
    placingOrder: false,
    error,
    orders: order ? [order, ...state.orders.filter((item) => item._id !== order._id)] : state.orders,
  })),
  on(OrderActions.payOrder, (state) => ({ ...state, payingOrder: true, error: null })),
  on(OrderActions.payOrderSuccess, (state) => ({ ...state, payingOrder: false })),
  on(OrderActions.payOrderFailure, (state, { error }) => ({ ...state, payingOrder: false, error })),
  on(OrderActions.cancelOrder, (state) => ({ ...state, error: null })),
  on(OrderActions.cancelOrderSuccess, (state, { order }) => ({
    ...state,
    orders: state.orders.map((item) => item._id === order._id ? order : item),
  })),
  on(OrderActions.cancelOrderFailure, (state, { error }) => ({ ...state, error })),
  on(OrderActions.trackOrder, (state, { orderId }) => ({
    ...state,
    trackingOrderId: orderId,
    tracking: null,
    error: null,
  })),
  on(OrderActions.trackOrderUpdate, (state, { tracking }) => ({ ...state, tracking })),
  on(OrderActions.trackOrderFailure, (state, { error }) => ({ ...state, error })),
  on(OrderActions.stopTrackingOrder, (state) => ({ ...state, trackingOrderId: null, tracking: null })),
  on(OrderActions.loadDeliveryQueue, (state) => ({ ...state, loadingDeliveryQueue: true, error: null })),
  on(OrderActions.loadDeliveryQueueSuccess, (state, { available, assigned }) => ({
    ...state,
    availableDeliveryOrders: available,
    assignedDeliveryOrders: assigned,
    loadingDeliveryQueue: false,
  })),
  on(OrderActions.loadDeliveryQueueFailure, (state, { error }) => ({
    ...state,
    loadingDeliveryQueue: false,
    error,
  })),
  on(OrderActions.updateDeliveryOrder, (state, { orderId }) => ({
    ...state,
    deliveryActionOrderId: orderId,
    error: null,
  })),
  on(OrderActions.updateDeliveryOrderSuccess, (state) => ({ ...state, deliveryActionOrderId: null })),
  on(OrderActions.updateDeliveryOrderFailure, (state, { error }) => ({
    ...state,
    deliveryActionOrderId: null,
    error,
  })),
  on(OrderActions.updateAgentLocationFailure, (state, { error }) => ({ ...state, error })),
);