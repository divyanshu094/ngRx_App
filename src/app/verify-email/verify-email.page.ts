import { Component, OnInit, OnDestroy, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonContent, IonButton, IonIcon, IonInput, IonText } from '@ionic/angular/standalone';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import { checkmarkCircle, mail, arrowBack } from 'ionicons/icons';
import { ApiService } from '../services/api-service/api-service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.page.html',
  styleUrls: ['./verify-email.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonIcon, IonInput, IonText, CommonModule, FormsModule, ReactiveFormsModule, RouterLink]
})
export class VerifyEmailPage implements OnInit, OnDestroy {
  verifyForm!: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  isVerified = signal(false);
  
  // OTP timer
  timeLeft = signal(300); // 5 minutes
  timerActive = signal(true);
  canResend = signal(false);
  
  email = signal('');
  userId = signal('');

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    addIcons({ checkmarkCircle, mail, arrowBack });
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
      this.userId.set(navigation.extras.state['userId']);
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
      this.errorMessage.set('Please enter a valid 6-digit OTP');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const otp = this.verifyForm.get('otp')?.value;
    const verifyData = {
      email: this.email(),
      otp: otp,
      userId: this.userId()
    };

    this.apiService.postData('auth/verify-otp', verifyData).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage.set('Email verified successfully!');
          this.isVerified.set(true);
          this.timerActive.set(false);

          // Store the token if provided
          if (response.token) {
            localStorage.setItem('authToken', response.token);
          }
          if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
          }

          // Navigate to dashboard after 2 seconds
          setTimeout(() => {
            localStorage.removeItem('pendingVerificationEmail');
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.errorMessage.set(response.message || 'Email verification failed');
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message || 'An error occurred during verification');
        console.error('Verification error:', error);
        this.isLoading.set(false);
      }
    });
  }

  onResendOTP() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const resendData = {
      email: this.email(),
      userId: this.userId()
    };

    this.apiService.postData('auth/send-otp', resendData).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage.set('OTP sent successfully!');
          this.timeLeft.set(300); // Reset timer to 5 minutes
          this.timerActive.set(true);
          this.canResend.set(false);
          this.verifyForm.reset();
          this.startTimer();
        } else {
          this.errorMessage.set(response.message || 'Failed to resend OTP');
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message || 'An error occurred while resending OTP');
        console.error('Resend OTP error:', error);
        this.isLoading.set(false);
      }
    });
  }

  goBack() {
    this.router.navigate(['/register']);
  }

  get otp() {
    return this.verifyForm.get('otp');
  }
}
