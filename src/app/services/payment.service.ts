import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

declare var RazorpayCheckout: any;

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(private http: HttpClient) {}

  payNow(amount: number) {

    this.http.post<any>(
      'http://localhost:3000/create-order',
      { amount }
    ).subscribe({

      next: (order) => {

        const options = {

          description: 'Shopping Payment',

          currency: 'INR',

          key: 'YOUR_RAZORPAY_KEY',

          amount: order.amount,

          name: 'Softiqo Store',

          order_id: order.id,

          theme: {
            color: '#16a34a'
          },

          prefill: {
            email: 'customer@test.com',
            contact: '9999999999'
          }

        };

        RazorpayCheckout.open(

          options,

          (success: any) => {

            console.log('PAYMENT SUCCESS');

            console.log(success);

            alert('Payment Successful');

          },

          (error: any) => {

            console.log(error);

            alert('Payment Failed');

          }

        );

      },

      error: (err) => {

        console.log(err);

        alert('Order creation failed');

      }

    });

  }

}