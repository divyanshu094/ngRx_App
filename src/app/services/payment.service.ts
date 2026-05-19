import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

declare var RazorpayCheckout: any;

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  constructor(private http: HttpClient) {}

  payNow(amount: number) {
    this.http
      .post<any>(
        'https://extras-wanting-unlatch.ngrok-free.dev/api/payments/razorpay/create-order',
        { amount },
      )
      .subscribe({
        next: (order) => {
          const options: any = {
            key: 'rzp_test_SnbCPs0ToCgYZb',
            amount: order.amount,
            currency: 'INR',
            name: 'Softiqo Store',
            description: 'Shopping Payment',
            order_id: order.id,

            handler: (response: any) => {
              console.log('PAYMENT SUCCESS', response);
              this.placeOrder(response, amount).subscribe({
                next: (result) => {
                  console.log('ORDER PLACED', result);
                },
                error: (orderErr) => {
                  console.error('ORDER PLACEMENT FAILED', orderErr);
                  alert('Payment succeeded, but placing order failed.');
                },
              });
            },

            prefill: {
              email: 'customer@test.com',
              contact: '9999999999',
            },

            theme: {
              color: '#16a34a',
            },
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        },

        error: (err) => {
          console.log(err);
          alert('Order creation failed');
        },
      });
  }

  // payViaUPI(app: string, amount: number) {

  //   this.createOrder((order: any, amount: number) => {
  //     const options = {
  //       key: order.key,

  //       amount: order.amount,

  //       currency: order.currency,

  //       order_id: order.orderId,

  //       name: 'Softiqo Store',

  //       description: 'Order Payment',

  //       method: {
  //         upi: true,
  //       },

  //       upi: {
  //         flow: 'intent',
  //       },

  //       external: {
  //         wallets: ['phonepe', 'gpay', 'paytm'],
  //       },

  //       handler: (response: any) => {
  //         console.log(response);

  //         this.verifyPayment(response);
  //       },

  //       theme: {
  //         color: '#16a34a',
  //       },
  //     };

  //     const rzp = new (window as any).Razorpay(options);

  //     rzp.open();
  //   });
  // }

  placeOrder(paymentResponse: any, amount: number) {
    const body = {
      amount,
      paymentId: paymentResponse.razorpay_payment_id,
      orderId: paymentResponse.razorpay_order_id,
      signature: paymentResponse.razorpay_signature,
    };

    return this.http.post('api/orders', body);
  }

  verifyPayment(data: any) {
    this.http
      .post(
        'https://extras-wanting-unlatch.ngrok-free.dev/api/payments/razorpay/verify-payment',
        data,
      )
      .subscribe((res) => {
        console.log(res);
      });
  }

  createOrder(callback: any, amount: number) {
    this.http
      .post<any>(
        'https://extras-wanting-unlatch.ngrok-free.dev/api/payments/razorpay/create-order',
        {
          amount: amount,
        },
      )
      .subscribe((order) => {
        callback(order, amount);
      });
  }
}
