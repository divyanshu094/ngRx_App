import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

declare var RazorpayCheckout: any;

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  constructor(private http: HttpClient) {}

  payNow(amount: number) {
    let token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTAwNTM2MzQzMmY3YzZjMzc4MGI0NjUiLCJpc0FkbWluIjpmYWxzZSwiaXNEZWxpdmVyeVBhcnRuZXIiOmZhbHNlLCJpYXQiOjE3Nzg0MDYzNTgsImV4cCI6MTc3OTAxMTE1OH0.PEc47X8YsRzcw4O1J3_ze0LKubOk9C1l4ekMVoeusP0';

    this.http
      .post<any>(
        'https://extras-wanting-unlatch.ngrok-free.dev/api/payments/razorpay/create-order',
        { amount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
        },
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
              alert('Payment Successful');
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

  verifyPayment(data: any) {
    let token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTAwNTM2MzQzMmY3YzZjMzc4MGI0NjUiLCJpc0FkbWluIjpmYWxzZSwiaXNEZWxpdmVyeVBhcnRuZXIiOmZhbHNlLCJpYXQiOjE3Nzg0MDYzNTgsImV4cCI6MTc3OTAxMTE1OH0.PEc47X8YsRzcw4O1J3_ze0LKubOk9C1l4ekMVoeusP0';

    this.http
      .post(
        'https://extras-wanting-unlatch.ngrok-free.dev/api/payments/razorpay/verify-payment',
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
        },
      )
      .subscribe((res) => {
        console.log(res);
      });
  }

  createOrder(callback: any, amount: number) {
    let token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTAwNTM2MzQzMmY3YzZjMzc4MGI0NjUiLCJpc0FkbWluIjpmYWxzZSwiaXNEZWxpdmVyeVBhcnRuZXIiOmZhbHNlLCJpYXQiOjE3Nzg0MDYzNTgsImV4cCI6MTc3OTAxMTE1OH0.PEc47X8YsRzcw4O1J3_ze0LKubOk9C1l4ekMVoeusP0';

    this.http
      .post<any>(
        'https://extras-wanting-unlatch.ngrok-free.dev/api/payments/razorpay/create-order',
        {
          amount: amount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .subscribe((order) => {
        callback(order,amount);
      });
  }
}
