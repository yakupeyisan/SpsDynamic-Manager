import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { TablerIconsModule } from 'angular-tabler-icons';

export interface RequestClaimsDialogData {
  message?: string;
  required_claims?: string[];
  user_claims?: Record<string, string>;
}

@Component({
  selector: 'app-request-claims-dialog',
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    TablerIconsModule
  ],
  template: `
    <h2 mat-dialog-title>Yetki talep et</h2>
    <mat-dialog-content class="request-claims-dialog-content">
      @if (data.message) {
        <p class="m-b-16 text-muted">{{ data.message }}</p>
      }
      <p class="f-s-14 f-w-600 m-b-8">Gerekli yetkiler (RequiredClaims)</p>
      <ul class="required-claims-list">
        @for (claim of requiredClaims; track claim) {
          <li>{{ claim }}</li>
        }
      </ul>
      <mat-label class="f-s-14 f-w-600 m-b-8 d-block m-t-16">Yetki talep açıklaması</mat-label>
      <mat-form-field appearance="outline" class="w-100" color="primary">
        <textarea
          matInput
          [formControl]="descriptionControl"
          placeholder="Talep açıklaması giriniz (isteğe bağlı)"
          rows="3"
        ></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()" [disabled]="isLoading">Kapat</button>
      <button
        mat-flat-button
        color="primary"
        (click)="submitRequest()"
        [disabled]="isLoading || requiredClaims.length === 0"
      >
        @if (isLoading) {
          <span class="d-flex align-items-center justify-content-center">
            <mat-progress-spinner diameter="20" mode="indeterminate" class="m-r-8"></mat-progress-spinner>
            Gönderiliyor...
          </span>
        } @else {
          Yetki talep et
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .request-claims-dialog-content {
      padding: 24px;
      min-width: 420px;
      max-width: 560px;
    }
    .required-claims-list {
      margin: 0;
      padding-left: 20px;
      max-height: 200px;
      overflow-y: auto;
    }
    .required-claims-list li {
      margin-bottom: 4px;
    }
  `]
})
export class RequestClaimsDialogComponent {
  isLoading = false;
  descriptionControl = new FormControl('');
  requiredClaims: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<RequestClaimsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RequestClaimsDialogData,
    private http: HttpClient,
    private toastr: ToastrService
  ) {
    const claims = data?.required_claims ?? data?.['required_claims'] ?? [];
    this.requiredClaims = Array.isArray(claims) ? claims : [];
  }

  submitRequest(): void {
    if (this.requiredClaims.length === 0) {
      this.toastr.warning('Talep edilecek yetki bulunamadı.', 'Uyarı');
      return;
    }
    const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;
    const body = {
      required_claims: this.requiredClaims,
      description: this.descriptionControl.value?.trim() || undefined
    };
    this.isLoading = true;
    this.http
      .post(`${apiUrl}/api/RequestClaims/Request`, body)
      .pipe(
        catchError((err) => {
          const msg = err?.error?.message || err?.message || 'Yetki talebi gönderilirken hata oluştu.';
          this.toastr.error(msg, 'Hata');
          return of(null);
        }),
        finalize(() => { this.isLoading = false; })
      )
      .subscribe((res) => {
        if (res != null) {
          this.toastr.success('Yetki talebiniz alındı.', 'Başarılı');
          this.dialogRef.close(true);
        }
      });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
