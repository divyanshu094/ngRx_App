import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { IonContent, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonCheckbox } from '@ionic/angular/standalone';
import { RouterLink, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { leaf, person, mail, lockClosed, shieldCheckmark, personAdd, mailOutline, lockClosedOutline, eyeOffOutline, personOutline, callOutline, eyeOutline } from 'ionicons/icons';
import { ApiService } from '../services/api-service/api-service';
import { RegisterRequest } from '../models/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonContent, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonCheckbox, CommonModule, FormsModule, ReactiveFormsModule, RouterLink]
})
export class RegisterPage implements OnInit {
  registerForm!: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    addIcons({personOutline,mailOutline,callOutline,lockClosedOutline,eyeOffOutline,eyeOutline,leaf,person,mail,lockClosed,shieldCheckmark,personAdd});
  }

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      terms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ 'passwordMismatch': true });
      return { 'passwordMismatch': true };
    }
    return null;
  }

  togglePasswordVisibility() {
    this.showPassword.update(val => !val);
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.update(val => !val);
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.errorMessage.set('Please fill all fields correctly');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const registerData: RegisterRequest = {
      name: this.registerForm.get('name')?.value,
      email: this.registerForm.get('email')?.value,
      phone: this.registerForm.get('phone')?.value,
      password: this.registerForm.get('password')?.value,
      confirmPassword: this.registerForm.get('confirmPassword')?.value
    };

    this.apiService.register(registerData).subscribe({
      next: (response) => {
        if (response.success) {
          // Check if email verification is required
          // if (response.requiresVerification) {
            // Store email temporarily for verification page
            localStorage.setItem('pendingVerificationEmail', registerData.email);
            
            // Navigate to verify-email page with email and userId
            this.router.navigate(['/verify-email'], {
              state: {
                email: registerData.email,
                userId: response.user?.id
              }
            });
          // } else {
          //   // Direct login without verification
          //   if (response.token) {
          //     localStorage.setItem('authToken', response.token);
          //   }
          //   if (response.user) {
          //     localStorage.setItem('user', JSON.stringify(response.user));
          //   }
          //   this.router.navigate(['/dashboard']);
          // }
        } else {
          this.errorMessage.set(response.message || 'Registration failed');
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message || 'An error occurred during registration');
        console.error('Registration error:', error);
        this.isLoading.set(false);
      }
    });
  }

  get name() {
    return this.registerForm.get('name');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get phone() {
    return this.registerForm.get('phone');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  get terms() {
    return this.registerForm.get('terms');
  }

}
