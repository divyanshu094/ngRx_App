import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { isDevMode } from '@angular/core';
import { reducers } from './app/store';
import { GroceryEffects } from './app/store/effects/grocery.effects';
import { CategoryEffects } from './app/store/effects/category.effects';
import { hydrationMetaReducer } from './app/store/reducers/meta.reducer';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
    provideStore(
     reducers,
      { metaReducers: [hydrationMetaReducer] }
    ),
    provideEffects([GroceryEffects, CategoryEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() })
  ],
});
