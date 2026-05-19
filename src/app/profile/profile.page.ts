import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonChip,
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  personCircle,
  bagCheck,
  mailOutline,
  phonePortrait,
  location,
  calendarOutline,
  arrowBack, bagOutline, chatbubbleEllipsesOutline, heartOutline, walletOutline, chevronForwardOutline, settingsOutline, cashOutline, giftOutline, locationOutline, 
  person} from 'ionicons/icons';

interface Order {
  id: string;
  date: string;
  total: string;
  status: string;
  items: number;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonChip,
    CommonModule,
    RouterLink,
  ],
})
export class ProfilePage implements OnInit {
  activeSection = signal<'profile' | 'orders'>('profile');
  user = signal({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 98765 43210',
    address: '123 Main Street, Bengaluru, Karnataka',
  });
  orders = signal<Order[]>([
    {
      id: 'OD123456',
      date: '2026-05-10',
      total: '₹1,250',
      status: 'Delivered',
      items: 5,
    },
    {
      id: 'OD123457',
      date: '2026-05-04',
      total: '₹549',
      status: 'Delivered',
      items: 3,
    },
    {
      id: 'OD123458',
      date: '2026-04-27',
      total: '₹1,799',
      status: 'Cancelled',
      items: 8,
    },
  ]);

  constructor() {
    addIcons({person,bagOutline,chatbubbleEllipsesOutline,heartOutline,cashOutline,chevronForwardOutline,giftOutline,locationOutline,walletOutline,settingsOutline,personCircle,bagCheck,mailOutline,phonePortrait,location,calendarOutline,arrowBack,});
  }

  ngOnInit() {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        this.user.set({
          name: parsed.name || this.user().name,
          email: parsed.email || this.user().email,
          phone: parsed.phone || this.user().phone,
          address: parsed.address || this.user().address,
        });
      } catch {
        // keep defaults if storage is invalid
      }
    }
  }

  setSection(section: 'profile' | 'orders') {
    this.activeSection.set(section);
  }
}
