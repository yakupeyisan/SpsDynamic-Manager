// SoundFiles Component – ses dosyalarını listele, oynat, ekle, sil
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export interface SoundFile {
  id: number;
  recid?: number;
  Name: string;
  Url: string;
  [key: string]: any;
}

interface SoundFilesResponse {
  records?: SoundFile[];
  total?: number;
  status?: string;
}

@Component({
  selector: 'app-sound-files',
  standalone: true,
  imports: [MaterialModule, CommonModule, FormsModule, TranslateModule],
  templateUrl: './sound-files.component.html',
  styleUrls: ['./sound-files.component.scss']
})
export class SoundFilesComponent implements OnInit {
  list: SoundFile[] = [];
  loading = false;
  showForm = false;
  formName = '';
  formFile: File | null = null;
  playingUrl: string | null = null;
  readonly acceptedAudioTypes = 'audio/*,.mp3,.wav,.ogg,.m4a,.aac';
  readonly fileInputId = 'sound-file-input';
  private audio: HTMLAudioElement | null = null;
  private apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;
  private baseUrl = `${this.apiUrl}/api/SoundFiles`;
  private get soundsBaseUrl(): string {
    return `${this.apiUrl}/api/Sounds`;
  }

  /** Mikrofonla kayıt */
  isRecording = false;
  recordingDuration = 0;
  private mediaRecorder: MediaRecorder | null = null;
  private mediaStream: MediaStream | null = null;
  private recordingChunks: Blob[] = [];
  private recordingTimer: ReturnType<typeof setInterval> | null = null;
  microphoneError: string | null = null;

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    public translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.http
      .post<SoundFilesResponse>(this.baseUrl, {
        limit: -1,
        offset: 0,
        page: 1
      })
      .pipe(
        map((res) => ({
          records: res.records || [],
          total: res.total ?? (res.records?.length ?? 0)
        })),
        catchError((err) => {
          console.error('SoundFiles load error:', err);
          this.toastr.error(
            this.translate.instant('common.loadError') || 'Liste yüklenemedi',
            this.translate.instant('common.error') || 'Hata'
          );
          return of({ records: [], total: 0 });
        })
      )
      .subscribe((res) => {
        this.list = (res.records || []).map((r) => this.normalizeRecord(r));
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  private normalizeRecord(r: any): SoundFile {
    const id = r.SoundFileID ?? r.ID ?? r.recid ?? r.id ?? 0;
    return {
      id: Number(id),
      recid: Number(id),
      Name: r.Name ?? r.name ?? '',
      Url: r.Url ?? r.url ?? '',
      ...r
    };
  }

  openAdd(): void {
    this.formName = '';
    this.formFile = null;
    this.isRecording = false;
    this.microphoneError = null;
    this.showForm = true;
    this.cdr.markForCheck();
  }

  cancelForm(): void {
    if (this.isRecording) this.stopRecording();
    this.showForm = false;
    this.formName = '';
    this.formFile = null;
    this.microphoneError = null;
    this.cdr.markForCheck();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    this.formFile = file ?? null;
    if (input) input.value = '';
    this.microphoneError = null;
    this.cdr.markForCheck();
  }

  async startRecording(): Promise<void> {
    this.microphoneError = null;
    this.recordingDuration = 0;
    this.recordingChunks = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaStream = stream;
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const recorder = new MediaRecorder(stream);
      this.mediaRecorder = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.recordingChunks.push(e.data);
      };
      recorder.onstop = () => {
        this.cleanupRecording();
        const blob = new Blob(this.recordingChunks, { type: mimeType });
        const ext = mimeType.includes('webm') ? 'webm' : 'ogg';
        this.formFile = new File([blob], `mikrofon-kaydi.${ext}`, { type: blob.type });
        this.cdr.markForCheck();
      };
      recorder.start(500);
      this.isRecording = true;
      this.formFile = null;
      this.recordingTimer = setInterval(() => {
        this.recordingDuration++;
        this.cdr.markForCheck();
      }, 1000);
      this.cdr.markForCheck();
    } catch (err: any) {
      this.microphoneError = err?.message || 'Mikrofon erişilemedi. Tarayıcı izni verin.';
      this.toastr.error(this.microphoneError ?? 'Mikrofon erişilemedi.', this.translate.instant('common.error') || 'Hata');
      this.cdr.markForCheck();
    }
  }

