import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { loadIconifyOffline } from './app/iconify-offline';

// Offline ortam için ikonları API yerine bundle'dan yükle (internetsiz sunucularda ERR_TIMED_OUT hatasını önler)
loadIconifyOffline();

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
