import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { loadIconifyOffline } from './app/iconify-offline';
import { environment } from './environments/environment';

// Offline ortam için ikonları API yerine bundle'dan yükle (internetsiz sunucularda ERR_TIMED_OUT hatasını önler)
loadIconifyOffline();

// Environment'daki ayara göre favicon'u ayarla (ng serve/build'de doğru ikon görünsün)
const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
if (link && environment.favicons && environment.setting) {
  const faviconFile = environment.favicons[environment.setting as keyof typeof environment.favicons] || 'default.ico';
  link.href = 'favicons/' + faviconFile;
}

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
