import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { remove, add, cart, trash, arrowBack, bagCheck } from 'ionicons/icons';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';

interface AddressItem {
  house: string;
  landmark?: string;
  label?: string;
  locationLabel: string;
}

@Component({
  selector: 'app-address',
  templateUrl: './address.page.html',
  styleUrls: ['./address.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonIcon,
    CommonModule,
    FormsModule,
    RouterLink,
  ],
})
export class AddressPage implements OnInit {
  savedAddresses: AddressItem[] = [];
  showAddForm = false;
  selectedLocation = '';

  newAddress: AddressItem = {
    house: '',
    landmark: '',
    label: '',
    locationLabel: 'Not selected',
  };

  constructor() {
    addIcons({ arrowBack, remove, add, bagCheck, cart, trash });
  }

  ngOnInit() {}

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.resetForm();
    }
  }

  saveAddress() {
    if (!this.isFormValid()) {
      return;
    }

    const address = {
      house: this.newAddress.house,
      landmark: this.newAddress.landmark,
      label: this.newAddress.label,
      locationLabel: this.selectedLocation || 'Location not selected',
    };

    this.savedAddresses = [address, ...this.savedAddresses];
    this.toggleAddForm();
  }

  cancelForm() {
    this.showAddForm = false;
    this.resetForm();
  }

  isFormValid(): boolean {
    return !!this.newAddress.house && !!this.selectedLocation;
  }

  chooseLocation(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const lat = (10 + (y / rect.height) * 10).toFixed(5);
    const lng = (76 + (x / rect.width) * 10).toFixed(5);
    this.selectedLocation = `${lat}, ${lng}`;
    this.newAddress.locationLabel = `Lat ${lat}, Lng ${lng}`;
  }

  private resetForm() {
    this.newAddress = {
      house: '',
      landmark: '',
      label: '',
      locationLabel: 'Not selected',
    };
    this.selectedLocation = '';
  }
}
