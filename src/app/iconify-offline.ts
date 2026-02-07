/**
 * Iconify offline icon loader
 * İkonları build sırasında bundle'a ekleyerek internetsiz ortamda çalışmasını sağlar.
 * Sunucu ve bilgisayarlar dış ağa kapalı olduğunda api.iconify.design API çağrıları
 * ERR_TIMED_OUT hatası verir. Bu yükleme sayesinde ikonlar offline çalışır.
 */
import solarIcons from '@iconify-json/solar/icons.json';
import mdiIcons from '@iconify-json/mdi/icons.json';
import icIcons from '@iconify-json/ic/icons.json';

declare global {
  interface Window {
    Iconify?: {
      addCollection: (data: unknown) => boolean;
    };
  }
}

export function loadIconifyOffline(): void {
  if (typeof window === 'undefined' || !window.Iconify?.addCollection) {
    console.warn('Iconify offline: window.Iconify not available');
    return;
  }

  try {
    window.Iconify.addCollection(solarIcons as never);
    window.Iconify.addCollection(mdiIcons as never);
    window.Iconify.addCollection(icIcons as never);
  } catch (err) {
    console.error('Iconify offline: Failed to load icon collections', err);
  }
}
