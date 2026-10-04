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
import { ActivatedRoute, Router } from '@angular/router';
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
  IonModal,
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { GoogleMap } from '@capacitor/google-maps';
import { Geolocation } from '@capacitor/geolocation';
import { ApiService } from '../services/api-service/api-service';
import { MOBILE_API_ENDPOINTS, MOBILE_APP_TEXT, MOBILE_STORAGE_KEYS } from '../constants/app.constants';
declare var google: any;
import * as L from 'leaflet';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',

  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',

  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
// import 'leaflet-routing-machine';
export interface Address {
  _id?: string;
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
    IonModal,
  ],
})
export class AddressPage implements OnInit, AfterViewInit {
  readonly text = MOBILE_APP_TEXT;
  @ViewChild('map', { static: false }) mapRef!: ElementRef;
  @ViewChild('searchInput', { static: false })
  searchInput!: ElementRef;
  map: any;
  marker: any;
  geocoder: any;
  searchQuery = '';
  selectedAddressId: string | undefined = '';
  selectedLat = 0;
  selectedLng = 0;
  routingControl: any;
  searchSubject = new Subject<string>();
  searchResults: any[] = [];
  selectedAddress = signal('');
  showAddForm = false;
  selectedLocation = 'test';
  reverseGeocodeTimeout: any;
  isSheetOpen = signal(false);
  newAddress: Address = {
    _id: '',
    type: 'home',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
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
    private router: Router,
    private route: ActivatedRoute,
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
    this.apiService.getData(MOBILE_API_ENDPOINTS.addresses.list).subscribe({
      next: (result) => {
        this.savedAddresses.set(result.addresses);
      },
      error: (error) => {
        console.error('Error fetching addresses:', error);
      },
    });

    this.searchSubject
      .pipe(
        debounceTime(700),

        distinctUntilChanged(),
      )
      .subscribe((value) => {
        this.fetchPlaces(value);
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
     await Geolocation.requestPermissions();
    const coordinates = await Geolocation.getCurrentPosition();
    const lat = coordinates.coords.latitude;
    const lng = coordinates.coords.longitude;
    this.selectedLat = lat;
    this.selectedLng = lng;
    this.map = L.map(this.mapRef.nativeElement).setView([lat, lng], 16);
    L.circle([lat, lng], {
      radius: 5000,
    }).addTo(this.map);
    // this.routingControl = (L as any).Routing.control({
    //   waypoints: [
    //     // L.latLng(storeLat, storeLng),
    //     L.latLng(this.selectedLat, this.selectedLng),
    //   ],
    // }).addTo(this.map);

    // Dark Map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(
      this.map,
    );

    const customIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });

    this.marker = L.marker([lat, lng], {
      draggable: true,
      icon: customIcon,
    }).addTo(this.map);

    // Reverse Geocode
    this.reverseGeocode(lat, lng);

    // Map Click
    this.map.on('click', (event: any) => {
      const lat = event.latlng.lat;

      const lng = event.latlng.lng;

      this.updateLocation(lat, lng);
    });

