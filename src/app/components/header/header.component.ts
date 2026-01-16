import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonBackButton, IonList, IonItem, IonCol, IonGrid, IonRow, IonButton, IonButtons, IonInput, IonIcon, IonBadge } from '@ionic/angular/standalone';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { Bucket } from 'src/app/models/bucket.model';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true, // Mark as standalone
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonCol, IonGrid, IonRow, IonButton,
    IonButtons, IonInput, IonIcon, IonBadge, CommonModule, RouterLink]
})
export class HeaderComponent implements OnInit {
  @Input() title: string = 'Default Title';
  @Input() showBackButton: boolean = false;
  bucket$?: Observable<Bucket[]>;
  totalQuantity$: Observable<number> | undefined;
  constructor(private store: Store<{ myBucket: Bucket[] }>) {
    this.bucket$ = this.store.select("myBucket")
  }

  ngOnInit() {
    this.totalQuantity$ = this.bucket$?.pipe(
      map((buckets: Bucket[] = []) =>
        (buckets ?? []).reduce((sum, item) => sum + (item.quantity || 0), 0)
      )
    );
  }

}
