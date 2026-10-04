import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';
import { Checkout } from 'capacitor-razorpay';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MOBILE_API_ENDPOINTS, MOBILE_APP_TEXT } from '../constants/app.constants';

export interface RazorpayOrder {
  success: boolean;
  orderId: string;
  amount: number;
  currency: string;
  key: string;
}

export interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayCheckoutInstance {
  open(): void;
  on?(event: string, callback: (response: any) => void): void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, any>) => RazorpayCheckoutInstance;
  }
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  constructor(private http: HttpClient) {}

  createRazorpayOrder(orderId: string): Observable<RazorpayOrder> {
    return this.http.post<RazorpayOrder>(
      `${environment.apiUrl}${MOBILE_API_ENDPOINTS.payments.createOrder}`,
      { orderId },
    );
  }

  verifyRazorpayPayment(
    payment: RazorpayPaymentResponse & { orderId: string },
  ): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${environment.apiUrl}${MOBILE_API_ENDPOINTS.payments.verifyOrder}`,
      payment,
    );
  }

  openCheckout(options: Record<string, any>): Promise<RazorpayPaymentResponse> {
    if (Capacitor.isNativePlatform()) {
      return this.openNativeCheckout(options);
    }

    return new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        reject(new Error(MOBILE_APP_TEXT.errors.paymentLoadFailed));
        return;
      }

      let settled = false;
      const finish = (callback: () => void) => {
        if (settled) return;
        settled = true;
        callback();
      };

      const checkout = new window.Razorpay({
        ...options,
        handler: (response: RazorpayPaymentResponse) => {
          finish(() => resolve(response));
        },
        modal: {
          ondismiss: () => finish(() => reject(new Error(MOBILE_APP_TEXT.errors.paymentCancelled))),
        },
      });

      checkout.on?.('payment.failed', (response) => {
        const message = response?.error?.description || MOBILE_APP_TEXT.errors.paymentFailed;
        finish(() => reject(new Error(message)));
      });

      checkout.open();
    });
  }

  private async openNativeCheckout(
    options: Record<string, any>,
  ): Promise<RazorpayPaymentResponse> {
    try {
      const result = await Checkout.open({
        ...options,
        amount: String(options['amount']),
      } as { key: string; amount: string });
      const response = typeof result.response === 'string'
        ? JSON.parse(result.response)
        : result.response;
      return response as RazorpayPaymentResponse;
    } catch (error: any) {
      let message = error?.message || MOBILE_APP_TEXT.errors.paymentFailed;
      try {
        message = JSON.parse(message).description || message;
      } catch {
        // Keep the plugin's original error message.
      }
      throw new Error(message);
    }
  }
}
