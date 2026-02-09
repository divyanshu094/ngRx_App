import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FirebaseCrashlytics } from '@capacitor-firebase/crashlytics';

@Injectable({ providedIn: 'root' })
export class LoggerService {

  debug(message: string, data?: any) {
    if (!environment.production) {
      console.debug(message, data);
    }
  }

  info(message: string, data?: any) {
    console.info(message, data);
  }

  warn(message: string, data?: any) {
    console.warn(message, data);
  }

  error(message: string, error?: any, metadata?: Record<string, any>) {
    console.error(message, error);

    if (environment.production) {
      // Attach metadata before sending crash
      if (metadata) {
        Object.keys(metadata).forEach(key => {
          FirebaseCrashlytics.setCustomKey({ key, value: String(metadata[key]), type: "string" });
        });
      }

      FirebaseCrashlytics.recordException(error || new Error(message));
    }
  }
}
