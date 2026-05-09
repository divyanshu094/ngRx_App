import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonRadioGroup, IonRadio } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { location, card, cash, checkmarkCircle, arrowBack, documentText, phonePortrait, wallet } from 'ionicons/icons';
import { Observable } from 'rxjs';
import { Bucket } from '../models/bucket.model';
import { Store } from '@ngrx/store';
import { HeaderComponent } from '../components/header/header.component';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonRadioGroup, IonRadio, HeaderComponent]
})
export class CheckoutPage implements OnInit {

  bucket$?: Observable<Bucket[]>;
  selectedPaymentMethod: string = 'card';
  deliveryAddress: string = '';
  deliveryInstructions: string = '';

  constructor(private store: Store<{ myBucket: Bucket[] }>, private router: Router) {
    addIcons({location,documentText,card,phonePortrait,cash,wallet,checkmarkCircle,arrowBack});
  }

  ngOnInit() {
    this.bucket$ = this.store.select("myBucket");
  }

  getTotalPrice(items: Bucket[]): number {
    return items.reduce((total, item) => total + ((item.price || 0) * item.quantity), 0);
  }

  getDeliveryFee(): number {
    return 29; // ₹29 delivery fee like Zepto
  }

  getGST(items: Bucket[]): number {
    return Math.round(this.getTotalPrice(items) * 0.05); // 5% GST
  }

  getGrandTotal(items: Bucket[]): number {
    return this.getTotalPrice(items) + this.getDeliveryFee() + this.getGST(items);
  }

  placeOrder() {
    // Here you would typically integrate with a payment gateway
    // For now, we'll just show a success message and redirect
    alert('Order placed successfully! 🎉');
    this.router.navigate(['/dashboard']);
  }

}
