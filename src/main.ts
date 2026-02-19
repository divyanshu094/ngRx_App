import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { isDevMode } from '@angular/core';
import { groceryReducer } from './app/store/reducers/grocery.reducer';
import { bucketReducer } from './app/store/reducers/bucket.reducer';
import { hydrationMetaReducer } from './app/store/reducers/meta.reducer';
import { reducers } from './app/store';
import { GroceryEffects } from './app/store/effects/grocery.effects';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    importProvidersFrom(HttpClientModule) ,
    provideStore(
     reducers,
      { metaReducers: [hydrationMetaReducer] }
    ),
    provideEffects([GroceryEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() })
  ],
});
