// GridSettings Component
import { Component, OnInit } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface GridSetting {
  key: string;
  value: string;
  displayName: string;
  formattedValue: string;
  valueType: 'json' | 'array' | 'boolean' | 'string' | 'number';
  isExpanded: boolean;
}

@Component({
  selector: 'app-grid-settings',
  standalone: true,
  imports: [MaterialModule, CommonModule, TablerIconsModule, TranslateModule],
  templateUrl: './grid-settings.component.html',
  styleUrls: ['./grid-settings.component.scss']
})
export class GridSettingsComponent implements OnInit {
  gridSettings: GridSetting[] = [];
  isUploading: boolean = false;

  constructor(
    private toastr: ToastrService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadGridSettings();
  }

  loadGridSettings(): void {
    this.gridSettings = [];
    
    // Tüm localStorage key'lerini al
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('grid_')) {
        const value = localStorage.getItem(key) || '';
        const displayName = this.formatKeyName(key);
        const { formattedValue, valueType } = this.formatValue(value);
        
        this.gridSettings.push({
          key: key,
          value: value,
          displayName: displayName,
          formattedValue: formattedValue,
          valueType: valueType,
          isExpanded: false
        });
      }
    }
    
    // Key'e göre sırala
    this.gridSettings.sort((a, b) => a.key.localeCompare(b.key));
  }

  formatValue(value: string): { formattedValue: string; valueType: 'json' | 'array' | 'boolean' | 'string' | 'number' } {
    if (!value || value.trim() === '') {
      return { formattedValue: '(boş)', valueType: 'string' };
    }

    // Boolean kontrolü
    if (value === 'true' || value === 'false') {
      return { formattedValue: value, valueType: 'boolean' };
    }

    // Number kontrolü
    if (!isNaN(Number(value)) && value.trim() !== '') {
      return { formattedValue: value, valueType: 'number' };
    }

    // JSON veya Array kontrolü
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return { formattedValue: JSON.stringify(parsed, null, 2), valueType: 'array' };
      } else if (typeof parsed === 'object') {
        return { formattedValue: JSON.stringify(parsed, null, 2), valueType: 'json' };
      }
    } catch (e) {
      // JSON değil, string olarak kal
    }

    return { formattedValue: value, valueType: 'string' };
  }

  toggleExpand(setting: GridSetting): void {
    setting.isExpanded = !setting.isExpanded;
  }

  isLongValue(setting: GridSetting): boolean {
    return setting.value.length > 100 || setting.valueType === 'json' || setting.valueType === 'array';
  }

  formatKeyName(key: string): string {
    // grid_ prefix'ini kaldır
    let formatted = key.replace(/^grid_/, '');
    
    // Alt çizgileri boşlukla değiştir ve kelimeleri büyük harfle başlat
    formatted = formatted
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    return formatted;
  }

  clearSetting(key: string): void {
    if (confirm(`"${this.formatKeyName(key)}" ayarını silmek istediğinize emin misiniz?`)) {
      localStorage.removeItem(key);
      this.loadGridSettings();
      this.toastr.success('Ayar başarıyla silindi', 'Başarılı');
    }
  }

  clearAllSettings(): void {
    if (confirm('Tüm grid ayarlarını silmek istediğinize emin misiniz?')) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('grid_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      this.loadGridSettings();
      this.toastr.success(`${keysToRemove.length} ayar başarıyla silindi`, 'Başarılı');
    }
  }

  copyValue(value: string): void {
    navigator.clipboard.writeText(value).then(() => {
      this.toastr.success('Değer panoya kopyalandı', 'Başarılı');
    }).catch(() => {
      this.toastr.error('Kopyalama başarısız oldu', 'Hata');
    });
  }

  uploadToServer(): void {
    if (this.gridSettings.length === 0) {
      this.toastr.warning('Yüklenecek grid ayarı bulunmamaktadır.', 'Uyarı');
      return;
    }

    if (!confirm(`${this.gridSettings.length} grid ayarını sunucuya yüklemek istediğinize emin misiniz?`)) {
      return;
    }

    this.isUploading = true;

    // Tüm grid ayarlarını topla
    const settingsData: { key: string; value: string }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('grid_')) {
        const value = localStorage.getItem(key) || '';
        settingsData.push({ key, value });
      }
    }

    // API endpoint'i - GridSettings için özel endpoint olabilir veya genel bir endpoint
    const url = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/GridSettings/upload`;
    
    this.http.post(url, {
      settings: settingsData
    }).pipe(
      catchError(error => {
        this.isUploading = false;
        this.toastr.error('Sunucuya yükleme başarısız oldu: ' + (error.error?.message || error.message || 'Bilinmeyen hata'), 'Hata');
        return of({ error: true, message: error.message });
      })
    ).subscribe((response: any) => {
      this.isUploading = false;
      if (response.error === false || response.status === 'success') {
        this.toastr.success(`${settingsData.length} grid ayarı başarıyla sunucuya yüklendi`, 'Başarılı');
      } else {
        this.toastr.error(response.message || 'Sunucuya yükleme başarısız oldu', 'Hata');
      }
    });
  }
}
