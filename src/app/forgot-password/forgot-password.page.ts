import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, keyOutline, mailOutline } from 'ionicons/icons';
import { AppState } from '../store';
import { requestPasswordReset, resetPassword } from '../store/actions/auth.actions';
import { initialAuthState } from '../store/reducers/auth.reducer';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonButton, IonContent, IonIcon],
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage {
  private readonly authState = toSignal(this.store.select('auth'), { initialValue: initialAuthState });
  token = signal(this.route.snapshot.queryParamMap.get('token') || '');
  email = '';
  password = '';
  confirmPassword = '';
  localError = signal('');
  isResetMode = computed(() => Boolean(this.token()));
  isLoading = computed(() => this.authState().recoveryLoading);
  errorMessage = computed(() => this.localError() || this.authState().error || '');
  message = computed(() => this.authState().recoveryMessage || '');
  resetLink = computed(() => this.authState().recoveryLink || '');

  constructor(
    private readonly route: ActivatedRoute,
    private readonly store: Store<AppState>,
  ) {
    addIcons({ arrowBack, keyOutline, mailOutline });
  }

  sendResetLink() {
    this.localError.set('');
    if (!this.email.trim()) {
      this.localError.set('Enter the email address on your account.');
      return;
    }
    this.store.dispatch(requestPasswordReset({ email: this.email.trim().toLowerCase() }));
  }

  updatePassword() {
    this.localError.set('');
    if (this.password.length < 8) {
      this.localError.set('Use at least 8 characters for your new password.');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.localError.set('The passwords do not match.');
      return;
    }
    this.store.dispatch(resetPassword({ token: this.token(), password: this.password }));
  }
}