  stopRecording(): void {
    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') return;
    this.mediaRecorder.stop();
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }
    this.isRecording = false;
    this.cdr.markForCheck();
  }

  private cleanupRecording(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    this.mediaRecorder = null;
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }
  }

  formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  clearSelectedFile(): void {
    this.formFile = null;
    this.cdr.markForCheck();
  }

  triggerFileInput(): void {
    (document.getElementById(this.fileInputId) as HTMLInputElement)?.click();
  }

  save(): void {
    const name = (this.formName || '').trim();
    if (!name) {
      this.toastr.warning('Dosya adı girin.', this.translate.instant('common.warning') || 'Uyarı');
      return;
    }
    if (!this.formFile) {
      this.toastr.warning('Ses dosyası seçin veya mikrofonla kaydedin.', this.translate.instant('common.warning') || 'Uyarı');
      return;
    }
    this.uploadFile(name);
  }

  private saveNew(name: string): void {
    const body = {
      request: {
        action: 'save',
        name: 'AddSoundFile',
        record: { Name: name }
      }
    };
    this.loading = true;
    this.cdr.markForCheck();
    this.http
      .post<{ error?: boolean; message?: string; record?: any }>(`${this.baseUrl}/form`, body)
      .pipe(
        catchError((err) => {
          this.loading = false;
          this.cdr.markForCheck();
          this.toastr.error(err?.message || 'Kayıt başarısız.', this.translate.instant('common.error') || 'Hata');
          return of({ error: true, message: err?.message });
        })
      )
      .subscribe((res) => {
        this.loading = false;
        this.cdr.markForCheck();
        if (res?.error) {
          this.toastr.error(res?.message || 'Kayıt başarısız.', this.translate.instant('common.error') || 'Hata');
          return;
        }
        this.toastr.success(
          this.translate.instant('common.saveSuccess') || 'Kaydedildi',
          this.translate.instant('common.success') || 'Başarılı'
        );
        this.cancelForm();
        this.load();
      });
  }

  private uploadFile(name: string): void {
    if (!this.formFile) return;
    this.loading = true;
    this.cdr.markForCheck();
    this.fileToBase64(this.formFile).then((base64) => {
      const body: { Name: string; FileData: string } = {
        Name: name,
        FileData: base64
      };
      this.http
        .post<{ error?: boolean; message?: string; record?: any }>(`${this.baseUrl}/upload`, body)
        .pipe(
          catchError((err) => {
            this.loading = false;
            this.cdr.markForCheck();
            this.toastr.error(err?.message ?? 'Dosya yüklenemedi.', this.translate.instant('common.error') || 'Hata');
            return of({ error: true, message: err?.message });
          })
        )
        .subscribe((res) => {
          this.loading = false;
          this.cdr.markForCheck();
          if (res?.error) {
            this.toastr.error(res?.message ?? 'Dosya yüklenemedi.', this.translate.instant('common.error') || 'Hata');
            return;
          }
          this.toastr.success(
            this.translate.instant('common.saveSuccess') || 'Kaydedildi',
            this.translate.instant('common.success') || 'Başarılı'
          );
          this.cancelForm();
          this.load();
        });
    }).catch((err) => {
      this.loading = false;
      this.cdr.markForCheck();
      this.toastr.error(err?.message ?? 'Dosya okunamadı.', this.translate.instant('common.error') || 'Hata');
    });
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.indexOf('base64,') >= 0 ? dataUrl.split('base64,')[1] : dataUrl;
        resolve(base64 ?? '');
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  deleteItem(item: SoundFile): void {
    if (!window.confirm(`"${item.Name}" silinsin mi?`)) return;

    this.loading = true;
    this.cdr.markForCheck();
    this.http
      .post<{ error?: boolean; message?: string }>(this.baseUrl + '/delete', {
        request: { action: 'delete', name: item.Name || '' }
      })
      .pipe(
        catchError((err) => {
          this.loading = false;
          this.cdr.markForCheck();
          this.toastr.error(err?.message || 'Silinemedi.', this.translate.instant('common.error') || 'Hata');
          return of({ error: true, message: err?.message });
        })
      )
      .subscribe((res) => {
        this.loading = false;
        this.cdr.markForCheck();
        if (res?.error) {
          this.toastr.error(res?.message || 'Silinemedi.', this.translate.instant('common.error') || 'Hata');
          return;
        }
        this.toastr.success(
          this.translate.instant('common.deleteSuccess') || 'Silindi',
          this.translate.instant('common.success') || 'Başarılı'
        );
        this.stopPlay();
        this.load();
      });
  }

  /** Ses dosyası için oynatma URL'si: api/Sounds/{fileName} */
  getSoundPlayUrl(item: SoundFile): string {
    const fileName = item.Name || '';
    if (!fileName) return '';
    return `${this.soundsBaseUrl}/${encodeURIComponent(fileName)}`;
  }

  play(item: SoundFile): void {
    const url = this.getSoundPlayUrl(item);
    if (!url) {
      this.toastr.warning('Dosya adı yok.', this.translate.instant('common.warning') || 'Uyarı');
      return;
    }
    if (this.playingUrl === url) {
      this.stopPlay();
      return;
    }
    this.stopPlay();
    this.audio = new Audio(url);
    this.playingUrl = url;
    this.cdr.markForCheck();
    this.audio.play().catch((err) => {
      console.error('Play error:', err);
      this.toastr.error('Ses oynatılamadı.', this.translate.instant('common.error') || 'Hata');
      this.playingUrl = null;
      this.cdr.markForCheck();
    });
    this.audio.onended = () => {
      this.playingUrl = null;
      this.cdr.markForCheck();
    };
  }

  stopPlay(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }
    this.playingUrl = null;
    this.cdr.markForCheck();
  }

  isPlaying(item: SoundFile): boolean {
    return this.playingUrl === this.getSoundPlayUrl(item);
  }
}
