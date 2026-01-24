import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { AuthService, User, CustomFieldDetail } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { TablerIconsModule } from 'angular-tabler-icons';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { UpdateProfileImageDialogComponent } from './update-profile-image-dialog.component';
import { environment } from 'src/environments/environment';
import { handleHttpError } from 'src/app/utils/http-error-handler.util';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MaterialModule, FormsModule, ReactiveFormsModule, CommonModule, TablerIconsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  isLoading: boolean = false;
  isEditing: boolean = false;
  userProfileImage: string = '/assets/images/profile/avaatar.png';
  customFieldDetails: Map<string, string> = new Map(); // Field -> Name mapping
  customFieldVisibility: Map<string, boolean> = new Map(); // Field -> Hidden mapping

  // Düzenlenebilir alanlar için form
  profileForm = new FormGroup({
    Mail: new FormControl('', [Validators.required, Validators.email]),
    MobilePhone1: new FormControl(''),
    MobilePhone2: new FormControl(''),
    HomePhone: new FormControl(''),
    Address: new FormControl(''),
    City: new FormControl(''),
  });

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCustomFieldDetails();
    this.loadUserData();
  }

  loadUserData(): void {
    this.isLoading = true;
    this.authService.getMe().subscribe({
      next: (response) => {
        if (response && response.success && response.data) {
          this.currentUser = response.data;
          this.populateForm();
          this.updateProfileImage();
        }
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.toastr.error('Kullanıcı bilgileri yüklenirken hata oluştu.', 'Hata');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  populateForm(): void {
    if (!this.currentUser) return;

    this.profileForm.patchValue({
      Mail: this.currentUser['Mail'] || '',
      MobilePhone1: this.currentUser['MobilePhone1'] || '',
      MobilePhone2: this.currentUser['MobilePhone2'] || '',
      HomePhone: this.currentUser['HomePhone'] || '',
      Address: this.currentUser['Address'] || '',
      City: this.currentUser['City'] || '',
    });
  }

  updateProfileImage(): void {
    const pictureId = this.currentUser?.['PictureID'];
    if (pictureId) {
      this.userProfileImage = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/images/${pictureId}`;
    } else {
      this.userProfileImage = '/assets/images/profile/avaatar.png';
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Cancel editing - restore original values
      this.populateForm();
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.toastr.error('Lütfen tüm gerekli alanları doğru doldurun.', 'Hata');
      return;
    }

    this.isLoading = true;
    const formValue = this.profileForm.value;

    // Update employee profile via /api/Employees/UpdateProfile
    this.authService.updateEmployeeProfile(formValue).pipe(
      handleHttpError(this.toastr, {
        defaultMessage: 'Profil güncellenirken bir hata oluştu.',
        fallbackValue: null,
        customHandler: (error) => {
          // 400 hatası için özel mesaj
          if (error.status === 400) {
            this.toastr.error('Geçersiz veri gönderildi.', 'Hata');
          }
          // error.error.error kontrolü
          if (error.error?.error) {
            this.toastr.error(error.error.error, 'Hata');
          }
        }
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe((response) => {
      if (response) {
        // Response başarılı ise (status kontrolü veya success field'ı varsa)
        if (response.success !== false && (response.status === 'success' || response.success === true || !response.status)) {
          this.toastr.success(response.message || 'Profil başarıyla güncellendi.', 'Başarılı');
          this.isEditing = false;
          // Reload user data to get updated values
          this.loadUserData();
        } else {
          this.toastr.error(response.message || 'Profil güncellenirken bir hata oluştu.', 'Hata');
        }
      }
    });
  }

  getFieldValue(fieldName: string): string {
    return this.currentUser?.[fieldName] || '-';
  }

  getDepartmentName(): string {
    if (this.currentUser?.['EmployeeDepartments'] && this.currentUser['EmployeeDepartments'].length > 0) {
      return this.currentUser['EmployeeDepartments'][0]?.['Department']?.['DepartmentName'] || '-';
    }
    return '-';
  }

  getAccessGroupName(): string {
    if (this.currentUser?.['EmployeeAccessGroups'] && this.currentUser['EmployeeAccessGroups'].length > 0) {
      return this.currentUser['EmployeeAccessGroups'][0]?.['AccessGroup']?.['AccessGroupName'] || '-';
    }
    return '-';
  }

  getAuthorizationName(): string {
    return this.currentUser?.['WebClientAuthorization']?.['Name'] || '-';
  }

  isCafeteriaActive(): boolean {
    const status = this.currentUser?.['CafeteriaStatus'];
    // CafeteriaStatus "1" veya truthy bir değer ise aktif
    return status === '1' || status === 1 || status === true;
  }

  openUpdateImageDialog(): void {
    const dialogRef = this.dialog.open(UpdateProfileImageDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        // Resim başarıyla yüklendiyse, kullanıcı verilerini yeniden yükle
        this.loadUserData();
      }
    });
  }

  loadCustomFieldDetails(): void {
    this.authService.getCustomFieldDetails().subscribe({
      next: (response) => {
        if (response && response.status === 'success' && response.records) {
          // Map oluştur: Field -> Name ve Field -> Hidden
          // API'den gelen format: "CustomField.CustomField01"
          // HTML'de kullanılan format: "CustomField01"
          this.customFieldDetails.clear();
          this.customFieldVisibility.clear();
          
          response.records.forEach((fieldDetail: CustomFieldDetail) => {
            // "CustomField.CustomField01" -> "CustomField01" formatına çevir
            const simpleFieldName = fieldDetail.Field.replace('CustomField.CustomField', 'CustomField');
            
            // Simple field name ile mapping oluştur (CustomField01 -> Name)
            this.customFieldDetails.set(simpleFieldName, fieldDetail.Name);
            this.customFieldVisibility.set(simpleFieldName, fieldDetail.Hidden);
            
            // Orijinal field name ile de mapping oluştur (opsiyonel, yedek olarak)
            this.customFieldDetails.set(fieldDetail.Field, fieldDetail.Name);
            this.customFieldVisibility.set(fieldDetail.Field, fieldDetail.Hidden);
          });
        }
      },
      error: (error) => {
        console.error('Error loading custom field details:', error);
        // Hata durumunda sessizce devam et, custom field başlıkları field adıyla gösterilir
      }
    });
  }

  getCustomFieldName(fieldName: string): string {
    // Önce direkt eşleşmeyi kontrol et
    const apiName = this.customFieldDetails.get(fieldName);
    if (apiName) {
      return apiName;
    }
    
    // Eğer API'den gelmediyse, field adını döndür
    return fieldName;
  }

  isCustomFieldHidden(fieldName: string): boolean {
    // Hidden durumunu kontrol et, eğer bilgi yoksa false döndür (göster)
    return this.customFieldVisibility.get(fieldName) === true;
  }
}

