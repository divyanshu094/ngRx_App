
import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Platform, ToastController, NavController } from '@ionic/angular';
import { NavigationEnd, Router } from '@angular/router';
import { filter, take } from 'rxjs';
import { addIcons } from 'ionicons';
import { mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, heartOutline, heartSharp, archiveOutline, archiveSharp, trashOutline, trashSharp, warningOutline, warningSharp, bookmarkOutline, bookmarkSharp } from 'ionicons/icons';
import { FirebaseCrashlytics } from '@capacitor-firebase/crashlytics';
import { App as CapacitorApp } from '@capacitor/app';
import { LoggerService } from './services/logger-service';
import { MOBILE_APP_TEXT, MOBILE_CONFIG, MOBILE_ROUTES, MOBILE_STORAGE_KEYS } from './constants/app.constants';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  public appPages = [
    { title: 'Inbox', url: '/folder/inbox', icon: 'mail' },
    { title: 'Outbox', url: '/folder/outbox', icon: 'paper-plane' },
    { title: 'Favorites', url: '/folder/favorites', icon: 'heart' },
    { title: 'Archived', url: '/folder/archived', icon: 'archive' },
    { title: 'Trash', url: '/folder/trash', icon: 'trash' },
    { title: 'Spam', url: '/folder/spam', icon: 'warning' },
  ];
  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  private lastBackPress = 0;

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private logger: LoggerService,
    private platform: Platform,
    private toastController: ToastController,
    private router: Router,
    private navController: NavController,
  ) {
    this.title.setTitle(MOBILE_APP_TEXT.name);
    this.meta.updateTag({ name: 'description', content: MOBILE_APP_TEXT.description });
    addIcons({ mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, heartOutline, heartSharp, archiveOutline, archiveSharp, trashOutline, trashSharp, warningOutline, warningSharp, bookmarkOutline, bookmarkSharp });
    this.initializeCrashlytics();
    this.initializeAppHandlers();
  }

  async initializeCrashlytics() {
    await FirebaseCrashlytics.setCustomKey({
      key: 'platform',
      value: 'android',
      type: 'string'
    });

    await FirebaseCrashlytics.setCustomKey({
      key: 'environment',
      value: 'production',
      type: 'string'
    });
     await FirebaseCrashlytics.setCustomKey({
      key: 'app_version',
      value: '1.0',
      type: 'string'
    });
    this.logger.info('Crashlytics initialized');
  }

  initializeAppHandlers() {
    // On app start redirect to dashboard if token exists
    this.platform.ready().then(() => {
      this.router.events
        .pipe(
          filter((event): event is NavigationEnd => event instanceof NavigationEnd),
          take(1),
        )
        .subscribe((event) => {
          const token = localStorage.getItem(MOBILE_STORAGE_KEYS.accessToken);
          const currentUrl = event.urlAfterRedirects;
          if (token && (currentUrl === '/' || currentUrl.startsWith(MOBILE_ROUTES.login))) {
            this.router.navigateByUrl(MOBILE_ROUTES.dashboard, { replaceUrl: true });
          }
        });

      // Native back button handling
      this.platform.backButton.subscribeWithPriority(10, async () => {
        const url = this.router.url;
        const token = localStorage.getItem(MOBILE_STORAGE_KEYS.accessToken);

        // If on login but token exists, force dashboard
        if (url === MOBILE_ROUTES.login && token) {
          await this.router.navigateByUrl(MOBILE_ROUTES.dashboard, { replaceUrl: true });
          return;
        }

        // If on dashboard (root) show toast to exit app
        if (url === MOBILE_ROUTES.dashboard || url === '/' || url === '') {
          const now = Date.now();
          if (this.lastBackPress && (now - this.lastBackPress) <= MOBILE_CONFIG.backPressExitWindowMs) {
            CapacitorApp.exitApp();
          } else {
            this.lastBackPress = now;
            const t = await this.toastController.create({
              message: MOBILE_APP_TEXT.errors.backAgainToExit,
              duration: MOBILE_CONFIG.backPressExitWindowMs,
              position: 'bottom'
            });
            await t.present();
          }
          return;
        }

        // Default behavior: navigate back
        this.navController.back();
      });
    });
  }
}
