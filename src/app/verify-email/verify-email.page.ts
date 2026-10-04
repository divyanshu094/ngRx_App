import { Component, computed, effect, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonContent, IonButton, IonIcon, IonInput, IonText } from '@ionic/angular/standalone';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import { checkmarkCircle, mail, arrowBack } from 'ionicons/icons';
import { Store } from '@ngrx/store';
import { AppState } from '../store';
import { resendOtp, verifyOtp } from '../store/actions/auth.actions';
import { initialAuthState } from '../store/reducers/auth.reducer';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.page.html',
  styleUrls: ['./verify-email.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonIcon, IonInput, IonText, CommonModule, FormsModule, ReactiveFormsModule, RouterLink]
})
export class VerifyEmailPage implements OnInit, OnDestroy {
  verifyForm!: FormGroup;
  private readonly authState = toSignal(this.store.select('auth'), { initialValue: initialAuthState });
  private readonly localError = signal('');
  private readonly localMessage = signal('');
  isLoading = computed(() => this.authState().loading);
  errorMessage = computed(() => this.localError() || this.authState().error || '');
  successMessage = computed(() => this.authState().emailVerified ? 'Email verified successfully!' : this.localMessage());
  isVerified = computed(() => this.authState().emailVerified);
  private readonly routeVerificationCode = signal('');
  verificationCode = computed(() => this.authState().debugVerificationCode || this.routeVerificationCode());
  
  // OTP timer
  timeLeft = signal(300); // 5 minutes
  timerActive = signal(true);
  canResend = signal(false);
  
  email = signal('');
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private store: Store<AppState>,
  ) {
    addIcons({ checkmarkCircle, mail, arrowBack });
    effect(() => {
      if (this.authState().emailVerified) {
        this.timerActive.set(false);
        setTimeout(() => {
          localStorage.removeItem('pendingVerificationEmail');
          this.router.navigate(['/login']);
        }, 2000);
      }
    });
  }

  ngOnInit() {
    this.initializeForm();
    this.getEmailFromRoute();
    this.startTimer();
  }

  ngOnDestroy() {
    this.timerActive.set(false);
  }

  initializeForm() {
    this.verifyForm = this.formBuilder.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  getEmailFromRoute() {
    // Get email from route state (passed from register page)
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['email']) {
      this.email.set(navigation.extras.state['email']);
      this.routeVerificationCode.set(navigation.extras.state['verificationCode'] || '');
    } else {
      // Fallback: try to get from route params or local storage
      const storedEmail = localStorage.getItem('pendingVerificationEmail');
      if (storedEmail) {
        this.email.set(storedEmail);
      }
    }
  }

  startTimer() {
    const timer = setInterval(() => {
      if (this.timerActive()) {
        const current = this.timeLeft();
        if (current <= 0) {
          clearInterval(timer);
          this.timerActive.set(false);
          this.canResend.set(true);
        } else {
          this.timeLeft.set(current - 1);
        }
      } else {
        clearInterval(timer);
      }
    }, 1000);
  }

  getFormattedTime(): string {
    const seconds = this.timeLeft();
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  onSubmit() {
    if (this.verifyForm.invalid) {
      this.localError.set('Please enter a valid 6-digit OTP');
      return;
    }

    this.localError.set('');
    this.localMessage.set('');

    const otp = this.verifyForm.get('otp')?.value;
    this.store.dispatch(verifyOtp({ email: this.email(), otp }));
  }

  onResendOTP() {
    this.localError.set('');
    this.localMessage.set('');
    this.timeLeft.set(300);
    this.timerActive.set(true);
    this.canResend.set(false);
    this.verifyForm.reset();
    this.startTimer();
    this.store.dispatch(resendOtp({ email: this.email() }));
  }

  goBack() {
    this.router.navigate(['/register']);
  }

  get otp() {
    return this.verifyForm.get('otp');
  }
}
