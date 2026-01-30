import { Component, Inject, OnInit } from '@angular/core';
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
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export interface RequestClaimAuthorizationOption {
  Id: number;
  Name: string;
  Type: 'Authorization' | 'WebClientAuthorization';
}

export interface RequestClaimActionDialogData {
  mode: 'approve' | 'reject';
  record: { Id?: number; ClaimName?: string; Description?: string; RequestUser?: any; [key: string]: any };
  /** İsteğe bağlı: backend'den yetki seçenekleri; yoksa record.RequestUser'dan üretilir */
  authorization_options?: RequestClaimAuthorizationOption[];
}

@Component({
  selector: 'app-request-claim-action-dialog',
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    TablerIconsModule,
    TranslateModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isApprove ? ('Talep Talebi Onayla' | translate) : ('Talep Talebini Reddet' | translate) }}</h2>
    <mat-dialog-content class="request-claim-action-dialog-content">
      <p class="f-s-14 m-b-16">
        <strong>ID:</strong> {{ recordId }} <span *ngIf="record?.ClaimName" class="m-l-8">| <strong>Talep:</strong> {{ record?.ClaimName }}</span>
      </p>
      @if (isApprove && authorizationOptions.length > 0) {
        <mat-label class="f-s-14 f-w-600 m-b-8 d-block">Yetki seçimi</mat-label>
        @if (authorizationOptions.length > 1) {
          <mat-radio-group [value]="selectedAuthorizationId" (change)="onAuthorizationChange($event)" class="authorization-radio-group">
            @for (opt of authorizationOptions; track opt.Id) {
              <mat-radio-button [value]="opt.Id" class="authorization-radio">
                {{ opt.Name }} ({{ opt.Type === 'Authorization' ? 'Yetki' : 'Web Yetki' }})
              </mat-radio-button>
            }
          </mat-radio-group>
        } @else {
          <p class="f-s-14 m-b-16 text-muted">{{ authorizationOptions[0].Name }} ({{ authorizationOptions[0].Type === 'Authorization' ? 'Yetki' : 'Web Yetki' }})</p>
        }
      }
      <mat-form-field appearance="outline" class="w-100" color="primary">
        <mat-label>{{ isApprove ? 'Yanıt mesajı (isteğe bağlı)' : 'Red sebebi (isteğe bağlı)' }}</mat-label>
        <textarea
          matInput
          [formControl]="responseMessageControl"
          [placeholder]="isApprove ? 'Yanıt mesajı giriniz' : 'Red sebebi giriniz'"
          rows="3"
        ></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()" [disabled]="isLoading">İptal</button>
      <button
        mat-flat-button
        [color]="isApprove ? 'primary' : 'warn'"
        (click)="submit()"
        [disabled]="isLoading"
      >
        @if (isLoading) {
          <span class="d-flex align-items-center justify-content-center">
            <mat-progress-spinner diameter="20" mode="indeterminate" class="m-r-8"></mat-progress-spinner>
            Yükleniyor...
          </span>
        } @else {
          {{ isApprove ? 'Onayla' : 'Reddet' }}
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .request-claim-action-dialog-content {
      padding: 24px;
      min-width: 420px;
      max-width: 560px;
    }
    .m-b-16 { margin-bottom: 16px; }
    .m-l-8 { margin-left: 8px; }
    .w-100 { width: 100%; }
    .authorization-radio-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
    .authorization-radio { display: block; }
  `]
})
export class RequestClaimActionDialogComponent implements OnInit {
  isLoading = false;
  responseMessageControl = new FormControl('');
  authorizationOptions: RequestClaimAuthorizationOption[] = [];
  selectedAuthorizationId: number | null = null;

  get isApprove(): boolean {
    return this.data?.mode === 'approve';
  }
  get record(): any {
    return this.data?.record ?? {};
  }
  get recordId(): number | string {
    const r = this.record;
    return r.Id ?? r.id ?? r.recid ?? '';
  }

  constructor(
    public dialogRef: MatDialogRef<RequestClaimActionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RequestClaimActionDialogData,
    private http: HttpClient,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    if (!this.isApprove) return;
    const fromData = this.data?.authorization_options;
    if (fromData && Array.isArray(fromData) && fromData.length > 0) {
      this.authorizationOptions = fromData;
      this.selectedAuthorizationId = fromData[0].Id;
      return;
    }
    const user = this.record?.RequestUser;
    if (!user) return;
    const options: RequestClaimAuthorizationOption[] = [];
    const auth = user.Authorization;
    const webAuth = user.WebClientAuthorization;
    if (auth && (auth.Id != null || auth.id != null)) {
      options.push({
        Id: auth.Id ?? auth.id,
        Name: auth.Name ?? auth.name ?? 'Yetki',
        Type: 'Authorization'
      });
    }
    if (webAuth && (webAuth.Id != null || webAuth.id != null)) {
      options.push({
        Id: webAuth.Id ?? webAuth.id,
        Name: webAuth.Name ?? webAuth.name ?? 'Web Yetki',
        Type: 'WebClientAuthorization'
      });
    }
    this.authorizationOptions = options;
    if (options.length >= 1) {
      this.selectedAuthorizationId = options[0].Id;
    }
  }

  onAuthorizationChange(event: any): void {
    const value = event?.value;
    if (value != null) this.selectedAuthorizationId = Number(value);
  }

  submit(): void {
    const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;
    const id = this.recordId;
    if (id === '' || id == null) {
      this.toastr.warning('Kayıt ID bulunamadı.', this.translate.instant('common.warning'));
      return;
    }
    const body: any = {
      Id: Number(id),
      ResponseMessage: this.responseMessageControl.value?.trim() || undefined
    };
    if (this.isApprove && this.selectedAuthorizationId != null) {
      body.AuthorizationId = this.selectedAuthorizationId;
    }
    const endpoint = this.isApprove ? 'Approve' : 'Reject';
    this.isLoading = true;
    this.http
      .post(`${apiUrl}/api/RequestClaims/${endpoint}`, body)
      .pipe(
        catchError((err) => {
          const msg = err?.error?.message || err?.message || (this.isApprove ? 'Onaylama sırasında hata oluştu.' : 'Reddetme sırasında hata oluştu.');
          this.toastr.error(msg, this.translate.instant('common.error'));
          return of(null);
        }),
        finalize(() => { this.isLoading = false; })
      )
      .subscribe((res) => {
        if (res != null) {
          this.toastr.success(
            this.isApprove ? 'Talep onaylandı.' : 'Talep reddedildi.',
            this.translate.instant('common.success')
          );
          this.dialogRef.close(true);
        }
      });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
