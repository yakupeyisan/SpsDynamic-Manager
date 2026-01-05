import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-update-profile-image-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule, MatDialogModule, TablerIconsModule],
  template: `
    <h2 mat-dialog-title class="dialog-title d-flex align-items-center justify-content-between">
      <span>Profil Resmini Güncelle</span>
      <button mat-icon-button mat-dialog-close class="close-button">
        <i-tabler name="x" class="icon-20"></i-tabler>
      </button>
    </h2>

    <mat-dialog-content class="dialog-content">
      <div class="d-flex flex-column align-items-center">
        <!-- Preview Image -->
        <div class="image-preview-container">
          @if(previewImageUrl) {
          <div class="preview-wrapper">
            <img [src]="previewImageUrl" alt="Preview" class="preview-image rounded-circle" />
            <div class="preview-overlay" (click)="fileInput.click()">
              <i-tabler name="edit" class="icon-24 text-white"></i-tabler>
            </div>
          </div>
          } @else {
          <div class="preview-placeholder rounded-circle d-flex flex-column align-items-center justify-content-center" (click)="fileInput.click()">
            <div class="placeholder-icon">
              <i-tabler name="photo-plus" class="icon-64 text-primary"></i-tabler>
            </div>
            <p class="placeholder-text m-t-16">Resim Seçin</p>
            <p class="placeholder-subtext">Maksimum 5MB</p>
          </div>
          }
        </div>

        <!-- File Input -->
        <div class="file-input-wrapper">
          <input
            type="file"
            #fileInput
            (change)="onFileSelected($event)"
            accept="image/*"
            class="file-input"
            [disabled]="isUploading"
          />
        </div>

        @if(selectedFile) {
        <div class="file-info-card">
          <div class="d-flex align-items-center">
            <div class="file-icon bg-light-success">
              <i-tabler name="file-check" class="icon-20 text-success"></i-tabler>
            </div>
            <div class="m-l-12 flex-1">
              <p class="file-name">{{ selectedFile.name }}</p>
              <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
            </div>
          </div>
        </div>
        }
      </div>
    </mat-dialog-content>

    <mat-dialog-actions class="dialog-actions">
      <button mat-stroked-button mat-dialog-close [disabled]="isUploading" class="cancel-button">
        <i-tabler name="x" class="icon-18 m-r-8"></i-tabler>
        İptal
      </button>
      <button
        mat-flat-button
        color="primary"
        (click)="uploadImage()"
        [disabled]="!selectedFile || isUploading"
        class="upload-action-button"
      >
        @if(isUploading) {
        <mat-spinner diameter="20" class="m-r-8"></mat-spinner>
        <span>Yükleniyor...</span>
        } @else {
        <i-tabler name="check" class="icon-18 m-r-8"></i-tabler>
        <span>Yükle</span>
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      ::ng-deep .mat-mdc-dialog-container {
        padding: 0 !important;
        border-radius: 16px !important;
        overflow: hidden;
      }

      .dialog-title {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
        padding: 24px 32px;
        border-bottom: 1px solid #e0e0e0;
      }

      .close-button {
        color: #718096;

        &:hover {
          background: #f5f5f5;
        }
      }

      .dialog-content {
        padding: 40px 32px !important;
        min-height: 400px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .image-preview-container {
        width: 240px;
        height: 240px;
        position: relative;
        margin-bottom: 32px;
        cursor: pointer;
        transition: transform 0.3s ease;

        &:hover {
          transform: scale(1.02);
        }

        .preview-wrapper {
          position: relative;
          width: 100%;
          height: 100%;

          .preview-image {
            width: 240px;
            height: 240px;
            object-fit: cover;
            border: 6px solid #f0f0f0;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
          }

          .preview-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
            cursor: pointer;
          }

          &:hover .preview-overlay {
            opacity: 1;
          }
        }

        .preview-placeholder {
          width: 240px;
          height: 240px;
          background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
          border: 3px dashed #667eea;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            background: linear-gradient(135deg, #eef2f7 0%, #dee2e6 100%);
            border-color: #764ba2;
            transform: scale(1.02);
          }

          .placeholder-icon {
            opacity: 0.7;
          }

          .placeholder-text {
            font-size: 16px;
            font-weight: 600;
            color: #667eea;
            margin: 0;
          }

          .placeholder-subtext {
            font-size: 12px;
            color: #718096;
            margin: 4px 0 0 0;
          }
        }
      }

      .file-input-wrapper {
        position: relative;
        display: inline-block;
      }

      .file-input {
        position: absolute;
        width: 0.1px;
        height: 0.1px;
        opacity: 0;
        overflow: hidden;
        z-index: -1;
      }

      .file-info-card {
        background: #f8f9fa;
        border: 2px solid #e0e0e0;
        border-radius: 12px;
        padding: 16px 20px;
        margin-top: 24px;
        width: 100%;
        max-width: 400px;
        transition: all 0.3s ease;

        &:hover {
          border-color: #667eea;
          background: #f0f4ff;
        }

        .file-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .file-name {
          font-size: 14px;
          font-weight: 600;
          color: #2d3748;
          margin: 0;
          word-break: break-all;
        }

        .file-size {
          font-size: 12px;
          color: #718096;
          margin: 4px 0 0 0;
        }
      }

      .dialog-actions {
        padding: 20px 32px !important;
        border-top: 1px solid #e0e0e0;
        margin: 0 !important;
        display: flex;
        justify-content: flex-end;
        gap: 12px;

        .cancel-button {
          min-width: 120px;
          height: 44px;
          font-weight: 600;
          font-size: 14px;
          border-width: 1px;
          border-color: #e0e0e0;
          color: #718096;

          &:hover:not(:disabled) {
            background: #f5f5f5;
            border-color: #d0d0d0;
          }
        }

        .upload-action-button {
          min-width: 140px;
          height: 44px;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        }
      }

      @media (max-width: 600px) {
        .dialog-title {
          padding: 20px 24px;
          font-size: 18px;
        }

        .dialog-content {
          padding: 32px 24px !important;
        }

        .image-preview-container {
          width: 200px;
          height: 200px;

          .preview-image,
          .preview-placeholder {
            width: 200px;
            height: 200px;
          }
        }

        .dialog-actions {
          padding: 16px 24px !important;
          flex-direction: column-reverse;

          button {
            width: 100%;
          }
        }
      }
    `,
  ],
})
export class UpdateProfileImageDialogComponent implements OnInit {
  selectedFile: File | null = null;
  previewImageUrl: string | null = null;
  isUploading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<UpdateProfileImageDialogComponent>,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.toastr.error('Lütfen bir resim dosyası seçin.', 'Geçersiz Dosya');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error('Dosya boyutu 5MB\'dan küçük olmalıdır.', 'Dosya Çok Büyük');
        return;
      }

      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  uploadImage(): void {
    if (!this.selectedFile) {
      return;
    }

    this.isUploading = true;

    // Convert image to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove data:image/jpeg;base64, prefix if exists
      const base64Data = base64String.includes(',') 
        ? base64String.split(',')[1] 
        : base64String;

      // Prepare request body with base64 data
      const requestBody = {
        imageData: base64Data,
        fileName: this.selectedFile!.name,
        contentType: this.selectedFile!.type
      };

      // Upload image
      this.authService.uploadProfileImage(requestBody).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Image upload error:', error);
        let errorMessage = 'Resim yüklenirken bir hata oluştu.';
        
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error && error.error.error) {
          errorMessage = error.error.error;
        } else if (error.status === 400) {
          errorMessage = 'Geçersiz dosya formatı.';
        } else if (error.status === 401) {
          errorMessage = 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
        } else if (error.status >= 500) {
          errorMessage = 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
        }

        this.toastr.error(errorMessage, 'Hata');
        return of(null);
      }),
      finalize(() => {
        this.isUploading = false;
      })
      ).subscribe((response) => {
        if (response) {
          if (response.success !== false && (response.status === 'success' || response.success === true || !response.status)) {
            this.toastr.success(response.message || 'Profil resmi başarıyla güncellendi.', 'Başarılı');
            this.dialogRef.close(true); // Close dialog and signal success
          } else {
            this.toastr.error(response.message || 'Resim yüklenirken bir hata oluştu.', 'Hata');
          }
        }
      });
    };

    reader.onerror = () => {
      this.toastr.error('Resim okunurken bir hata oluştu.', 'Hata');
      this.isUploading = false;
    };

    reader.readAsDataURL(this.selectedFile);
  }
}

