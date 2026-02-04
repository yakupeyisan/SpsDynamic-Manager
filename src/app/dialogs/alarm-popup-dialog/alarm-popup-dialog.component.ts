import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { AlarmPopupService, type AlarmPopupItem } from 'src/app/services/alarm-popup.service';

@Component({
  selector: 'app-alarm-popup-dialog',
  standalone: true,
  imports: [MaterialModule, CommonModule, MatDialogModule, FormsModule],
  template: `
    <h2 mat-dialog-title>Alarm Uyarısı</h2>
    <mat-dialog-content class="alarm-popup-content">
      <div class="alarm-field" *ngIf="alarmTime">
        <span class="label">Alarm Zamanı:</span>
        <span class="value">{{ alarmTime }}</span>
      </div>
      <div class="alarm-field" *ngIf="sourceType">
        <span class="label">Kaynak Tipi:</span>
        <span class="value">{{ sourceType }}</span>
      </div>
      <div class="alarm-field" *ngIf="sourceName">
        <span class="label">Kaynak:</span>
        <span class="value">{{ sourceName }}</span>
      </div>
      <div class="alarm-field" *ngIf="description">
        <span class="label">Açıklama:</span>
        <span class="value">{{ description }}</span>
      </div>
      <div class="alarm-field" *ngIf="employeeInfo">
        <span class="label">Personel:</span>
        <span class="value">{{ employeeInfo }}</span>
      </div>
      <div class="alarm-field" *ngIf="soundFile">
        <span class="label">Ses Dosyası:</span>
        <span class="value">{{ soundFile }}</span>
      </div>
      <p class="text-muted f-s-12 m-t-16" *ngIf="receivedAt">Alındı: {{ receivedAt }}</p>

      <!-- Onay bölümü: henüz onaylanmamışsa mesaj + Onayla, onaylanmışsa mesajı göster -->
      <div class="alarm-approve-section m-t-16">
        <mat-label class="f-s-14 f-w-600 d-block m-b-8">Mesaj</mat-label>
        @if (isApproved) {
          <p class="approved-note">{{ approvedNoteDisplay }}</p>
          <p class="text-success f-s-12 m-t-8">Onaylandı</p>
        } @else if (alarmEventId != null) {
          <mat-form-field appearance="outline" class="w-100" color="primary">
            <textarea
              matInput
              [(ngModel)]="approvedNote"
              placeholder="Onay mesajı (isteğe bağlı)"
              rows="3"
            ></textarea>
          </mat-form-field>
        }
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      @if (!isApproved && alarmEventId != null) {
        <button mat-button (click)="close()" [disabled]="isLoading">Kapat</button>
        <button
          mat-flat-button
          color="primary"
          (click)="approve()"
          [disabled]="isLoading">
          @if (isLoading) {
            <span class="d-flex align-items-center">
              <mat-progress-spinner diameter="20" mode="indeterminate" class="m-r-8"></mat-progress-spinner>
              Onaylanıyor...
            </span>
          } @else {
            Onayla
          }
        </button>
      } @else {
        <button mat-flat-button color="primary" (click)="close()">Tamam</button>
      }
    </mat-dialog-actions>
  `,
  styles: [`
    .alarm-popup-content {
      padding: 0 24px 8px;
      min-width: 360px;
      max-width: 520px;
    }
    .alarm-field {
      margin-bottom: 12px;
    }
    .alarm-field .label {
      font-weight: 600;
      margin-right: 8px;
      color: #555;
    }
    .alarm-field .value {
      word-break: break-word;
    }
    .alarm-approve-section { padding-top: 8px; border-top: 1px solid #eee; }
    .approved-note { margin: 0; white-space: pre-wrap; word-break: break-word; }
    .w-100 { width: 100%; }
    .m-t-8 { margin-top: 8px; }
    .m-t-16 { margin-top: 16px; }
    .m-b-8 { margin-bottom: 8px; }
  `]
})
export class AlarmPopupDialogComponent {
  alarmTime: string = '';
  sourceType: string = '';
  sourceName: string = '';
  description: string = '';
  employeeInfo: string = '';
  soundFile: string = '';
  receivedAt: string = '';

  alarmEventId: number | null = null;
  isApproved = false;
  approvedNoteDisplay: string = '';
  approvedNote: string = '';
  isLoading = false;

  constructor(
    public dialogRef: MatDialogRef<AlarmPopupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AlarmPopupItem,
    private http: HttpClient,
    private toastr: ToastrService,
    private alarmPopupService: AlarmPopupService
  ) {
    const p = data?.payload || {};
    this.alarmTime = this.fmtDateTime(p['AlarmTime']);
    this.sourceType = String(p['SourceType'] ?? '').trim();
    this.sourceName = String(p['SourceName'] ?? '').trim();
    this.description = String(p['Description'] ?? '').trim();
    const emp = p['Employee'] as Record<string, unknown> | undefined;
    if (emp) {
      const name = [emp['Name'], emp['SurName']].filter(Boolean).join(' ');
      this.employeeInfo = name || String(emp['EmployeeID'] ?? '').trim();
    } else {
      this.employeeInfo = String(p['EmployeeID'] ?? '').trim();
    }
    this.soundFile = String(p['SoundFile'] ?? '').trim();
    this.receivedAt = data?.receivedAt ? new Date(data.receivedAt).toLocaleString('tr-TR') : '';

    const id = p['AlarmEventID'];
    this.alarmEventId = id != null ? Number(id) : null;
    if (this.alarmEventId != null && Number.isNaN(this.alarmEventId)) this.alarmEventId = null;
    this.isApproved = p['ApprovedTime'] != null;
    this.approvedNoteDisplay = String(p['ApprovedNote'] ?? '').trim() || '—';
  }

  private fmtDateTime(v: unknown): string {
    if (v == null) return '';
    const d = typeof v === 'string' ? new Date(v) : new Date(Number(v));
    return isNaN(d.getTime()) ? String(v) : d.toLocaleString('tr-TR');
  }

  approve(): void {
    if (this.alarmEventId == null || this.isLoading) return;
    this.isLoading = true;
    const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;
    const body = {
      AlarmEventID: this.alarmEventId,
      ApprovedNote: (this.approvedNote || '').trim() || undefined
    };
    this.http
      .post(`${apiUrl}/api/AlarmEvents/Approve`, body)
      .pipe(
        catchError(err => {
          this.toastr.error(err?.error?.message || err?.message || 'Onaylama sırasında hata oluştu.', 'Hata');
          return of(null);
        }),
        finalize(() => { this.isLoading = false; })
      )
      .subscribe(res => {
        if (res != null) {
          this.toastr.success('Alarm onaylandı.', 'Başarılı');
          this.isApproved = true;
          this.approvedNoteDisplay = (this.approvedNote || '').trim() || '—';
          this.alarmPopupService.remove(this.data.id);
          this.alarmPopupService.notifyAlarmApproved();
          this.dialogRef.close();
        }
      });
  }

  close(): void {
    this.dialogRef.close();
  }
}
