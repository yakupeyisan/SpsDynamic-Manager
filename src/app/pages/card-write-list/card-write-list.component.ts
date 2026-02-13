/// <reference path="../../../dom-to-image.d.ts" />
// CardWriteList Component
import { Component, OnInit, ChangeDetectorRef, ViewChild, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { catchError, map } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { TabsComponent } from 'src/app/components/tabs/tabs.component';
import { TabItemComponent } from 'src/app/components/tabs/tab-item.component';
import QRCode from 'qrcode';
import * as domtoimage from 'dom-to-image';

// Import configurations
import { joinOptions } from './card-write-list-config';
import { tableColumns } from './card-write-list-table-columns';
import { formFields, formTabs, formLoadUrl, formLoadRequest, formDataMapper } from './card-write-list-form-config';

// Import types from DataTableComponent
import { 
  DataTableComponent, 
  TableColumn, 
  ToolbarConfig, 
  GridResponse, 
  JoinOption,
  FormTab
} from 'src/app/components/data-table/data-table.component';

@Component({
  selector: 'app-card-write-list',
  standalone: true,
  imports: [
    MaterialModule, 
    CommonModule, 
    FormsModule,
    TablerIconsModule,
    TranslateModule,
    DataTableComponent,
    ModalComponent,
    TabsComponent,
    TabItemComponent
  ],
  templateUrl: './card-write-list.component.html',
  styleUrls: ['./card-write-list.component.scss']
})
export class CardWriteListComponent implements OnInit {
  @ViewChild(DataTableComponent) dataTableComponent?: DataTableComponent;
  
  // Table configuration
  tableColumns: TableColumn[] = tableColumns;
  joinOptions: JoinOption[] = joinOptions;
  
  // Preview modal state
  showPreviewModal = false;
  previewData: any[] = [];
  previewCardHtmls: SafeHtml[] = []; // Her kart için ayrı önizleme HTML (checkbox solunda göstermek için)
  previewCardImages: SafeUrl[] = []; // Onayla sonrası dom-to-image ile alınan kart görselleri (data URL, SafeUrl ile bağlanır)
  previewCardImagesRaw: string[] = []; // Yazdırma için ham data URL listesi
  previewPrintSelection: boolean[] = []; // Checkbox: hangi kartlar yazdırılacak
  previewPrintWithTemplate = false; // Şablon ile birlikte yazdır (renkleri/arka planları dahil)
  isLoadingPreview = false;
  previewActiveTabIndex = 0; // 0 = İçerik, 1 = Önizleme (İçerik varsayılan açılsın)
  previewTabEnabled = false; // Önizleme sekmesi ve Yazdır butonu Onayla'dan sonra aktif olur

  @ViewChildren('contentCaptureItem') contentCaptureItems!: QueryList<ElementRef<HTMLElement>>;
  
  // Form configuration
  formFields: TableColumn[] = formFields;
  formTabs: FormTab[] = formTabs;
  formLoadUrl = formLoadUrl;
  formLoadRequest = formLoadRequest;
  formDataMapper = formDataMapper;
  
  // Data source function for table
  tableDataSource = (params: any) => {
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/CardWriteLists`, {
      page: params.page || 1,
      limit: params.limit || 10,
      offset: ((params.page || 1) - 1) * (params.limit || 10),
      search: params.search || undefined,
      searchLogic: params.searchLogic || 'AND',
      sort: params.sort,
      join: params.join,
      showDeleted: params.showDeleted,
      columns: this.tableColumns
    }).pipe(
      map((response: GridResponse) => ({
        status: 'success' as const,
        total: response.total || (response.records ? response.records.length : 0),
        records: response.records || []
      })),
      catchError(error => {
        console.error('Error loading card write list:', error);
        return of({
          status: 'error' as const,
          total: 0,
          records: []
        } as GridResponse);
      })
    );
  };

  // Toolbar configuration
  get tableToolbarConfig(): ToolbarConfig {
    return {
      items: [
        {
          type: 'break' as const,
          id: 'break-preview'
        },
        {
          id: 'preview',
          type: 'button' as const,
          text: 'Önizleme',
          icon: 'eye',
          tooltip: 'Seçili kartların yazdırma önizlemesini göster',
          onClick: (event: MouseEvent, item: any) => this.onPreview(event, item)
        }
      ],
      show: {
        reload: true,
        columns: true,
        search: true,
        add: false,
        edit: false,
        delete: true,
        save: false
      }
    };
  }

  // Save handler
  onSave = (data: any, isEdit: boolean) => {
    const url = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/CardWriteLists/form`;
    const recid = data.Id || data.recid || null;
    const { Id, recid: _, ...record } = data;
    
    return this.http.post(url, {
      request: {
        action: 'save',
        recid: recid,
        name: isEdit ? 'EditCardWriteList' : 'AddCardWriteList',
        record: record
      }
    }).pipe(
      map((response: any) => {
        if (response.error === false || response.status === 'success') {
          this.toastr.success(this.translate.instant('common.saveSuccess'), this.translate.instant('common.success'));
          return { error: false, record: response.record || response };
        } else {
          this.toastr.error(response.message || this.translate.instant('common.saveError'), this.translate.instant('common.error'));
          return { error: true, message: response.message || this.translate.instant('common.saveError') };
        }
      }),
      catchError(error => {
        this.toastr.error(this.translate.instant('common.saveError'), this.translate.instant('common.error'));
        return of({ error: true, message: error.message || this.translate.instant('common.saveError') });
      })
    );
  };

  // Form change handler
  onFormChange = (formData: any) => {
    // Handle form data changes if needed
  };

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    public translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    // Component initialization
  }

  // Event handlers
  onTableRowClick(event: any): void {
    // Handle row click
  }

  onTableRowDblClick(event: any): void {
    // Handle row double click
  }

  onTableRowSelect(event: any): void {
    // Handle row selection
  }

  onTableRefresh(): void {
    // Handle refresh
  }

  onTableDelete(event: any): void {
    const rows = Array.isArray(event) ? event : [event];
    const selectedIds: number[] = [];
    for (const row of rows) {
      const id = row.Id ?? row.recid ?? row.id;
      if (id != null) selectedIds.push(Number(id));
    }
    if (selectedIds.length === 0) {
      this.toastr.warning(
        this.translate.instant('common.selectRowToDelete') || 'Lütfen silmek için en az bir satır seçiniz.',
        this.translate.instant('common.warning') || 'Uyarı'
      );
      return;
    }
    const msg = selectedIds.length === 1
      ? 'Seçili kayıt silinecek. Silmek için onaylıyor musunuz?'
      : `${selectedIds.length} kayıt silinecek. Silmek için onaylıyor musunuz?`;
    if (!confirm(msg)) return;

    const url = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/CardWriteLists/delete`;
    this.http.post(url, { request: { action: 'delete', recid: selectedIds } }).subscribe({
      next: (res: any) => {
        if (res?.status === 'success' || res?.error === false) {
          this.toastr.success(
            this.translate.instant('common.deleteSuccess') || 'Kayıt(lar) başarıyla silindi',
            this.translate.instant('common.success') || 'Başarılı'
          );
          this.dataTableComponent?.reload();
        } else {
          this.toastr.error(
            res?.message || this.translate.instant('common.deleteError') || 'Kayıt(lar) silinemedi',
            this.translate.instant('common.error') || 'Hata'
          );
        }
      },
      error: (err) => {
        console.error('CardWriteList delete error:', err);
        const errMsg = err?.error?.message || err?.message || this.translate.instant('common.deleteError') || 'Kayıt(lar) silinemedi';
        this.toastr.error(errMsg, this.translate.instant('common.error') || 'Hata');
      }
    });
  }

  onTableAdd(): void {
    // Handle add
  }

  onTableEdit(event: any): void {
    // Handle edit
  }

  onAdvancedFilterChange(event: any): void {
    // Handle advanced filter change
  }

  onPreview(event: MouseEvent, item: any): void {
    if (!this.dataTableComponent) {
      this.toastr.warning('DataTableComponent not found');
      return;
    }
    
    // Get selected rows
    const selectedRows = this.dataTableComponent.selectedRows;
    if (selectedRows.size === 0) {
      this.toastr.warning('Lütfen en az bir kayıt seçiniz.');
      return;
    }
    
    // Get selected records
    const selectedIds = Array.from(selectedRows);
    const dataSource = this.dataTableComponent.dataSource ? this.dataTableComponent.filteredData : this.dataTableComponent.data;
    const selectedRecords = dataSource.filter((row: any) => {
      const id = row['recid'] ?? row['Id'] ?? row['id'];
      return selectedIds.includes(id);
    });
    
    // Load preview data
    this.loadPreviewData(selectedRecords);
  }

  loadPreviewData(selectedRecords: any[]): void {
    this.isLoadingPreview = true;
    this.showPreviewModal = true;
    this.previewData = [];
    this.cdr.markForCheck();
    
    const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;
    
    // Load template and card data for each record
    const requests = selectedRecords.map(record => {
      const templateId = record['TemplateId'] || record['TemplateID'] || record['TemplateId'] || record['CardTemplate']?.Id;
      const cardId = record['CardId'] || record['CardID'] || record['Card']?.CardID || record['Card']?.CardId;
      
      // Load template
      const templateRequest = this.http.post(`${apiUrl}/api/CardTemplates/form`, {
        request: {
          action: 'get',
          recid: templateId,
          name: 'EditCardTemplate'
        }
      });
      
      // Kart verilerini api/Cards/GetForWrite adresinden al
      let cardRequest: Observable<any>;
      if (cardId) {
        cardRequest = this.http.post<any>(`${apiUrl}/api/Cards/GetForWrite`, { CardID: cardId }).pipe(
          catchError(() => of(null))
        );
      } else {
        cardRequest = of(record['Card'] || record ? { data: record['Card'] || record } : null);
      }
      
      return forkJoin({
        template: templateRequest,
        card: cardRequest
      }).pipe(
        map((result: any) => {
          const template = result.template?.record || result.template;
          const getForWriteResponse = result.card;
          if (cardId && getForWriteResponse) {
            const cardData = this.buildCardDataFromGetForWrite(getForWriteResponse);
            if (cardData) {
              return {
                ...record,
                TemplateData: template?.TemplateData ? (typeof template.TemplateData === 'string' ? JSON.parse(template.TemplateData) : template.TemplateData) : null,
                CardData: cardData
              };
            }
          }
          const card = result.card?.record || result.card?.data || record['Card'];
          const employee = card?.Employee || record['Card']?.Employee;
          
          // Extract Department from EmployeeDepartments array (like SQL STUFF query)
          let departmentName = '';
          if (employee?.EmployeeDepartments && Array.isArray(employee.EmployeeDepartments) && employee.EmployeeDepartments.length > 0) {
            const deptNames = employee.EmployeeDepartments
              .map((ed: any) => ed?.Department?.DepartmentName || ed?.Department?.Name)
              .filter(Boolean);
            departmentName = deptNames.join(', ');
          } else if (employee?.Department) {
            departmentName = employee.Department.DepartmentName || employee.Department.Name || '';
          }
          
          // Extract Faculty from nested structure
          let facultyName = '';
          if (employee?.Faculty) {
            facultyName = employee.Faculty.Name || employee.Faculty.FacultyName || '';
          }
          
          // Build FullName like SQL: Employee.Name+' '+Employee.SurName
          const fullName = employee ? `${employee.Name || ''} ${employee.SurName || ''}`.trim() : '';
          
          // Merge card and employee data into a flat structure (like PHP $data object)
          // This matches the structure from the SQL query in the old system
          // IMPORTANT: Spread employee and card first, then override with specific mappings
          // This ensures all fields are available for dynamic field access
          const cardData: any = {
            // First spread all fields from card and employee (for dynamic fields from SQL)
            ...(card || {}),
            ...(employee || {}),
            
            // Then override with specific mappings (from SQL SELECT)
            EmployeeID: employee?.EmployeeID || employee?.Id || card?.EmployeeID || '',
            PictureID: employee?.PictureID || card?.PictureID || employee?.PictureId || card?.PictureId || employee?.Picture || '',
            Name: employee?.Name || card?.Name || '',
            SurName: employee?.SurName || card?.SurName || '',
            FullName: fullName, // SQL: Employee.Name+' '+Employee.SurName as 'FullName'
            DepartmentName: departmentName, // SQL: STUFF(...) as 'DepartmentName'
            
            // Card fields
            CardID: card?.CardID || card?.CardId || record['CardId'],
            CardCode: card?.CardCode || card?.CardUID || '',
            TagCode: card?.TagCode || '',
            CardUID: card?.CardUID || '',
            CardDesc: card?.CardDesc || '',
            
            // Employee additional fields
            IdentificationNumber: employee?.IdentificationNumber || employee?.TCKimlikNo || employee?.IdentityNumber || '',
            TCKimlikNo: employee?.TCKimlikNo || employee?.IdentityNumber || employee?.IdentificationNumber || '',
            AcademicNumber: employee?.AcademicNumber || employee?.StudentNumber || employee?.StudentNo || '',
            EmployeeName: fullName,
            
            // Department and Faculty
            Department: departmentName,
            Faculty: facultyName,
            FacultyName: facultyName,
            
            // PersonInfo fields (from Card)
            PersonInfo01: card?.PersonInfo01 || '',
            PersonInfo02: card?.PersonInfo02 || '',
            PersonInfo03: card?.PersonInfo03 || '',
            PersonInfo04: card?.PersonInfo04 || '',
            PersonInfo05: card?.PersonInfo05 || '',
            PersonInfo06: card?.PersonInfo06 || '',
            PersonInfo07: card?.PersonInfo07 || '',
            PersonInfo08: card?.PersonInfo08 || '',
            PersonInfo09: card?.PersonInfo09 || '',
            PersonInfo10: card?.PersonInfo10 || ''
          };
          
          // Flatten nested objects (like Employee.EmployeeDepartments[0].Department.DepartmentName -> DepartmentName)
          // This ensures all nested data is accessible at root level
          if (employee?.EmployeeDepartments && Array.isArray(employee.EmployeeDepartments) && employee.EmployeeDepartments.length > 0) {
            employee.EmployeeDepartments.forEach((ed: any, index: number) => {
              if (ed?.Department) {
                Object.keys(ed.Department).forEach(key => {
                  if (!cardData[key] || index === 0) {
                    cardData[key] = ed.Department[key];
                  }
                });
              }
            });
          }
          
          // Flatten other nested structures
          if (employee?.Faculty) {
            Object.keys(employee.Faculty).forEach(key => {
              if (!cardData[key]) {
                cardData[key] = employee.Faculty[key];
              }
            });
          }
          
          if (card?.CafeteriaGroup) {
            Object.keys(card.CafeteriaGroup).forEach(key => {
              if (!cardData[key]) {
                cardData[key] = card.CafeteriaGroup[key];
              }
            });
          }
          
          // Flatten EmployeeCustomFields (like SQL LEFT JOIN EmployeeCustomFields)
          // EmployeeCustomFields can be an object or array
          if (employee?.EmployeeCustomFields) {
            if (Array.isArray(employee.EmployeeCustomFields) && employee.EmployeeCustomFields.length > 0) {
              // If it's an array, take the first one (should be only one per employee)
              const customFields = employee.EmployeeCustomFields[0];
              Object.keys(customFields).forEach(key => {
                if (key !== 'EmployeeID' && key !== 'Id') {
                  cardData[key] = customFields[key];
                }
              });
            } else if (typeof employee.EmployeeCustomFields === 'object') {
              // If it's an object directly
              Object.keys(employee.EmployeeCustomFields).forEach(key => {
                if (key !== 'EmployeeID' && key !== 'Id') {
                  cardData[key] = employee.EmployeeCustomFields[key];
                }
              });
            }
          }
          
          // Also check for CustomField object (alternative structure)
          if (employee?.CustomField) {
            Object.keys(employee.CustomField).forEach(key => {
              if (key.startsWith('CustomField')) {
                cardData[key] = employee.CustomField[key];
              }
            });
          }
          
          // Debug log - show full CardData structure
          // console.log('CardData for preview:', {
          //   EmployeeID: cardData.EmployeeID,
          //   PictureID: cardData.PictureID,
          //   Name: cardData.Name,
          //   SurName: cardData.SurName,
          //   FullName: cardData.FullName,
          //   DepartmentName: cardData.DepartmentName,
          //   TagCode: cardData.TagCode,
          //   CardUID: cardData.CardUID,
          //   CustomField01: cardData.CustomField01,
          //   CustomField02: cardData.CustomField02,
          //   CustomField03: cardData.CustomField03,
          //   allKeys: Object.keys(cardData).slice(0, 50)
          // });
          
          return {
            ...record,
            TemplateData: template?.TemplateData ? (typeof template.TemplateData === 'string' ? JSON.parse(template.TemplateData) : template.TemplateData) : null,
            CardData: cardData
          };
        }),
        catchError(error => {
          console.error('Error loading preview data:', error);
          return of(null);
        })
      );
    });
    
    forkJoin(requests).subscribe({
      next: async (results) => {
        this.previewData = results.filter(r => r !== null);
        this.previewPrintSelection = this.previewData.map(() => true); // Varsayılan: hepsi seçili
        const includeBack = this.previewPrintWithTemplate;
        const htmlPromises = this.previewData.map((data) => this.buildSingleCardPreviewHtmlString(data, includeBack));
        const htmls = await Promise.all(htmlPromises);
        this.previewCardHtmls = htmls.map((h) => this.sanitizer.bypassSecurityTrustHtml(h));
        this.isLoadingPreview = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading preview:', error);
        this.toastr.error('Önizleme yüklenirken hata oluştu.');
        this.isLoadingPreview = false;
        this.showPreviewModal = false;
        this.previewCardHtmls = [];
        this.cdr.markForCheck();
      }
    });
  }

  closePreviewModal(): void {
    this.showPreviewModal = false;
    this.previewData = [];
    this.previewCardHtmls = [];
    this.previewCardImages = [];
    this.previewCardImagesRaw = [];
    this.previewPrintSelection = [];
    this.previewActiveTabIndex = 0;
    this.previewTabEnabled = false;
  }

  /** Sekme değişince: Önizleme pasifken Önizleme'ye, Onayla sonrası İçerik pasifken İçerik'e geçiş engellenir */
  onPreviewTabChange(index: number): void {
    if (index === 1 && !this.previewTabEnabled) return;
    if (index === 0 && this.previewTabEnabled) return;
    this.previewActiveTabIndex = index;
    this.cdr.markForCheck();
  }

  /** Footer veya İçerik tabındaki Onayla: kart içeriğini dom-to-image ile resme çevirir, Önizleme tabındaki listeyi sıfırlayıp yeniden ekler */
  async onConfirmPreview(): Promise<void> {
    if (!this.previewData.length) {
      this.toastr.warning('Önizlenecek kart bulunamadı.');
      return;
    }
    const items = this.contentCaptureItems?.toArray();
    if (!items || items.length === 0) {
      this.toastr.warning('Kart içeriği henüz yüklenmedi. Lütfen kısa süre sonra tekrar deneyin.');
      return;
    }
    try {
      this.toastr.info('Kartlar resme dönüştürülüyor...');
      // Önizleme tabındaki kart listesini sıfırla: görselleri temizle
      this.previewCardImages = [];
      this.cdr.detectChanges();
      await new Promise<void>(r => setTimeout(r, 300));

      // Cross-origin resimleri klondan çıkar (fallback: fetch başarısız olursa tainted canvas önlenir)
      const filterExternalImages = (node: Node): boolean => {
        if (node.nodeType !== Node.ELEMENT_NODE) return true;
        const el = node as HTMLElement;
        if (el.tagName === 'IMG') {
          const src = (el as HTMLImageElement).src || '';
          if (src.startsWith('http://') || src.startsWith('https://')) {
            try {
              if (new URL(src).origin !== window.location.origin) return false;
            } catch {
              return false;
            }
          }
        }
        return true;
      };

      const dataUrls: SafeUrl[] = [];
      const rawUrls: string[] = [];
      for (let i = 0; i < items.length; i++) {
        const el = items[i].nativeElement;
        try {
          await this.inlineExternalImagesInElement(el);
          const dataUrl = await domtoimage.toPng(el, {
            quality: 1,
            bgcolor: '#ffffff',
            cacheBust: true,
            style: { transform: 'scale(1)' }
          });
          rawUrls.push(dataUrl);
          dataUrls.push(this.sanitizer.bypassSecurityTrustUrl(dataUrl));
        } catch (err) {
          console.warn('dom-to-image failed for card', i, err);
          try {
            const dataUrl = await domtoimage.toPng(el, {
              quality: 1,
              bgcolor: '#ffffff',
              cacheBust: true,
              filter: filterExternalImages,
              style: { transform: 'scale(1)' }
            });
            rawUrls.push(dataUrl);
            dataUrls.push(this.sanitizer.bypassSecurityTrustUrl(dataUrl));
          } catch (err2) {
            const placeholder = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect fill="#f0f0f0" width="200" height="100"/><text x="50%" y="50%" fill="#999" text-anchor="middle" dy=".3em" font-size="12">Resim alınamadı</text></svg>');
            rawUrls.push(placeholder);
            dataUrls.push(this.sanitizer.bypassSecurityTrustUrl(placeholder));
          }
        }
      }
      this.previewCardImagesRaw = rawUrls;
      this.previewCardImages = dataUrls;
      this.previewTabEnabled = true;
      this.previewActiveTabIndex = 1; // Önizleme tabına geç
      this.cdr.markForCheck();
      this.toastr.success('Önizleme hazır. Önizleme sekmesine geçildi.');
    } catch (error) {
      console.error('onConfirmPreview error:', error);
      this.toastr.error('Kartlar resme dönüştürülürken hata oluştu.');
    }
  }

  /**
   * Element içindeki harici (http/https) img src'leri fetch ile data URL'ye çevirir.
   * Böylece dom-to-image capture'da kişi fotoğrafı da dahil olur (sunucu CORS izin veriyorsa).
   */
  private async inlineExternalImagesInElement(el: HTMLElement): Promise<void> {
    const imgs = Array.from(el.querySelectorAll<HTMLImageElement>('img[src^="http://"], img[src^="https://"]'));
    const promises: Promise<void>[] = [];
    for (const img of imgs) {
      const src = img.src;
      try {
        const dataUrl = await this.fetchAsDataUrl(src);
        if (dataUrl) {
          promises.push(new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = dataUrl;
            if (img.complete) resolve();
          }));
        }
      } catch {
        // Fetch başarısız (CORS vb.) – bu img olduğu gibi kalır, capture'da filter ile çıkarılır
      }
    }
    await Promise.all(promises);
  }

  private fetchAsDataUrl(url: string): Promise<string | null> {
    return fetch(url, { mode: 'cors', credentials: 'omit' })
      .then(r => (r.ok ? r.blob() : Promise.reject(new Error('fetch failed'))))
      .then(blob => new Promise<string | null>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      }));
  }

  /** GetForWrite yanıtından CardData oluşturur */
  private buildCardDataFromGetForWrite(response: any): any {
    const data = response?.data || response?.record || response;
    if (!data) return null;
    const card = data;
    const employee = data.Employee || {};
    const fullName = employee ? `${employee.Name || ''} ${employee.SurName || ''}`.trim() : '';
    let departmentName = '';
    if (employee?.EmployeeDepartments && Array.isArray(employee.EmployeeDepartments) && employee.EmployeeDepartments.length > 0) {
      departmentName = employee.EmployeeDepartments.map((ed: any) => ed?.Department?.DepartmentName || ed?.Department?.Name).filter(Boolean).join(', ') || '';
    }
    let facultyName = employee?.Faculty?.Name || employee?.Faculty?.FacultyName || '';

    const cardData: any = {
      ...(card || {}),
      ...(employee || {}),
      Employee: employee,
      EmployeeID: employee?.EmployeeID || employee?.Id || card?.EmployeeID || '',
      PictureID: employee?.PictureID || card?.PictureID || employee?.PictureId || card?.PictureId || '',
      Name: employee?.Name || card?.Name || '',
      SurName: employee?.SurName || card?.SurName || '',
      FullName: fullName,
      DepartmentName: departmentName,
      CardID: card?.CardID || card?.CardId,
      CardCode: card?.CardCode || card?.CardUID || '',
      TagCode: card?.TagCode || '',
      CardUID: card?.CardUID || '',
      CardDesc: card?.CardDesc || '',
      IdentificationNumber: employee?.IdentificationNumber || '',
      EmployeeName: fullName,
      Department: departmentName,
      Faculty: facultyName,
      FacultyName: facultyName
    };
    if (employee?.Company) {
      const comp = employee.Company;
      const companyName = comp.PdksCompanyName ?? comp.CompanyName ?? comp.Name ?? '';
      Object.assign(cardData, { Company: comp, PdksCompanyName: companyName, CompanyName: companyName });
    }
    if (employee?.CustomField) {
      Object.keys(employee.CustomField).forEach((k: string) => {
        if (k.startsWith('CustomField')) cardData[k] = employee.CustomField[k];
      });
    }
    if (employee?.EmployeeCustomFields) {
      const cf = Array.isArray(employee.EmployeeCustomFields) && employee.EmployeeCustomFields.length > 0
        ? employee.EmployeeCustomFields[0]
        : employee.EmployeeCustomFields;
      if (cf && typeof cf === 'object') {
        Object.keys(cf).forEach((k: string) => {
          if (k.startsWith('CustomField') && k !== 'EmployeeID' && k !== 'Id') {
            cardData[k] = cf[k];
          }
        });
      }
    }
    ['PersonInfo01', 'PersonInfo02', 'PersonInfo03', 'PersonInfo04', 'PersonInfo05', 'PersonInfo06', 'PersonInfo07', 'PersonInfo08', 'PersonInfo09', 'PersonInfo10'].forEach((p) => {
      if (card?.[p] !== undefined) cardData[p] = card[p];
    });
    return cardData;
  }

  /** Checkbox: Tüm kartları yazdırma için seç / kaldır */
  selectAllPreviewPrint(checked: boolean): void {
    this.previewPrintSelection = this.previewData.map(() => checked);
    this.cdr.markForCheck();
  }

  /** Tek bir kartın yazdırma seçimini değiştir */
  onPreviewPrintSelect(index: number, checked: boolean): void {
    if (index >= 0 && index < this.previewPrintSelection.length) {
      this.previewPrintSelection[index] = checked;
      this.cdr.markForCheck();
    }
  }

  /** Tüm kartlar yazdırma için seçili mi (Tümünü seç kutusu) */
  get allPreviewPrintSelected(): boolean {
    return this.previewData.length > 0 &&
      this.previewPrintSelection.length === this.previewData.length &&
      this.previewPrintSelection.every((b) => b);
  }

  /** En az bir kart yazdırma için seçili mi (Yazdır butonu aktif) */
  get hasAnyPreviewPrintSelected(): boolean {
    return this.previewPrintSelection.some((b) => b);
  }

  /** Seçili kartların resim listesini yazdır (Önizleme sekmesindeki yakalanan görseller) */
  printSelectedPreview(): void {
    const selectedIndices = this.previewPrintSelection
      .map((checked, i) => (checked ? i : -1))
      .filter((i) => i >= 0);
    if (selectedIndices.length === 0) {
      this.toastr.warning('Yazdırmak için en az bir kart seçin.');
      return;
    }
    if (!this.previewCardImagesRaw.length || selectedIndices.some((i) => !this.previewCardImagesRaw[i])) {
      this.toastr.warning('Yazdırılacak resim bulunamadı. Önce Onayla ile önizleme oluşturun.');
      return;
    }
    const printHtml = this.buildPrintHtmlFromImages(
      selectedIndices.map((i) => this.previewCardImagesRaw[i])
    );
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      this.toastr.error('Yazdırma penceresi açılamadı. Pop-up engelleyicisini kapatıp tekrar deneyin.');
      return;
    }
    printWindow.document.write(printHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  }

  /** Yazdırma için sadece resim listesinden HTML üretir (her resim bir sayfa) */
  private buildPrintHtmlFromImages(imageDataUrls: string[]): string {
    if (!imageDataUrls?.length) return '';
    let html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Kart Yazdır</title>';
    html += '<style>body{margin:0;padding:0;} .print-page{page-break-after:always;display:flex;justify-content:center;align-items:center;min-height:100vh;box-sizing:border-box;} .print-page:last-child{page-break-after:auto;} .print-page img{max-width:100%;max-height:100vh;object-fit:contain;}</style></head><body>';
    for (const dataUrl of imageDataUrls) {
      html += '<div class="print-page"><img src="' + dataUrl.replace(/"/g, '&quot;') + '" alt="Kart" /></div>';
    }
    html += '</body></html>';
    return html;
  }

  /**
   * Yazdırma için HTML: Her kart için önce ön yüz (sayfa), sonra arka yüz (sayfa).
   * Önlü arkalı yazdırmada yazıcıda "çift taraflı" seçilince doğru sırada basılır.
   */
  private async buildPrintHtmlString(selectedData: any[]): Promise<string> {
    if (!selectedData || selectedData.length === 0) return '';
    const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;
    let html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Kart Yazdır</title>';
    html += '<style>body{ margin:0; padding:10px; font-family:\'Open Sans\',sans-serif; }';
    html += '.print-page{ page-break-after:always; display:flex; justify-content:center; align-items:center; min-height:100vh; box-sizing:border-box; }';
    html += '.print-page:last-child{ page-break-after:auto; }';
    if (this.previewPrintWithTemplate) {
      html += '*{ -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }';
    }
    html += '</style></head><body>';
    for (const data of selectedData) {
      if (!data.TemplateData) continue;
      if (data.TemplateData.FRONT) {
        html += '<div class="print-page">' + (await this.buildCardSideHtml(data, 'FRONT', apiUrl)) + '</div>';
      }
      if (data.TemplateData.BACK) {
        html += '<div class="print-page">' + (await this.buildCardSideHtml(data, 'BACK', apiUrl)) + '</div>';
      }
    }
    html += '</body></html>';
    return html;
  }

  /** Tek yüz (FRONT veya BACK) HTML üretir; önizleme ve yazdırma için ortak. imageBaseUrl boş verilirse resimler göreli (/images/...) olur, proxy ile aynı origin olur. */
  private async buildCardSideHtml(data: any, side: 'FRONT' | 'BACK', apiUrl: string, imageBaseUrl?: string): Promise<string> {
    const face = data.TemplateData[side];
    if (!face) return '';
    const bgStyle = face.background && face.background !== 'transparent'
      ? `background: url('${face.background}'); background-repeat: no-repeat; background-size: cover;`
      : 'background: white;';
    let html = `<div class="preview-card-${side.toLowerCase()}" data-type="${side}" style="position: relative; width: ${face.width}; height: ${face.height}; ${bgStyle} border: 1px solid #6C757D; border-radius: 4px; box-sizing: border-box;">`;
    const items = face.items ? (Array.isArray(face.items) ? face.items : Object.values(face.items)) : [];
    for (const item of items) {
      if (item.type === 'fix') {
        const fixText = this.textTransform(item.field || '', item.textTransform);
        html += `<label style="position: absolute; color: ${item.color || '#000'}; font-size: ${item.fontsize || 12}mm; font-family: ${item.fontFamily || 'Arial'}; font-weight: ${item.fontWeight || '400'}; line-height: ${(item.fontsize || 12) + 2}mm; top: ${(item.top || 0) + 1}mm; left: ${(item.left || 0) + 1}mm; width: ${item.lwidth || '50'}mm; text-align: ${item.textAlign || 'left'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${fixText}</label>`;
      } else if (item.type === 'label' && item.field) {
        const field = item.field.split('-')[0];
        let value = '';
        if (data.CardData && data.CardData[field] !== undefined && data.CardData[field] !== null) {
          value = this.valueToDisplayString(data.CardData[field]);
        } else {
          value = this.getFieldValue(data.CardData, field);
        }
        html += `<label style="position: absolute; color: ${item.color || '#000'}; font-size: ${item.fontsize || 12}mm; font-family: ${item.fontFamily || 'Arial'}; font-weight: ${item.fontWeight || '400'}; line-height: ${(item.fontsize || 12) + 2}mm; top: ${(item.top || 0) + 1}mm; left: ${(item.left || 0) + 1}mm; width: ${item.lwidth || '50'}mm; text-align: ${item.textAlign || 'left'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${this.textTransform(value, item.textTransform)}</label>`;
      } else if (item.type === 'image' && item.field) {
        const field = item.field.split('-')[0];
        let pictureId: string = '';
        if (data.CardData && data.CardData[field] !== undefined && data.CardData[field] !== null) {
          const v = data.CardData[field];
          pictureId = typeof v === 'object' ? '' : String(v).trim();
        } else if (data.CardData && data.CardData.PictureID !== undefined && data.CardData.PictureID !== null) {
          pictureId = String(data.CardData.PictureID).trim();
        } else {
          const fv = this.getFieldValue(data.CardData, 'PictureID') || this.getFieldValue(data.CardData, 'PictureId');
          pictureId = (fv && String(fv).trim()) || '';
        }
        const avatarUrl = '/assets/images/profile/avaatar.png';
        const base = imageBaseUrl !== undefined ? imageBaseUrl : apiUrl;
        const hasPictureId = pictureId !== '' && pictureId !== 'null' && pictureId !== 'undefined';
        const imageUrl = hasPictureId ? `${base}/images/${pictureId}?v=${Date.now()}` : avatarUrl;
        html += `<img src="${imageUrl}" style="position: absolute; top: ${(item.top || 0) + 1}mm; left: ${(item.left || 0) + 1}mm; width: ${item.width || '20mm'}; height: ${item.height || '20mm'}; border-radius: ${item.borderRadius || '0'}; object-fit: ${item.objectFit || 'cover'};" onerror="this.src='${avatarUrl}'" />`;
      } else if (item.type === 'imagefix' && item.src) {
        html += `<img src="${item.src}" style="position: absolute; top: ${(item.top || 0) + 1}mm; left: ${(item.left || 0) + 1}mm; width: ${item.width || '20mm'}; height: ${item.height || '20mm'}; border-radius: ${item.borderRadius || '0'}; object-fit: ${item.objectFit || 'cover'};" />`;
      } else if (item.type === 'barcode' && item.field) {
        const field = item.field.split('-')[0];
        const value = this.getFieldValue(data.CardData, field) || field;
        const textToEncode = (value || ' ').toString().trim() || ' ';
        try {
          const qrDataUrl = await QRCode.toDataURL(textToEncode, { margin: 1, width: 200, errorCorrectionLevel: 'M' });
          html += `<img src="${qrDataUrl}" alt="QR" style="position: absolute; top: ${(item.top || 0) + 1}mm; left: ${(item.left || 0) + 1}mm; width: ${item.width || '20mm'}; height: ${item.height || '20mm'}; object-fit: contain;" />`;
        } catch {
          html += `<div style="position: absolute; top: ${(item.top || 0) + 1}mm; left: ${(item.left || 0) + 1}mm; width: ${item.width || '20mm'}; height: ${item.height || '20mm'}; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #999; background: white;">QR: ${textToEncode}</div>`;
        }
      }
    }
    html += '</div>';
    return html;
  }

  /** Tek kart satırı için önizleme HTML string. includeBack true ise (Şablon ile birlikte yazdır) arka şablon da eklenir. */
  private async buildSingleCardPreviewHtmlString(data: any, includeBack?: boolean): Promise<string> {
    if (!data?.TemplateData) return '';
    const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;
    const imageBase = ''; // göreli /images/xxx → proxy ile aynı origin, kişi resmi yüklenir
    let html = '<div class="preview-row">';
    if (data.TemplateData.FRONT) {
      html += await this.buildCardSideHtml(data, 'FRONT', apiUrl, imageBase);
    }
    if (includeBack && data.TemplateData.BACK) {
      html += await this.buildCardSideHtml(data, 'BACK', apiUrl, imageBase);
    }
    html += '</div>';
    return html;
  }

  /** Şablon ile birlikte yazdır kutusu değişince kart HTML'lerini (arka şablon dahil/hariç) yeniden oluşturur */
  async onPreviewPrintWithTemplateChange(): Promise<void> {
    if (!this.previewData.length) return;
    const includeBack = this.previewPrintWithTemplate;
    const htmlPromises = this.previewData.map((data) => this.buildSingleCardPreviewHtmlString(data, includeBack));
    const htmls = await Promise.all(htmlPromises);
    this.previewCardHtmls = htmls.map((h) => this.sanitizer.bypassSecurityTrustHtml(h));
    this.cdr.markForCheck();
  }

  /** Obje değerlerinden (Company, Department vb.) görüntülenecek metni çıkarır */
  private valueToDisplayString(val: any): string {
    if (val === undefined || val === null) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    if (typeof val === 'object') {
      return (val.PdksCompanyName ?? val.CompanyName ?? val.DepartmentName ?? val.FacultyName ?? val.Name ?? val.Text ?? '') || '';
    }
    return '';
  }

  /**
   * Get field value from CardData, supporting nested fields
   * Matches PHP: $data->{$field}
   */
  getFieldValue(cardData: any, field: string): string {
    if (!cardData || !field) {
      console.warn(`getFieldValue: Missing cardData or field. cardData: ${!!cardData}, field: ${field}`);
      return '';
    }
    
    // Direct field access (like PHP $data->{$field})
    if (cardData[field] !== undefined && cardData[field] !== null) {
      return this.valueToDisplayString(cardData[field]);
    }
    
    // Special handling for FullName (SQL computed field)
    if (field === 'FullName') {
      const fullName = cardData.FullName || 
                      (cardData.Name && cardData.SurName ? `${cardData.Name} ${cardData.SurName}`.trim() : '') ||
                      cardData.EmployeeName || '';
      if (fullName) return fullName;
    }
    
    // Nested field access (e.g., Employee.Name)
    if (field.includes('.')) {
      const parts = field.split('.');
      let value = cardData;
      for (const part of parts) {
        if (value && typeof value === 'object') {
          value = value[part];
        } else {
          return '';
        }
      }
      return value !== undefined && value !== null ? this.valueToDisplayString(value) : '';
    }
    
    // Try common field name variations
    const variations = [
      field,
      field.charAt(0).toUpperCase() + field.slice(1),
      field.toLowerCase(),
      field.toUpperCase()
    ];
    
    for (const variant of variations) {
      if (cardData[variant] !== undefined && cardData[variant] !== null) {
        return this.valueToDisplayString(cardData[variant]);
      }
    }
    
    // Try nested Employee fields
    if (cardData.Employee) {
      for (const variant of variations) {
        if (cardData.Employee[variant] !== undefined && cardData.Employee[variant] !== null) {
          return this.valueToDisplayString(cardData.Employee[variant]);
        }
      }
    }
    
    // Try Department nested field
    if (field === 'Department' || field === 'DepartmentName') {
      // Already flattened in cardData
      if (cardData.Department) return cardData.Department;
      if (cardData.DepartmentName) return cardData.DepartmentName;
      // Try nested Employee structure
      if (cardData.Employee?.EmployeeDepartments && Array.isArray(cardData.Employee.EmployeeDepartments) && cardData.Employee.EmployeeDepartments.length > 0) {
        const dept = cardData.Employee.EmployeeDepartments[0]?.Department;
        if (dept?.DepartmentName) return dept.DepartmentName;
        if (dept?.Name) return dept.Name;
      }
      if (cardData.Employee?.Department?.Name) return cardData.Employee.Department.Name;
      if (cardData.Employee?.Department?.DepartmentName) return cardData.Employee.Department.DepartmentName;
    }
    
    // Try Faculty nested field
    if (field === 'Faculty' || field === 'FacultyName') {
      // Already flattened in cardData
      if (cardData.Faculty) return cardData.Faculty;
      if (cardData.FacultyName) return cardData.FacultyName;
      // Try nested Employee structure
      if (cardData.Employee?.Faculty?.Name) return cardData.Employee.Faculty.Name;
      if (cardData.Employee?.Faculty?.FacultyName) return cardData.Employee.Faculty.FacultyName;
    }
    
    // Try AcademicNumber/StudentNumber
    if (field === 'AcademicNumber' || field === 'StudentNumber' || field === 'StudentNo') {
      if (cardData.AcademicNumber) return cardData.AcademicNumber;
      if (cardData.StudentNumber) return cardData.StudentNumber;
      if (cardData.StudentNo) return cardData.StudentNo;
    }
    
    // Try TCKimlikNo/IdentityNumber/IdentificationNumber
    if (field === 'TCKimlikNo' || field === 'IdentityNumber' || field === 'IdentificationNumber') {
      if (cardData.TCKimlikNo) return cardData.TCKimlikNo;
      if (cardData.IdentityNumber) return cardData.IdentityNumber;
      if (cardData.IdentificationNumber) return cardData.IdentificationNumber;
    }
    
    return '';
  }

  textTransform(value: any, transform?: string): string {
    if (!value) return '';
    const str = String(value);
    
    if (!transform) return str;
    
    switch (transform.toLowerCase()) {
      case 'uppercase':
        return str.toUpperCase();
      case 'lowercase':
        return str.toLowerCase();
      case 'capitalize':
        // İlk harf + boşluk/noktadan sonraki harfler büyük (title case)
        return str
          .toLowerCase()
          .replace(/(^|[\s.]+)(\S)/g, (_, sep, char) => sep + char.toUpperCase());
      default:
        return str;
    }
  }
}
