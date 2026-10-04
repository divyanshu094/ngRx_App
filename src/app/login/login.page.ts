import { Component, computed, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonContent, IonItem, IonButton, IonLabel, IonInput, IonIcon, IonCheckbox } from '@ionic/angular/standalone';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { leaf, mail, lockClosed, logIn, mailOutline, lockClosedOutline, eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { Store } from '@ngrx/store';
import { LoginRequest } from '../models/user.model';
import { AppState } from '../store';
import { login } from '../store/actions/auth.actions';
import { initialAuthState } from '../store/reducers/auth.reducer';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonButton, IonItem, IonContent, IonLabel, IonInput, IonIcon, IonCheckbox, CommonModule, FormsModule, ReactiveFormsModule, RouterLink]
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  private readonly authState = toSignal(this.store.select('auth'), { initialValue: initialAuthState });
  private readonly validationError = signal('');
  isLoading = computed(() => this.authState().loading);
  errorMessage = computed(() => this.validationError() || this.authState().error || '');
  showPassword = signal(false);

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<AppState>,
    private route: ActivatedRoute,
  ) {
    addIcons({mailOutline,lockClosedOutline,eyeOffOutline,eyeOutline,leaf,mail,lockClosed,logIn});
  }

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  togglePasswordVisibility() {
    this.showPassword.update(val => !val);
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.validationError.set('Please fill all fields correctly');
      return;
    }

    this.validationError.set('');

    const loginData: LoginRequest = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value
    };

    this.store.dispatch(login({
      credentials: loginData,
      returnUrl: this.route.snapshot.queryParamMap.get('returnUrl'),
    }));
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

}
