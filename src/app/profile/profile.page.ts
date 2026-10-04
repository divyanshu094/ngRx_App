import { Component, computed, OnInit, signal } from '@angular/core';
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
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { AppState } from '../store';
import { logout } from '../store/actions/auth.actions';
import { initialAuthState } from '../store/reducers/auth.reducer';
import { addIcons } from 'ionicons';
import {
  personCircle,
  bagCheck,
  mailOutline,
  phonePortrait,
  location,
  calendarOutline,
  arrowBack, bagOutline, chatbubbleEllipsesOutline, heartOutline, walletOutline, chevronForwardOutline, settingsOutline, cashOutline, giftOutline, locationOutline, 
  person, logOutOutline} from 'ionicons/icons';

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
  private readonly authState = toSignal(this.store.select('auth'), { initialValue: initialAuthState });
  private readonly storedUser = signal<{ name?: string; email?: string; phone?: string } | null>(null);
  user = computed(() => this.authState().user ?? this.storedUser() ?? {});

  constructor(private store: Store<AppState>) {
    addIcons({person,bagOutline,chatbubbleEllipsesOutline,heartOutline,cashOutline,chevronForwardOutline,giftOutline,locationOutline,walletOutline,settingsOutline,personCircle,bagCheck,mailOutline,phonePortrait,location,calendarOutline,arrowBack,logOutOutline});
  }

  ngOnInit() {
    try {
      this.storedUser.set(JSON.parse(localStorage.getItem('user') || 'null'));
    } catch {
      this.storedUser.set(null);
    }
  }

  signOut() {
    this.store.dispatch(logout());
  }
}
