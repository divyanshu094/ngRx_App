import {
  Component,
  OnInit,
  CUSTOM_ELEMENTS_SCHEMA,
  PlatformRef,
  AfterViewInit,
  ElementRef,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Platform } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import {
  remove,
  add,
  cart,
  trash,
  arrowBack,
  bagCheck,
  location,
  createOutline,
  trashOutline,
} from 'ionicons/icons';
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
import { GoogleMap } from '@capacitor/google-maps';
import { Geolocation } from '@capacitor/geolocation';
import { ApiService } from '../services/api-service/api-service';
declare var google: any;
//google-key="AIzaSyD8Fg2WFdGAp0NFO1h2sMS9B6CkO4eI1dE"
export interface Root {
  id?: number;
  type: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates: Coordinates;
  isDefault: boolean;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-address',
  templateUrl: './address.page.html',
  styleUrls: ['./address.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
export class AddressPage implements OnInit, AfterViewInit {
  @ViewChild('map', { static: false }) mapRef!: ElementRef;
  @ViewChild('searchInput', { static: false })
  searchInput!: ElementRef;
  map: any;
  marker: any;
  geocoder: any;
  selectedAddressId: number | null = null;
  selectedLat = 0;
  selectedLng = 0;
  selectedAddress = '';
  showAddForm = false;
  selectedLocation = 'test';
  newAddress: Root = {
    type: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
    isDefault: false,
  };
  savedAddresses = signal([this.newAddress]);

  constructor(
    protected platform: Platform,
    private apiService: ApiService,
  ) {
    addIcons({
      arrowBack,
      add,
      location,
      createOutline,
      trashOutline,
      remove,
      bagCheck,
      cart,
      trash,
    });
  }

  ngOnInit() {
    this.apiService.getData('addresses').subscribe({
      next: (result) => {
        this.savedAddresses.set(result.addresses);
      },
      error: (error) => {
        console.error('Error fetching addresses:', error);
      },
    });
  }

  async ngAfterViewInit() {
    if (this.showAddForm) {
      setTimeout(() => {
        this.loadMap();
      }, 500);
    }
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;

    if (this.showAddForm) {
      this.resetForm();

      setTimeout(() => {
        this.loadMap();
      }, 300);
    }
  }

  async loadMap() {
    const coordinates = await Geolocation.getCurrentPosition();

    const lat = coordinates.coords.latitude;
    const lng = coordinates.coords.longitude;

    this.selectedLat = lat;
    this.selectedLng = lng;

    this.geocoder = new google.maps.Geocoder();

    this.map = new google.maps.Map(this.mapRef.nativeElement, {
      center: { lat, lng },
      zoom: 16,
      disableDefaultUI: true,
    });

    this.marker = new google.maps.Marker({
      position: { lat, lng },
      map: this.map,
      draggable: true,
      animation: google.maps.Animation.DROP,
    });

    this.reverseGeocode(lat, lng);

    // Marker Drag
    this.marker.addListener('dragend', (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      this.selectedLat = lat;
      this.selectedLng = lng;

      this.reverseGeocode(lat, lng);
    });

    // Map Click
    this.map.addListener('click', (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      this.marker.setPosition({
        lat,
        lng,
      });

      this.selectedLat = lat;
      this.selectedLng = lng;

      this.reverseGeocode(lat, lng);
    });

    // Search Autocomplete
    const autocomplete = new google.maps.places.Autocomplete(
      this.searchInput.nativeElement,
    );

    autocomplete.bindTo('bounds', this.map);

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();

      if (!place.geometry) return;

      const location = place.geometry.location;

      const lat = location.lat();
      const lng = location.lng();

      this.map.panTo({
        lat,
        lng,
      });

      this.map.setZoom(16);

      this.marker.setPosition({
        lat,
        lng,
      });

      this.selectedLat = lat;
      this.selectedLng = lng;

      this.selectedAddress = place.formatted_address;
    });
  }

  reverseGeocode(lat: number, lng: number) {
    this.geocoder.geocode(
      {
        location: { lat, lng },
      },

      (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          this.selectedAddress = results[0].formatted_address;
        }
      },
    );
  }

  saveAddress() {
    if (!this.isFormValid()) {
      return;
    }
    const address = {
      type: this.newAddress.type,
      street: this.newAddress.street,
      city: this.newAddress.city,
      state: this.newAddress.state,
      zipCode: this.newAddress.zipCode,
      country: this.newAddress.country,
      coordinates: {
        latitude: 0,
        longitude: 0,
      },
      isDefault: true,
    };

    this.apiService.postData('addresses', address).subscribe({
      next: (response) => {
        this.savedAddresses.update((addresses) => [address, ...addresses]);
        // console.log('Address saved successfully:', response);
        this.toggleAddForm();
      },
      error: (error) => {
        console.error('Error saving address:', error);
      },
    });
  }

  cancelForm() {
    this.showAddForm = false;
    this.resetForm();
  }

  isFormValid(): boolean {
    return (
      !!this.newAddress.street &&
      !!this.newAddress.city &&
      !!this.newAddress.state &&
      !!this.newAddress.zipCode &&
      !!this.newAddress.country &&
      !!this.newAddress.type
    );
  }

  chooseLocation(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const lat = (10 + (y / rect.height) * 10).toFixed(5);
    const lng = (76 + (x / rect.width) * 10).toFixed(5);
    this.selectedLocation = `${lat}, ${lng}`;
    this.newAddress.type = `Lat ${lat}, Lng ${lng}`;
  }

  private resetForm() {
    this.newAddress = {
      type: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      coordinates: {
        latitude: 0,
        longitude: 0,
      },
      isDefault: false,
    };
    this.selectedLocation = '';
  }

  selectAddress(address: any) {
    this.selectedAddressId = address.id;
    localStorage.setItem('selectedAddress', JSON.stringify(address));
  }
}
