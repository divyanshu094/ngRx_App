import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonCheckbox } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { leaf, person, mail, lockClosed, shieldCheckmark, personAdd } from 'ionicons/icons';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonContent, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonCheckbox, CommonModule, FormsModule, RouterLink]
})
export class RegisterPage implements OnInit {

  constructor() {
    addIcons({ leaf, person, mail, lockClosed, shieldCheckmark, personAdd });
  }

  ngOnInit() {
  }

}