    // Marker Drag
    this.marker.on('dragend', (event: any) => {
      const pos = event.target.getLatLng();

      this.updateLocation(pos.lat, pos.lng);
    });
  }

  updateLocation(lat: number, lng: number) {
    this.selectedLat = lat;
    this.selectedLng = lng;

    this.marker.setLatLng([lat, lng]);
    console.log(lat, lng);
    // this.reverseGeocode(lat, lng);
    clearTimeout(this.reverseGeocodeTimeout);

    this.reverseGeocodeTimeout = setTimeout(() => {
      this.reverseGeocode(lat, lng);
      this.isSheetOpen.set(true);
    }, 500);
  }

  async reverseGeocode(lat: number, lng: number) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

    const response = await fetch(
      `https://corsproxy.io/?${encodeURIComponent(url)}`,
    );

    const data = await response.json();
    console.log(data);
    this.selectedAddress.set(data.display_name);

    // this.newAddress.street = data.address.road || '';

    // this.newAddress.city =
    //   data.address.city || data.address.town || data.address.village || '';

    this.newAddress.state = data.address.state || '';

    this.newAddress.zipCode = data.address.postcode || '';
  }

  searchPlaces() {
    this.searchSubject.next(this.searchQuery);
  }

  async fetchPlaces(query: string) {
    if (!query.trim()) {
      this.searchResults = [];

      return;
    }

    try {
      const enhancedQuery = `${query}, India`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(enhancedQuery)}&limit=5`,
      );

      this.searchResults = await response.json();
      console.log(this.searchResults);
    } catch (error) {
      console.error(error);
    }
  }

  selectPlace(place: any) {
     if (!this.map) {
    console.error('Map not initialized');
    return;
  }
    const lat = parseFloat(place.lat);

    const lng = parseFloat(place.lon);

    this.map.flyTo([lat, lng], 16);

    this.updateLocation(lat, lng);

    this.searchResults = [];

    this.searchQuery = place.display_name;
  }

  async goToCurrentLocation() {
    const coordinates = await Geolocation.getCurrentPosition();

    const lat = coordinates.coords.latitude;

    const lng = coordinates.coords.longitude;

    this.map.flyTo([lat, lng], 16);

    this.updateLocation(lat, lng);
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
        latitude: this.selectedLat,
        longitude: this.selectedLng,
      },
      isDefault: true,
    };

    this.apiService.postData(MOBILE_API_ENDPOINTS.addresses.list, address).subscribe({
      next: (response) => {
        this.savedAddresses.update((addresses) => [response.address, ...addresses]);
        this.selectAddress(response.address);
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
    // this.newAddress.type = `Lat ${lat}, Lng ${lng}`;
  }

  private resetForm() {
    this.newAddress = {
      type: 'home',
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
    this.selectedAddressId = address._id;
    localStorage.setItem(MOBILE_STORAGE_KEYS.selectedAddress, JSON.stringify(address));
    const returnTo = this.route.snapshot.queryParamMap.get('returnTo');
    this.router.navigateByUrl(returnTo === 'checkout' ? '/checkout' : '/dashboard');
  }

  editAddress(address: Address) {
    this.loadMap();
    this.newAddress = {
      _id: address._id,
      type: address.type,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      coordinates: {
        latitude: this.selectedLat,
        longitude: this.selectedLng,
      },
      isDefault: false,
    };
    this.showAddForm = true;
    this.isSheetOpen.set(true);
    this.updateLocation(
      address.coordinates.latitude,
      address.coordinates.longitude,
    );
  }

  deleteAddress(address: Address) {
    this.apiService.deleteData(MOBILE_API_ENDPOINTS.addresses.byId(address._id), {}).subscribe({
      next: (response) => {
        this.savedAddresses.update((addresses) =>
          addresses.filter((addr) => addr._id !== address._id),
        );
        console.log('Address deleted successfully:', response);
      },
      error: (error) => {
        console.error('Error deleting address:', error);
      },
    });
  }

  updateAddress() {
    if (!this.isFormValid()) {
      return;
    }

    let addresJson = { ...this.newAddress };
    delete addresJson._id;
    this.apiService
      .updateData(MOBILE_API_ENDPOINTS.addresses.update(this.newAddress._id), addresJson)
      .subscribe({
        next: (response) => {
          this.savedAddresses.update((addresses) =>
            addresses.map((addr) => (addr._id === this.newAddress._id ? { ...addr, ...this.newAddress } : addr)),
          );
          console.log('Address updated successfully:', response);
          this.toggleAddForm();
        },
        error: (error) => {
          console.error('Error updating address:', error);
        },
      });
  }

  ionViewWillLeave() {
    this.showAddForm = false;
    this.isSheetOpen.set(false);
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}
