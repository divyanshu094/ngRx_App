import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonItem, IonButton, IonLabel, IonInput, IonIcon, IonCheckbox } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { leaf, mail, lockClosed, logIn } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonButton, IonItem, IonContent, IonLabel, IonInput, IonIcon, IonCheckbox, CommonModule, FormsModule, RouterLink]
})
export class LoginPage implements OnInit {

  constructor() {
    addIcons({ leaf, mail, lockClosed, logIn });
  }

  ngOnInit() {
  }

}
