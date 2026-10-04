export interface PaymentTransaction {
  _id: string;
  order: string | {
    _id: string;
    status?: string;
    tracking?: { trackingNumber?: string };
  };
  provider: 'razorpay' | 'stripe' | 'cash';
  type: 'payment' | 'refund';
  status: 'pending' | 'authorized' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  amountMinor: number;
  currency: string;
  method?: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  gatewayRefundId?: string;
  failureCode?: string;
  failureDescription?: string;
  initiatedAt: string;
  completedAt?: string;
  createdAt: string;
}