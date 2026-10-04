import { Component, computed, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { IonContent, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonCheckbox } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { leaf, person, mail, lockClosed, shieldCheckmark, personAdd, mailOutline, lockClosedOutline, eyeOffOutline, personOutline, callOutline, eyeOutline } from 'ionicons/icons';
import { Store } from '@ngrx/store';
import { RegisterRequest } from '../models/user.model';
import { AppState } from '../store';
import { register } from '../store/actions/auth.actions';
import { initialAuthState } from '../store/reducers/auth.reducer';
import { MOBILE_APP_TEXT } from '../constants/app.constants';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonContent, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonCheckbox, CommonModule, FormsModule, ReactiveFormsModule, RouterLink]
})
export class RegisterPage implements OnInit {
  readonly text = MOBILE_APP_TEXT;
  registerForm!: FormGroup;
  private readonly authState = toSignal(this.store.select('auth'), { initialValue: initialAuthState });
  private readonly validationError = signal('');
  isLoading = computed(() => this.authState().loading);
  errorMessage = computed(() => this.validationError() || this.authState().error || '');
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<AppState>,
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
    const confirmControl = control.get('confirmPassword');

    if (!password || !confirmPassword || !confirmControl) {
      return null;
    }

    const errors = confirmControl.errors || {};
    if (password !== confirmPassword) {
      confirmControl.setErrors({ ...errors, passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (errors['passwordMismatch']) {
      delete errors['passwordMismatch'];
      confirmControl.setErrors(Object.keys(errors).length ? errors : null);
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
      this.validationError.set(this.text.registration.requiredFields);
      return;
    }

    this.validationError.set('');

    const registerData: RegisterRequest = {
      name: this.registerForm.get('name')?.value,
      email: this.registerForm.get('email')?.value,
      phone: this.registerForm.get('phone')?.value,
      password: this.registerForm.get('password')?.value,
      confirmPassword: this.registerForm.get('confirmPassword')?.value
    };

    this.store.dispatch(register({ user: registerData }));
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
