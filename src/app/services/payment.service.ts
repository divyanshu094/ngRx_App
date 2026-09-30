import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';
import { Checkout } from 'capacitor-razorpay';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

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
      `${environment.apiUrl}payments/razorpay/create-order`,
      { orderId },
    );
  }

  verifyRazorpayPayment(
    payment: RazorpayPaymentResponse & { orderId: string },
  ): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${environment.apiUrl}payments/razorpay/verify`,
      payment,
    );
  }

  openCheckout(options: Record<string, any>): Promise<RazorpayPaymentResponse> {
    if (Capacitor.isNativePlatform()) {
      return this.openNativeCheckout(options);
    }

    return new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        reject(new Error('Payment checkout could not be loaded. Check your internet connection.'));
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
          ondismiss: () => finish(() => reject(new Error('Payment cancelled.'))),
        },
      });

      checkout.on?.('payment.failed', (response) => {
        const message = response?.error?.description || 'Payment failed.';
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
      let message = error?.message || 'Payment failed.';
      try {
        message = JSON.parse(message).description || message;
      } catch {
        // Keep the plugin's original error message.
      }
      throw new Error(message);
    }
  }
}
