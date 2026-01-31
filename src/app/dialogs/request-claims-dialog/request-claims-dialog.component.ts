// Updated: 2026-01-30 22:30 - Force rebuild
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

export interface ClaimWithDescription {
  claim: string;
  description?: string;
}

export interface RequestClaimsDialogData {
  message?: string;
  required_claims?: string[];
  /** Açıklamalı claim listesi (varsa kullanılır) */
  claims_with_details?: ClaimWithDescription[];
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
      <p class="m-b-16 text-muted" *ngIf="message">{{ message }}</p>
      <p class="f-s-14 f-w-600 m-b-8">Gerekli yetkiler</p>
      <ul class="required-claims-list" *ngIf="claimsWithDetails && claimsWithDetails.length > 0">
        <li *ngFor="let item of claimsWithDetails">
          <strong>{{ item.claim }}</strong>
          <span class="claim-desc" *ngIf="item.description"> - {{ item.description }}</span>
        </li>
      </ul>
      <p *ngIf="!claimsWithDetails || claimsWithDetails.length === 0" class="text-muted">
        Talep edilecek yetki bulunamadı.
      </p>
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
        <span *ngIf="isLoading" class="d-flex align-items-center justify-content-center">
          <mat-progress-spinner diameter="20" mode="indeterminate" class="m-r-8"></mat-progress-spinner>
          Gönderiliyor...
        </span>
        <span *ngIf="!isLoading">Yetki talep et</span>
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
      margin-bottom: 8px;
      line-height: 1.4;
    }
    .claim-desc {
      color: #666;
      font-size: 13px;
    }
  `]
})
export class RequestClaimsDialogComponent implements OnInit {
  isLoading = false;
  descriptionControl = new FormControl('');
  requiredClaims: string[] = [];
  claimsWithDetails: ClaimWithDescription[] = [];
  message: string = '';

  constructor(
    public dialogRef: MatDialogRef<RequestClaimsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RequestClaimsDialogData,
    private http: HttpClient,
    private toastr: ToastrService
  ) {
    console.log('[RequestClaimsDialog] Constructor - data:', JSON.stringify(data));
  }

  ngOnInit(): void {
    console.log('[RequestClaimsDialog] ngOnInit - data:', this.data);
    
    if (!this.data) {
      console.error('[RequestClaimsDialog] No data received!');
      return;
    }
    
    // Message
    this.message = this.data.message || '';
    
    // Önce açıklamalı listeyi kontrol et
    const detailedClaims = this.data.claims_with_details;
    console.log('[RequestClaimsDialog] claims_with_details:', detailedClaims);
    
    if (detailedClaims && Array.isArray(detailedClaims) && detailedClaims.length > 0) {
      this.claimsWithDetails = detailedClaims.map(c => ({
        claim: c.claim,
        description: c.description
      }));
      this.requiredClaims = detailedClaims.map(c => c.claim);
    } else {
      // Fallback: sadece claim adları
      const claims = this.data.required_claims ?? [];
      console.log('[RequestClaimsDialog] required_claims fallback:', claims);
      this.requiredClaims = Array.isArray(claims) ? claims : [];
      this.claimsWithDetails = this.requiredClaims.map(claim => ({ claim }));
    }
    
    console.log('[RequestClaimsDialog] Final claimsWithDetails:', this.claimsWithDetails);
    console.log('[RequestClaimsDialog] Final requiredClaims:', this.requiredClaims);
  }

  submitRequest(): void {
    if (this.requiredClaims.length === 0) {
      this.toastr.warning('Talep edilecek yetki bulunamadı.', 'Uyarı');
      return;
    }
    const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;
    const claimDetails = this.claimsWithDetails
      .filter(c => c.claim)
      .map(c => ({
        Name: c.claim,
        ClaimDesc: c.description || undefined
      }));
    const body = {
      required_claims: this.requiredClaims,
      required_claim_details: claimDetails.length > 0 ? claimDetails : undefined,
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
