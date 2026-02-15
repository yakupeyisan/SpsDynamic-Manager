// Employee Component - Adapted from old app.component.ts
// NOTE: This component requires DataTableComponent to be created
// The component structure is ready but DataTableComponent needs to be implemented

import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TablerIconsModule } from 'angular-tabler-icons';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { catchError, map, finalize, concatMap, toArray, tap } from 'rxjs/operators';
import { from } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { SelectComponent } from 'src/app/components/select/select.component';
import { WebSocketService } from 'src/app/services/websocket.service';
import { Subscription } from 'rxjs';

// Import configurations
import { joinOptions } from './employee-config';
import { tableColumns } from './employee-table-columns';
import { formFields, formTabs, formLoadUrl, formLoadRequest, formDataMapper, imageAsBase64Field, imageField, imagePreviewUrl } from './employee-form-config';
import * as XLSX from 'xlsx';
import { getGridColumns } from './employee-nested-grids';

// Import types from DataTableComponent
import { 
  DataTableComponent, 
  TableColumn, 
  ToolbarConfig, 
  GridResponse, 
  JoinOption,
  FormTab,
  FormTabGrid,
  ColumnType
} from 'src/app/components/data-table/data-table.component';

/** ImportXls API yanıt formatı */
export interface ExcelImportResponse {
  status?: string;
  message?: string;
  imported?: number;
  updated?: number;
  errors?: string[];
  needReview?: { row: number; employeeId: number; status?: string; reasons: string[] }[];
}

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [
    MaterialModule, 
    CommonModule,
    FormsModule,
    TablerIconsModule,
    TranslateModule,
    DataTableComponent,
    ModalComponent,
    SelectComponent
  ],
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss']
})
export class EmployeeComponent implements OnInit, OnDestroy {
  // Table configuration
  tableColumns: TableColumn[] = tableColumns;
  joinOptions: JoinOption[] = joinOptions;
  
  // Form configuration
  formFields: TableColumn[] = formFields;
  formTabs: FormTab[] = []; // Will be initialized in constructor
  formLoadUrl = formLoadUrl;
  formLoadRequest = formLoadRequest;
  formDataMapper = formDataMapper;
  imageAsBase64Field = imageAsBase64Field;
  imageField = imageField;
  imagePreviewUrl = imagePreviewUrl;
  
  // Format modal state
  showFormatModal = false;
  readers: any[] = [];
  isLoadingReaders = false;
  selectedCardIdsForFormat: number[] = [];
  selectedCardsForFormat: any[] = []; // Store selected card details
  
  // WebSocket subscriptions
  private wsMessageSubscription?: Subscription;
  private wsConnectionSubscription?: Subscription;
  
  // Format operation state
  formatStatusMessage: string = '';
  isFormatting: boolean = false;
  selectedReaderForFormat: any = null;
  
  // Close and clone modal state
  showCloseAndCloneModal = false;
  closeAndCloneCardDesc: string = '';
  closeAndCloneCardDescError: boolean = false;
  selectedCardForCloseAndClone: any = null;
  
  // Bulk Department modal state
  showBulkDepartmentModal = false;
  selectedEmployeesForDepartment: any[] = [];
  selectedDepartmentIds: number[] = [];
  isUpdatingDepartment: boolean = false;
  
  // Bulk QR Card Create modal state
  showBulkQrCardCreateModal = false;
  selectedEmployeesForQrCardCreate: any[] = [];
  isCreatingQrCards: boolean = false;
  
  // Bulk QR Card Close modal state
  showBulkQrCardCloseModal = false;
  selectedEmployeesForQrCardClose: any[] = [];
  isClosingQrCards: boolean = false;
  
  // Bulk Scoring modal state
  showBulkScoringModal = false;
  selectedEmployeesForScoring: any[] = [];
  scoringEnabled: boolean = true;
  isUpdatingScoring: boolean = false;

  // Bulk Antipassback modal state
  showBulkAntipassbackModal = false;
  selectedEmployeesForAntipassback: any[] = [];
  antipassbackEnabled: boolean = true;
  isUpdatingAntipassback: boolean = false;

  // Bulk Access Group modal state
  showBulkAccessGroupModal = false;
  selectedEmployeesForAccessGroup: any[] = [];
  selectedAccessGroupIds: number[] = [];
  isUpdatingAccessGroup: boolean = false;
  
  // Bulk Company modal state
  showBulkCompanyModal = false;
  selectedEmployeesForCompany: any[] = [];
  selectedCompanyId: number | null = null;
  isUpdatingCompany: boolean = false;
  
  // Bulk Position (Kadro) modal state
  showBulkPositionModal = false;
  selectedEmployeesForPosition: any[] = [];
  selectedPositionId: number | null = null;
  isUpdatingPosition: boolean = false;
  
  // Bulk Web Client modal state
  showBulkWebClientModal = false;
  selectedEmployeesForWebClient: any[] = [];
  webClientEnabled: boolean = false;
  selectedWebClientAuthorizationId: number | null = null;
  isUpdatingWebClient: boolean = false;
  
  // Bulk Password Reset modal state
  showBulkPasswordResetModal = false;
  selectedEmployeesForPasswordReset: any[] = [];
  isResettingPassword: boolean = false;
  
  // Bulk SMS modal state
  showBulkSmsModal = false;
  selectedEmployeesForSms: any[] = [];
  smsMessage: string = '';
  isSendingSms: boolean = false;
  
  // Bulk Mail modal state
  showBulkMailModal = false;
  selectedEmployeesForMail: any[] = [];
  mailMessage: string = '';
  mailSubject: string = '';
  isSendingMail: boolean = false;
  
  // Transfer from Visitor modal state
  showTransferFromVisitorModal = false;
  isTransferringFromVisitor = false;
  
  // Bulk Image Upload modal state
  showBulkImageUploadModal = false;
  bulkImageUploadItems: { ImageName: string; Data: string }[] = [];
  isUploadingBulkImages = false;
  isReadingBulkImageFiles = false;
  /** İstek gövdesi sunucu limitini (413) aşmaması için parça başına resim sayısı. Base64 büyük olduğu için 25–30 civarı güvenli. */
  readonly BULK_IMAGE_MAX_PER_REQUEST = 25;
  bulkImageUploadProgress = { uploaded: 0, total: 0 };
  /** Her resim için işlem sonucu: pending | success | error (sıra numarası yeşil/kırmızı) */
  bulkImageItemStatuses: ('pending' | 'success' | 'error')[] = [];
  /** Resim URL'leri önbellek kırıcı - toplu resim yükleme sonrası güncellenir */
  imageCacheBuster: number | null = null;

  // Excel import modal state
  showExcelImportModal = false;
  excelHeaders: string[] = [];
  excelRows: any[] = [];
  /** Excel sütun başlığı -> Employee/CustomField alan adı */
  excelColumnMapping: Record<string, string> = {};
  showExcelOptionsOverlay = false;
  excelOptionsOverlayLoading = false;
  /** Overlay'de gösterilecek listeler: Firma, Kadro, Departman, AccessGroup, WebClientAuthorization, Authorization */
  excelOptionsOverlayData: Record<string, { id: string | number; text: string }[]> = {};
  /** Excel grid sütunları (şablonda getter yerine kullanılır – sonsuz CD önlenir) */
  excelGridColumns: { field: string; label: string }[] = [];
  /** ui-data-table için Excel sütunları (TableColumn[]) */
  excelImportTableColumns: TableColumn[] = [];
  /** Excel import grid toolbar (sadece görüntüleme; dışarı aktar yok) */
  excelImportToolbarConfig: ToolbarConfig = {
    items: [],
    show: { reload: false, add: false, edit: false, delete: false, save: false, columns: false, export: false }
  };
  /** Eşlenebilir alan listesi (şablonda getter yerine kullanılır – sonsuz CD önlenir) */
  excelMappableFields: { value: string; label: string }[] = [];
  /** Excel alan eşlemesi select için seçenekler (Eşleme yok + excelMappableFields; etiketlere " - Kişi", " - Özel Alan", " - Kart" eklenir). */
  get excelMappingSelectOptions(): { value: string; label: string }[] {
    const empty = [{ value: '', label: '— Eşleme yok —' }];
    const withSuffix = this.excelMappableFields.map((f) => {
      const cat = this.excelFieldCategory(f.value);
      const suffix = cat === 'customfield' ? 'Özel Alan' : cat === 'card' ? 'Kart' : 'Kişi';
      return { value: f.value, label: `${f.label} - ${suffix}` };
    });
    return [...empty, ...withSuffix];
  }

  /** Alanın Excel eşleme kategorisi (dropdown etiketi için). */
  private excelFieldCategory(field: string): 'customfield' | 'card' | 'employee' {
    if (!field) return 'employee';
    if (/^CustomField\d{2}$/.test(field)) return 'customfield';
    const cardFields = this.getExcelCardGridFields().map((f) => f.value);
    if (cardFields.includes(field)) return 'card';
    return 'employee';
  }
  /** Checkbox/boolean alanları – Excel açıklamaları için (type checkbox veya boolean) */
  excelBooleanFields: { field: string; label: string }[] = [];
  readonly excelOptionsOverlayKeys = ['Firma', 'Kadro', 'Departman', 'AccessGroup', 'CafeteriaGroup', 'WebClientAuthorization', 'Authorization'] as const;
  /** Excel import: her kategori için ayrı buton (overlay’da scroll için key kullanılır) */
  readonly excelOptionsOverlayButtonConfig: { key: string; label: string }[] = [
    { key: 'Firma', label: 'Eklenebilecek Firmalar' },
    { key: 'Kadro', label: 'Eklenebilecek Kadrolar' },
    { key: 'Departman', label: 'Eklenebilecek Departmanlar' },
    { key: 'AccessGroup', label: 'Eklenebilecek Erişim Grupları' },
    { key: 'CafeteriaGroup', label: 'Eklenebilecek Kafeterya Grupları' },
    { key: 'WebClientAuthorization', label: 'Eklenebilecek Web İstemci Yetkiler' },
    { key: 'Authorization', label: 'Eklenebilecek Yetkiler' },
  ];
  /** Overlay'da sadece bu kategori gösterilir; null ise hepsi gösterilir */
  excelOptionsOverlayActiveKey: string | null = null;
  /** Excel içe aktarım: işlem devam ediyor mu */
  excelImportInProgress = false;
  /** Excel içe aktarım: ilerleme metni (örn. "50/200 kayıt gönderiliyor...") */
  excelImportProgressText = '';
  /** Chunk başına kayıt sayısı (ImportXls API'ye gönderim) */
  readonly excelImportChunkSize = 50;
  /** Excel import: listede yoksa kontrol edilecek listesine ekle (ImportXls'e gönderilir) */
  excelAddUnknownCompanyToCheck = false;
  excelAddUnknownDepartmentToCheck = false;
  excelAddUnknownKadroToCheck = false;
  excelAddUnknownAccessGroupToCheck = false;

  /** ImportXls API yanıtı: kontrol gerektiren satırlar ve hatalar (son import sonrası doldurulur) */
  excelImportResult: {
    imported: number;
    updated: number;
    errors: string[];
    needReview: { row: number; employeeId: number; status?: string; reasons: string[] }[];
  } | null = null;

  /** Overlay'da listelenecek kategoriler (tek seçimde sadece o kategori) */
  get excelOptionsOverlayKeysToShow(): string[] {
    return this.excelOptionsOverlayActiveKey
      ? [this.excelOptionsOverlayActiveKey]
      : [...this.excelOptionsOverlayKeys];
  }

  /** Overlay başlığı (tek kategori seçiliyse o kategorinin etiketi) */
  get excelOptionsOverlayTitle(): string {
    if (this.excelOptionsOverlayActiveKey) {
      const opt = this.excelOptionsOverlayButtonConfig.find((o) => o.key === this.excelOptionsOverlayActiveKey);
      return opt?.label ?? 'Eklenebilecek değerler';
    }
    return 'Eklenebilecek değerler';
  }

  // Reader status tracking
  readerStatuses: Map<string, 'connected' | 'disconnected' | 'checking'> = new Map();
  // Reader messages tracking
  readerMessages: Map<string, string> = new Map();
  
  // Data source function for table
  tableDataSource = (params: any) => {
    return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Employees`, {
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
        console.error('Error loading employees:', error);
        return of({
          status: 'error' as const,
          total: 0,
          records: []
        } as GridResponse);
      })
    );
  };

  // Transfer from Visitor modal - grid yüksekliği viewport ile sınırlı (taşma olmaz)
  transferFromVisitorGridHeight = 'calc(70vh - 140px)';

  // Transfer from Visitor modal - table columns (Kişi no, TC Kimlik No, Adı, Soyadı)
  visitorWithDeletedTableColumns: TableColumn[] = [
    { field: 'EmployeeID', label: 'Kişi No', text: 'Kişi No', type: 'int', sortable: true, width: '100px', size: '100px', searchable: 'int', resizable: true },
    { field: 'IdentificationNumber', label: 'TC Kimlik No', text: 'TC Kimlik No', type: 'text', sortable: true, width: '130px', size: '130px', searchable: 'text', resizable: true },
    { field: 'Name', label: 'Adı', text: 'Adı', type: 'text', sortable: true, width: '120px', size: '120px', searchable: 'text', resizable: true },
    { field: 'SurName', label: 'Soyadı', text: 'Soyadı', type: 'text', sortable: true, width: '120px', size: '120px', searchable: 'text', resizable: true }
  ];

  visitorWithDeletedDataSource = (params: any) => {
    return this.http.post<GridResponse>(
      `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Employees/GetAllVisitorWithDeleted`,
      {
        page: params.page || 1,
        limit: params.limit || 100,
        offset: ((params.page || 1) - 1) * (params.limit || 100),
        search: params.search || undefined,
        searchLogic: params.searchLogic || 'AND',
        sort: params.sort,
        join: params.join,
        showDeleted: params.showDeleted,
        columns: this.visitorWithDeletedTableColumns
      }
    ).pipe(
      map((response: GridResponse) => ({
        status: 'success' as const,
        total: response.total || (response.records ? response.records.length : 0),
        records: response.records || []
      })),
      catchError(error => {
        console.error('Error loading visitors with deleted:', error);
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };

  // Toolbar configuration
  get tableToolbarConfig(): ToolbarConfig {
    return {
      items: [
        {
          type: 'break' as const,
          id: 'break-operations-menu'
        },
        {
          id: 'operations-menu',
          type: 'menu' as const,
          text: this.translate.instant('toolbar.operations'),
          tooltip: this.translate.instant('toolbar.operationsTooltip'),
          items: [
            {
              id: 'transfer-from-visitor',
              text: 'Ziyaretçiden aktar',
              onClick: (event: MouseEvent, item: any) => this.openTransferFromVisitorModal()
            },
            {
              id: 'bulk-access-permission',
              text: this.translate.instant('operations.bulkAccessPermission'),
              onClick: (event: MouseEvent, item: any) => this.onBulkAccessPermission(event, item)
            },
            {
              id: 'bulk-company',
              text: this.translate.instant('operations.bulkCompany'),
              onClick: (event: MouseEvent, item: any) => this.onBulkCompany(event, item)
            },
            {
              id: 'bulk-position',
              text: this.translate.instant('operations.bulkPosition'),
              onClick: (event: MouseEvent, item: any) => this.onBulkPosition(event, item)
            },
            {
              id: 'bulk-scoring',
              text: this.translate.instant('operations.bulkScoring'),
              onClick: (event: MouseEvent, item: any) => this.onBulkScoring(event, item)
            },
            {
              id: 'bulk-antipassback',
              text: 'Toplu Antipassback Durumu Değiştir',
              onClick: (event: MouseEvent, item: any) => this.onBulkAntipassback(event, item)
            },
            {
              id: 'bulk-department',
              text: this.translate.instant('operations.bulkDepartment'),
              onClick: (event: MouseEvent, item: any) => this.onBulkDepartment(event, item)
            },
            {
              id: 'bulk-qr-card-create',
              text: this.translate.instant('operations.bulkQrCardCreate') || 'Toplu Qr Kart Oluşturma',
              onClick: (event: MouseEvent, item: any) => this.onBulkQrCardCreate(event, item)
            },
            {
              id: 'bulk-qr-card-close',
              text: this.translate.instant('operations.bulkQrCardClose') || 'Toplu Qr Kart Kapatma',
              onClick: (event: MouseEvent, item: any) => this.onBulkQrCardClose(event, item)
            },
            {
              id: 'bulk-sms',
              text: this.translate.instant('operations.bulkSms'),
              onClick: (event: MouseEvent, item: any) => this.onBulkSms(event, item)
            },
            {
              id: 'bulk-mail',
              text: this.translate.instant('operations.bulkMail'),
              onClick: (event: MouseEvent, item: any) => this.onBulkMail(event, item)
            },
            {
              id: 'import-from-excel',
              text: this.translate.instant('operations.importFromExcel'),
              onClick: (event: MouseEvent, item: any) => this.onImportFromExcel(event, item)
            },
            {
              id: 'bulk-image-upload',
              text: this.translate.instant('operations.bulkImageUpload'),
              onClick: (event: MouseEvent, item: any) => this.onBulkImageUpload(event, item)
            },
            {
              id: 'bulk-web-client',
              text: this.translate.instant('operations.bulkWebClient'),
              onClick: (event: MouseEvent, item: any) => this.onBulkWebClient(event, item)
            },
            {
              id: 'bulk-password-reset',
              text: this.translate.instant('operations.bulkPasswordReset'),
              onClick: (event: MouseEvent, item: any) => this.onBulkPasswordReset(event, item)
            },
            {
              id: 'export-to-excel',
              text: this.translate.instant('operations.exportToExcel'),
              onClick: (event: MouseEvent, item: any) => this.onExportToExcel(event, item)
            }
          ]
        }
      ],
      show: {
        reload: true,
        add: true,
        edit: true,
        delete: true,
        save: false
      }
    };
  }

  // Get grid columns function
  getGridColumns = getGridColumns;

  // Get grid dataSource function
  getGridDataSource = (gridId: string, formData: any): ((params: any) => Observable<GridResponse>) | undefined => {
    switch (gridId) {
      case 'EmployeeCardGrid':
        return (params: any) => {
          const requestBody = params;
          
          return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Cards/GetCardsByEmployeeID`, requestBody).pipe(
            map((response: GridResponse) => ({
              status: 'success' as const,
              total: response.total || (response.records ? response.records.length : 0),
              records: response.records || []
            })),
            catchError(error => {
              console.error('Error loading cards:', error);
              return of({
                status: 'error' as const,
                total: 0,
                records: []
              } as GridResponse);
            })
          );
        };
      case 'EmployeeAccessGroupReaders':
        return (params: any) => {
          const requestBody = params;
          
          if (params.AccessGroups && Array.isArray(params.AccessGroups) && params.AccessGroups.length > 0) {
            requestBody.AccessGroups = params.AccessGroups;
          }
          
          //console.log('EmployeeAccessGroupReaders API request:', requestBody);
          
          return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/AccessGroupReaders/GetReadersByAccessGroups`, requestBody).pipe(
            map((response: GridResponse) => ({
              status: 'success' as const,
              total: response.total || (response.records ? response.records.length : 0),
              records: response.records || []
            })),
            catchError(error => {
              console.error('Error loading access group readers:', error);
              return of({
                status: 'error' as const,
                total: 0,
                records: []
              } as GridResponse);
            })
          );
        };
      case 'EmployeeHistories':
        return (params: any) => {
          const requestBody = params;
          //console.log('EmployeeHistories API request:', requestBody);
          
          return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/PdksCompanyHistories/EmployeeHistories`, requestBody).pipe(
            map((response: GridResponse) => ({
              status: 'success' as const,
              total: response.total || (response.records ? response.records.length : 0),
              records: response.records || []
            })),
            catchError(error => {
              console.error('Error loading employee histories:', error);
              return of({
                status: 'error' as const,
                total: 0,
                records: []
              } as GridResponse);
            })
          );
        };
      case 'SubscriptionEvents':
        return (params: any) => {
          const requestBody = params;
          
          return this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/SubscriptionEvents/GetAllByCardTagCode`, requestBody).pipe(
            map((response: GridResponse) => ({
              status: 'success' as const,
              total: response.total || (response.records ? response.records.length : 0),
              records: response.records || []
            })),
            catchError(error => {
              console.error('Error loading subscription events:', error);
              return of({
                status: 'error' as const,
                total: 0,
                records: []
              } as GridResponse);
            })
          );
        };
      default:
        return undefined;
    }
  };

  // Save callback
  onSave = (data: any, isEdit: boolean): Observable<any> => {
    const url = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Employees/form`;
    const recid = data.EmployeeID || data.recid || null;
    const { EmployeeID, recid: _, ...record } = data;
    return this.http.post(url, {
      request: {
        action: 'save',
        recid: recid,
        name: 'EditEmployee',
        record: record
      }
    }).pipe(
      tap(() => {
        this.imageCacheBuster = Date.now();
        if (this.dataTableComponent) {
          if (typeof this.dataTableComponent.clearCache === 'function') {
            this.dataTableComponent.clearCache();
          }
        }
        this.cdr.detectChanges();
      })
    );
  };

  // Form change handler
  private previousAccessGroup: any = null;
  private previousSubscriptionCard: any = null;
  private previousCafeteriaAccount: any = null;

  @ViewChild(DataTableComponent) dataTableComponent?: DataTableComponent;
  @ViewChild('visitorTransferGrid') visitorTransferGrid?: DataTableComponent;

  onFormChange = (formData: any) => {
    //console.log('onFormChange called with formData:', formData);
    
    if (formData) {
      const currentAccessGroup = formData['AccessGroup'];
      
      if (formData.hasOwnProperty('AccessGroup')) {
        const previousStr = JSON.stringify(this.previousAccessGroup);
        const currentStr = JSON.stringify(currentAccessGroup);
        
        if (previousStr !== currentStr) {
          // console.log('AccessGroup changed:', {
          //   previous: this.previousAccessGroup,
          //   current: currentAccessGroup
          // });
          this.previousAccessGroup = currentAccessGroup;
          this.reloadNestedGrid('EmployeeAccessGroupReaders');
        }
      }
      
      if (formData.hasOwnProperty('SubscriptionCard')) {
        const currentSubscriptionCard = formData['SubscriptionCard'];
        const previousSubscriptionCard = this.previousSubscriptionCard;
        
        if (previousSubscriptionCard !== currentSubscriptionCard) {
          // console.log('SubscriptionCard changed:', {
          //   previous: previousSubscriptionCard,
          //   current: currentSubscriptionCard
          // });
          this.previousSubscriptionCard = currentSubscriptionCard;
          this.reloadNestedGrid('SubscriptionEvents');
        }
      }

      if (formData.hasOwnProperty('CafeteriaAccount')) {
        const currentCafeteriaAccount = formData['CafeteriaAccount'];
        if (this.previousCafeteriaAccount !== currentCafeteriaAccount && currentCafeteriaAccount != null) {
          // console.log('CafeteriaAccount changed:', {
          //   previous: this.previousCafeteriaAccount,
          //   current: currentCafeteriaAccount
          // });
          this.previousCafeteriaAccount = currentCafeteriaAccount;
          this.loadTotalPrice(currentCafeteriaAccount);
        }
      }
    }
  };

  // Event handlers
  onTableRowClick(event: { row: any; columnIndex?: number }) {
    //console.log('Row clicked:', event.row);
  }

  onPictureClick(event: { row: any; column: any; rowIndex: number; columnIndex: number; pictureId: string; event: MouseEvent }) {
    //console.log('Picture clicked:', event);
  }

  onTableRowSelect(rows: any[]) {
    //console.log('Rows selected:', rows);
  }

  onAdvancedFilterChange(filter: any) {
    //console.log('Advanced filter changed:', filter);
  }

  onTableRefresh() {
    //console.log('Table refresh requested');
  }

  onTableDelete(rows: any[]) {
    // Warn if nothing selected
    if (!rows || (Array.isArray(rows) && rows.length === 0)) {
      this.toastr.warning(this.translate.instant('common.selectRowToDelete'), this.translate.instant('common.warning'));
      return;
    }

    const selectedIds: number[] = [];
    const rowsArray = Array.isArray(rows) ? rows : [rows];

    rowsArray.forEach((row: any) => {
      const id = row['recid'] ?? row['EmployeeID'] ?? row['id'];
      if (id !== null && id !== undefined) {
        selectedIds.push(Number(id));
      }
    });

    if (selectedIds.length === 0) {
      this.toastr.warning(this.translate.instant('common.selectRowToDelete'), this.translate.instant('common.warning'));
      return;
    }

    const confirmMessage =
      this.translate.instant('common.deleteConfirm') ||
      'Seçili kayıtları silmek istediğinize emin misiniz?';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Employees/delete`, {
      request: {
        action: 'delete',
        recid: selectedIds
      }
    }).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.toastr.success(this.translate.instant('common.deleteSuccess'), this.translate.instant('common.success'));
          if (this.dataTableComponent) {
            this.dataTableComponent.reload();
          }
        } else {
          this.toastr.error(response.message || this.translate.instant('common.deleteError'), this.translate.instant('common.error'));
        }
      },
      error: (error) => {
        console.error('Delete error:', error);
        const errorMessage = error.error?.message || error.message || this.translate.instant('common.deleteError');
        this.toastr.error(errorMessage, this.translate.instant('common.error'));
      }
    });
  }
  
  onTableAdd() {
    //console.log('Add new record requested');
  }
  
  onTableEdit(row: any) {
    //console.log('Edit record requested:', row);
  }
  
  onTableRowDblClick(row: any) {
    //console.log('Row double-clicked:', row);
  }
  
  onTableContextMenu(event: { row: any; event: MouseEvent }) {
    event.event.preventDefault();
  }
  
  onTableColumnClick(event: { column: TableColumn; event: MouseEvent }) {
    //console.log('Column clicked:', event.column.field);
  }
  
  onTableColumnDblClick(event: { column: TableColumn; event: MouseEvent }) {
    //console.log('Column double-clicked:', event.column.field);
  }
  
  onTableColumnContextMenu(event: { column: TableColumn; event: MouseEvent }) {
    event.event.preventDefault();
  }
  
  onTableColumnResize(event: { column: TableColumn; width: number }) {
    //console.log('Column resized:', event.column.field, 'new width:', event.width);
  }
  
  onTableMouseEnter(row: any) {
    // Could show tooltip or highlight
  }
  
  onTableMouseLeave(row: any) {
    // Remove tooltip or highlight
  }
  
  onTableFocus() {
    //console.log('Table focused');
  }
  
  onTableBlur() {
    // Table blurred
  }
  
  onTableCopy(event: { text: string; event: ClipboardEvent }) {
    //console.log('Copy event:', event.text);
  }
  
  onTablePaste(event: { text: string; event: ClipboardEvent }) {
    //console.log('Paste event:', event.text);
  }

  // Bulk operation handlers
  onBulkAccessPermission(event: MouseEvent, item: any) {
    if (!this.dataTableComponent) {
      this.toastr.warning('DataTableComponent not found');
      return;
    }
    
    // Get selected rows
    const selectedRows = this.dataTableComponent.selectedRows;
    if (selectedRows.size === 0) {
      this.toastr.warning('Lütfen en az bir çalışan seçiniz.');
      return;
    }
    
    // Get selected employee records
    const selectedIds = Array.from(selectedRows);
    const dataSource = this.dataTableComponent.dataSource ? this.dataTableComponent.filteredData : this.dataTableComponent.data;
    this.selectedEmployeesForAccessGroup = dataSource.filter((row: any) => {
      const rowId = row['recid'] ?? row['EmployeeID'] ?? row['id'];
      return selectedIds.includes(rowId);
    });
    
    // Reset form
    this.selectedAccessGroupIds = [];
    
    // Load access group options if not loaded
    this.loadAccessGroupOptionsIfNeeded();
    
    // Open modal
    this.showBulkAccessGroupModal = true;
  }

  onBulkCompany(event: MouseEvent, item: any) {
    if (!this.dataTableComponent) {
      this.toastr.warning('DataTableComponent not found');
      return;
    }
    
    // Get selected rows
    const selectedRows = this.dataTableComponent.selectedRows;
    if (selectedRows.size === 0) {
      this.toastr.warning('Lütfen en az bir çalışan seçiniz.');
      return;
    }
    
    // Get selected employee records
    const selectedIds = Array.from(selectedRows);
    const dataSource = this.dataTableComponent.dataSource ? this.dataTableComponent.filteredData : this.dataTableComponent.data;
    this.selectedEmployeesForCompany = dataSource.filter((row: any) => {
      const id = row['recid'] ?? row['EmployeeID'] ?? row['id'];
      return selectedIds.includes(id);
    });
    
    // Reset form
    this.selectedCompanyId = null;
    
    // Load company options if not loaded
    this.loadCompanyOptionsIfNeeded();
    
    // Open modal
    this.showBulkCompanyModal = true;
  }

  onBulkPosition(event: MouseEvent, item: any) {
    if (!this.dataTableComponent) {
      this.toastr.warning('DataTableComponent not found');
      return;
    }
    
    // Get selected rows
    const selectedRows = this.dataTableComponent.selectedRows;
    if (selectedRows.size === 0) {
      this.toastr.warning('Lütfen en az bir çalışan seçiniz.');
      return;
    }
    
    // Get selected employee records
    const selectedIds = Array.from(selectedRows);
    const dataSource = this.dataTableComponent.dataSource ? this.dataTableComponent.filteredData : this.dataTableComponent.data;
    this.selectedEmployeesForPosition = dataSource.filter((row: any) => {
      const id = row['recid'] ?? row['EmployeeID'] ?? row['id'];
      return selectedIds.includes(id);
    });
    
    // Reset form
    this.selectedPositionId = null;
    
    // Load position options if not loaded
    this.loadPositionOptionsIfNeeded();
    
    // Open modal
    this.showBulkPositionModal = true;
  }

  onBulkScoring(event: MouseEvent, item: any) {
    if (!this.dataTableComponent) {
      this.toastr.warning('DataTableComponent not found');
      return;
    }

    const selectedRows = this.dataTableComponent.selectedRows;
    if (selectedRows.size === 0) {
      this.toastr.warning('Lütfen en az bir çalışan seçiniz.');
      return;
    }

    const selectedIds = Array.from(selectedRows);
    const dataSource = this.dataTableComponent.dataSource ? this.dataTableComponent.filteredData : this.dataTableComponent.data;
    this.selectedEmployeesForScoring = dataSource.filter((row: any) => {
      const id = row['recid'] ?? row['EmployeeID'] ?? row['id'];
      return selectedIds.includes(id);
    });

    this.scoringEnabled = true;

    this.showBulkScoringModal = true;
  }

  onBulkAntipassback(event: MouseEvent, item: any) {
    if (!this.dataTableComponent) {
      this.toastr.warning('DataTableComponent not found');
      return;
    }

    const selectedRows = this.dataTableComponent.selectedRows;
    if (selectedRows.size === 0) {
      this.toastr.warning('Lütfen en az bir çalışan seçiniz.');
      return;
    }

    const selectedIds = Array.from(selectedRows);
    const dataSource = this.dataTableComponent.dataSource ? this.dataTableComponent.filteredData : this.dataTableComponent.data;
    this.selectedEmployeesForAntipassback = dataSource.filter((row: any) => {
      const id = row['recid'] ?? row['EmployeeID'] ?? row['id'];
      return selectedIds.includes(id);
    });

    this.antipassbackEnabled = true;
    this.showBulkAntipassbackModal = true;
  }

  onBulkDepartment(event: MouseEvent, item: any) {
    if (!this.dataTableComponent) {
      this.toastr.warning('DataTableComponent not found');
      return;
    }
    
    // Get selected rows
    const selectedRows = this.dataTableComponent.selectedRows;
    if (selectedRows.size === 0) {
      this.toastr.warning('Lütfen en az bir çalışan seçiniz.');
      return;
    }
    
    // Get selected employee records
    const selectedIds = Array.from(selectedRows);
    const dataSource = this.dataTableComponent.dataSource ? this.dataTableComponent.filteredData : this.dataTableComponent.data;
    this.selectedEmployeesForDepartment = dataSource.filter((row: any) => {
      const rowId = row['recid'] ?? row['EmployeeID'] ?? row['id'];
      return selectedIds.includes(rowId);
    });
    
    // Reset form
    this.selectedDepartmentIds = [];
    
    // Load department options if not loaded
    this.loadDepartmentOptionsIfNeeded();
    
    // Open modal
    this.showBulkDepartmentModal = true;
  }
  
  onBulkQrCardCreate(event: MouseEvent, item: any) {
    if (!this.dataTableComponent) {
      this.toastr.warning('DataTableComponent not found');
      return;
    }
    
    // Get selected rows
    const selectedRows = this.dataTableComponent.selectedRows;
    if (selectedRows.size === 0) {
      this.toastr.warning('Lütfen en az bir çalışan seçiniz.');
      return;
    }
    
    // Get selected employee records
    const selectedIds = Array.from(selectedRows);
    const dataSource = this.dataTableComponent.dataSource ? this.dataTableComponent.filteredData : this.dataTableComponent.data;
    this.selectedEmployeesForQrCardCreate = dataSource.filter((row: any) => {
      const rowId = row['recid'] ?? row['EmployeeID'] ?? row['id'];
      return selectedIds.includes(rowId);
    });
    
    // Open modal
    this.showBulkQrCardCreateModal = true;
  }
  
  onBulkQrCardClose(event: MouseEvent, item: any) {
    if (!this.dataTableComponent) {
      this.toastr.warning('DataTableComponent not found');
      return;
    }
    
    // Get selected rows
    const selectedRows = this.dataTableComponent.selectedRows;
    if (selectedRows.size === 0) {
      this.toastr.warning('Lütfen en az bir çalışan seçiniz.');
      return;
    }
    
    // Get selected employee records
    const selectedIds = Array.from(selectedRows);
    const dataSource = this.dataTableComponent.dataSource ? this.dataTableComponent.filteredData : this.dataTableComponent.data;
    this.selectedEmployeesForQrCardClose = dataSource.filter((row: any) => {
      const rowId = row['recid'] ?? row['EmployeeID'] ?? row['id'];
      return selectedIds.includes(rowId);
    });
    
    // Open modal
    this.showBulkQrCardCloseModal = true;
  }
  
  // Bulk Department Modal Methods
  onBulkDepartmentModalChange(show: boolean) {
    this.showBulkDepartmentModal = show;
    if (!show) {
      this.closeBulkDepartmentModal();
    }
  }

  onBulkScoringModalChange(show: boolean) {
    this.showBulkScoringModal = show;
    if (!show) {
      this.closeBulkScoringModal();
    }
  }

  onBulkAntipassbackModalChange(show: boolean) {
    this.showBulkAntipassbackModal = show;
    if (!show) {
      this.closeBulkAntipassbackModal();
    }
  }
  
  closeBulkDepartmentModal() {
    this.showBulkDepartmentModal = false;
    this.selectedEmployeesForDepartment = [];
    this.selectedDepartmentIds = [];
  }

  openTransferFromVisitorModal() {
    this.showTransferFromVisitorModal = true;
    this.cdr.markForCheck();
  }

  onTransferFromVisitorModalChange(show: boolean) {
    this.showTransferFromVisitorModal = show;
    if (!show) {
      this.closeTransferFromVisitorModal();
    }
  }

  closeTransferFromVisitorModal() {
    this.showTransferFromVisitorModal = false;
    this.cdr.markForCheck();
  }

  get visitorTransferTableToolbarConfig(): ToolbarConfig {
    return {
      items: [
        {
          id: 'transfer',
          type: 'button' as const,
          text: 'Aktar',
          icon: 'arrow-right',
          disabled: this.isTransferringFromVisitor,
          onClick: () => this.onTransferFromVisitorClick()
        }
      ],
      show: { reload: true, columns: true, search: true, add: false, edit: false, delete: false, save: false }
    };
  }

  onTransferFromVisitorClick() {
    if (!this.visitorTransferGrid) {
      this.toastr.warning('Tablo bulunamadı.');
      return;
    }
    const selectedRows = this.visitorTransferGrid.selectedRows;
    if (!selectedRows || selectedRows.size === 0) {
      this.toastr.warning('Lütfen aktarılacak ziyaretçiyi seçiniz.');
      return;
    }
    if (selectedRows.size !== 1) {
      this.toastr.warning('Lütfen tek bir ziyaretçi seçiniz.');
      return;
    }
    const dataSource = this.visitorTransferGrid.filteredData || this.visitorTransferGrid.data || [];
    const recidField = this.visitorTransferGrid.recid || 'EmployeeID';
    const selectedId = Array.from(selectedRows)[0];
    const row = dataSource.find((r: any) => {
      const rowId = r['recid'] ?? r[recidField] ?? r['id'] ?? r['_id'];
      return rowId === selectedId || String(rowId) === String(selectedId);
    });
    if (!row) {
      this.toastr.warning('Seçili kayıt bulunamadı.');
      return;
    }
    const employeeId = row['EmployeeID'] ?? row[recidField] ?? row['Id'] ?? row['id'] ?? null;
    if (employeeId == null) {
      this.toastr.warning('Kişi ID bulunamadı.');
      return;
    }
    const fullName = `${row['Name'] || ''} ${row['SurName'] || ''}`.trim() || `#${employeeId}`;
    if (!window.confirm(`${fullName} kişisi ziyaretçiden personele aktarılacaktır. Onaylıyor musunuz?`)) {
      return;
    }
    this.isTransferringFromVisitor = true;
    this.cdr.markForCheck();
    this.http.post(
      `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Employees/TransferFromVisitor`,
      { EmployeeID: employeeId }
    ).pipe(
      finalize(() => {
        this.isTransferringFromVisitor = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.toastr.success('Aktarım başarıyla tamamlandı.');
        this.visitorTransferGrid?.reload();
        if (this.dataTableComponent) {
          this.dataTableComponent.reload();
        }
      },
      error: (err) => {
        console.error('TransferFromVisitor error:', err);
        this.toastr.error(err?.error?.message || 'Aktarım sırasında bir hata oluştu.');
      }
    });
  }

  closeBulkScoringModal() {
    this.showBulkScoringModal = false;
    this.selectedEmployeesForScoring = [];
    this.scoringEnabled = true;
    this.isUpdatingScoring = false;
  }

  closeBulkAntipassbackModal() {
    this.showBulkAntipassbackModal = false;
    this.selectedEmployeesForAntipassback = [];
    this.antipassbackEnabled = true;
    this.isUpdatingAntipassback = false;
  }
  
  // Bulk QR Card Create Modal Methods
  onBulkQrCardCreateModalChange(show: boolean) {
    this.showBulkQrCardCreateModal = show;
    if (!show) {
      this.closeBulkQrCardCreateModal();
    }
  }
  
  closeBulkQrCardCreateModal() {
    this.showBulkQrCardCreateModal = false;
    this.selectedEmployeesForQrCardCreate = [];
  }
  
  onConfirmBulkQrCardCreate() {
    if (this.selectedEmployeesForQrCardCreate.length === 0) {
      this.toastr.warning('Seçili çalışan bulunamadı.');
      return;
    }
    
    this.isCreatingQrCards = true;
    
    // Get employee IDs
    const employeeIds = this.selectedEmployeesForQrCardCreate.map(emp => 
      emp['recid'] ?? emp['EmployeeID'] ?? emp['id']
    );
    
    // API call to create QR cards
    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Employees/BulkCreateQrCards`, {
      EmployeeIDs: employeeIds
    }).pipe(
      catchError(error => {
        this.isCreatingQrCards = false;
        this.cdr.markForCheck();
        const errorMessage = error?.error?.message || error?.message || 'QR kart oluşturma sırasında bir hata oluştu.';
        this.toastr.error(errorMessage);
        console.error('Error creating QR cards:', error);
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        this.isCreatingQrCards = false;
        this.cdr.markForCheck();
        this.toastr.success('QR kartlar başarıyla oluşturuldu.');
        this.closeBulkQrCardCreateModal();
        if (this.dataTableComponent) {
          this.dataTableComponent.reload();
        }
      }
    });
  }
  
  // Bulk QR Card Close Modal Methods
  onBulkQrCardCloseModalChange(show: boolean) {
    this.showBulkQrCardCloseModal = show;
    if (!show) {
      this.closeBulkQrCardCloseModal();
    }
  }
  
  closeBulkQrCardCloseModal() {
    this.showBulkQrCardCloseModal = false;
    this.selectedEmployeesForQrCardClose = [];
  }
  
  onConfirmBulkQrCardClose() {
    if (this.selectedEmployeesForQrCardClose.length === 0) {
      this.toastr.warning('Seçili çalışan bulunamadı.');
      return;
    }
    
    this.isClosingQrCards = true;
    
    // Get employee IDs
    const employeeIds = this.selectedEmployeesForQrCardClose.map(emp => 
      emp['recid'] ?? emp['EmployeeID'] ?? emp['id']
    );
    
    // API call to close QR cards
    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Employees/BulkCloseQrCards`, {
      EmployeeIDs: employeeIds
    }).pipe(
      catchError(error => {
        this.isClosingQrCards = false;
        this.cdr.markForCheck();
        const errorMessage = error?.error?.message || error?.message || 'QR kart kapatma sırasında bir hata oluştu.';
        this.toastr.error(errorMessage);
        console.error('Error closing QR cards:', error);
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        this.isClosingQrCards = false;
        this.cdr.markForCheck();
        this.toastr.success('QR kartlar başarıyla kapatıldı.');
        this.closeBulkQrCardCloseModal();
        if (this.dataTableComponent) {
          this.dataTableComponent.reload();
        }
      }
    });
  }
  
  onConfirmBulkDepartment() {
    if (!this.selectedDepartmentIds || this.selectedDepartmentIds.length === 0) {
      this.toastr.warning('Lütfen en az bir departman seçiniz.');
      return;
    }
    
    if (this.selectedEmployeesForDepartment.length === 0) {
      this.toastr.warning('Seçili çalışan bulunamadı.');
      return;
    }
    
    this.isUpdatingDepartment = true;
    
    // Get employee IDs
    const employeeIds = this.selectedEmployeesForDepartment.map(emp => 
      emp['recid'] ?? emp['EmployeeID'] ?? emp['id']
    );
    
    // API call to update departments
    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Employees/BulkUpdateDepartment`, {
      EmployeeIDs: employeeIds,
      DepartmentIDs: this.selectedDepartmentIds
    }).pipe(
      catchError(error => {
        this.isUpdatingDepartment = false;
        this.cdr.markForCheck();
        const errorMessage = error?.error?.message || error?.message || 'Departman güncelleme sırasında bir hata oluştu.';
        this.toastr.error(errorMessage);
        console.error('Error updating departments:', error);
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        this.isUpdatingDepartment = false;
        this.cdr.markForCheck();
        this.toastr.success('Departmanlar başarıyla güncellendi.');
        this.closeBulkDepartmentModal();
        if (this.dataTableComponent) {
          this.dataTableComponent.reload();
        }
      }
    });
  }
  
  onConfirmBulkScoring() {
    if (this.selectedEmployeesForScoring.length === 0) {
      this.toastr.warning('Seçili çalışan bulunamadı.');
      return;
    }

    this.isUpdatingScoring = true;

    const employeeIds = this.selectedEmployeesForScoring.map(emp =>
      emp['recid'] ?? emp['EmployeeID'] ?? emp['id']
    );

    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Employees/BulkUpdateScoring`, {
      EmployeeIDs: employeeIds,
      Scoring: this.scoringEnabled
    }).pipe(
      catchError(error => {
        this.isUpdatingScoring = false;
        this.cdr.markForCheck();
        const errorMessage = error?.error?.message || error?.message || 'Puantaj güncelleme sırasında bir hata oluştu.';
        this.toastr.error(errorMessage);
        console.error('Error updating scoring:', error);
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        this.isUpdatingScoring = false;
        this.cdr.markForCheck();
        this.toastr.success('Puantaj bilgisi başarıyla güncellendi.');
        this.closeBulkScoringModal();
        if (this.dataTableComponent) {
          this.dataTableComponent.reload();
        }
      }
    });
  }

  onConfirmBulkAntipassback() {
    if (this.selectedEmployeesForAntipassback.length === 0) {
      this.toastr.warning('Seçili çalışan bulunamadı.');
      return;
    }

    this.isUpdatingAntipassback = true;

    const employeeIds = this.selectedEmployeesForAntipassback.map(emp =>
      emp['recid'] ?? emp['EmployeeID'] ?? emp['id']
    );

    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Employees/BulkUpdateAntipassback`, {
      EmployeeIDs: employeeIds,
      Antipassback: this.antipassbackEnabled
    }).pipe(
      catchError(error => {
        this.isUpdatingAntipassback = false;
        this.cdr.markForCheck();
        const errorMessage = error?.error?.message || error?.message || 'Antipassback durumu güncelleme sırasında bir hata oluştu.';
        this.toastr.error(errorMessage);
        console.error('Error updating antipassback:', error);
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        this.isUpdatingAntipassback = false;
        this.cdr.markForCheck();
        this.toastr.success('Antipassback durumları başarıyla güncellendi.');
        this.closeBulkAntipassbackModal();
        if (this.dataTableComponent) {
          this.dataTableComponent.reload();
        }
      }
    });
  }

  // Bulk Access Group Modal Methods
  onBulkAccessGroupModalChange(show: boolean) {
    this.showBulkAccessGroupModal = show;
    if (!show) {
      this.closeBulkAccessGroupModal();
    }
  }
  
  closeBulkAccessGroupModal() {
    this.showBulkAccessGroupModal = false;
    this.selectedEmployeesForAccessGroup = [];
    this.selectedAccessGroupIds = [];
  }
  
  onConfirmBulkAccessGroup() {
    if (!this.selectedAccessGroupIds || this.selectedAccessGroupIds.length === 0) {
      this.toastr.warning('Lütfen en az bir yetki grubu seçiniz.');
      return;
    }
    
    if (this.selectedEmployeesForAccessGroup.length === 0) {
      this.toastr.warning('Seçili çalışan bulunamadı.');
      return;
    }
    
    this.isUpdatingAccessGroup = true;
    
    // Get employee IDs
    const employeeIds = this.selectedEmployeesForAccessGroup.map(emp => 
      emp['recid'] ?? emp['EmployeeID'] ?? emp['id']
    );
    
    // API call to update access groups
    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Employees/BulkUpdateAccessGroup`, {
      EmployeeIDs: employeeIds,
      AccessGroupIDs: this.selectedAccessGroupIds
    }).pipe(
      catchError(error => {
        this.isUpdatingAccessGroup = false;
        this.cdr.markForCheck();
        const errorMessage = error?.error?.message || error?.message || 'Yetki grubu güncelleme sırasında bir hata oluştu.';
        this.toastr.error(errorMessage);
        console.error('Error updating access groups:', error);
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        this.isUpdatingAccessGroup = false;
        this.cdr.markForCheck();
        this.toastr.success('Yetki grupları başarıyla güncellendi.');
        this.closeBulkAccessGroupModal();
        if (this.dataTableComponent) {
          this.dataTableComponent.reload();
        }
      }
    });
  }
  
  // Bulk Company Modal Methods
  onBulkCompanyModalChange(show: boolean) {
    this.showBulkCompanyModal = show;
    if (!show) {
      this.closeBulkCompanyModal();
    }
  }
  
  closeBulkCompanyModal() {
    this.showBulkCompanyModal = false;
    this.selectedEmployeesForCompany = [];
    this.selectedCompanyId = null;
  }
  
  onConfirmBulkCompany() {
    if (!this.selectedCompanyId) {
      this.toastr.warning('Lütfen bir firma seçiniz.');
      return;
    }
    
    if (this.selectedEmployeesForCompany.length === 0) {
      this.toastr.warning('Seçili çalışan bulunamadı.');
      return;
    }
    
    this.isUpdatingCompany = true;
    
    // Get employee IDs
    const employeeIds = this.selectedEmployeesForCompany.map(emp => 
      emp['recid'] ?? emp['EmployeeID'] ?? emp['id']
    );
    
    // API call to update companies
    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Employees/BulkUpdateCompany`, {
      EmployeeIDs: employeeIds,
      CompanyID: this.selectedCompanyId
    }).pipe(
      catchError(error => {
        this.isUpdatingCompany = false;
        this.cdr.markForCheck();
        const errorMessage = error?.error?.message || error?.message || 'Firma güncelleme sırasında bir hata oluştu.';
        this.toastr.error(errorMessage);
        console.error('Error updating companies:', error);
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        this.isUpdatingCompany = false;
        this.cdr.markForCheck();
        this.toastr.success('Firmalar başarıyla güncellendi.');
        this.closeBulkCompanyModal();
        if (this.dataTableComponent) {
          this.dataTableComponent.reload();
        }
      }
    });
  }
  
  // Bulk Position (Kadro) Modal Methods
  onBulkPositionModalChange(show: boolean) {
    this.showBulkPositionModal = show;
    if (!show) {
      this.closeBulkPositionModal();
    }
  }
  
  closeBulkPositionModal() {
    this.showBulkPositionModal = false;
    this.selectedEmployeesForPosition = [];
    this.selectedPositionId = null;
  }
  
  onConfirmBulkPosition() {
    if (!this.selectedPositionId) {
      this.toastr.warning('Lütfen bir kadro seçiniz.');
      return;
    }
    
    if (this.selectedEmployeesForPosition.length === 0) {
      this.toastr.warning('Seçili çalışan bulunamadı.');
      return;
    }
    
    this.isUpdatingPosition = true;
    
    // Get employee IDs
    const employeeIds = this.selectedEmployeesForPosition.map(emp => 
      emp['recid'] ?? emp['EmployeeID'] ?? emp['id']
    );
    
    // API call to update positions
    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Employees/BulkUpdatePosition`, {
      EmployeeIDs: employeeIds,
      PositionID: this.selectedPositionId
    }).pipe(
      catchError(error => {
        this.isUpdatingPosition = false;
        this.cdr.markForCheck();
        const errorMessage = error?.error?.message || error?.message || 'Kadro güncelleme sırasında bir hata oluştu.';
        this.toastr.error(errorMessage);
        console.error('Error updating positions:', error);
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        this.isUpdatingPosition = false;
        this.cdr.markForCheck();
        this.toastr.success('Kadrolar başarıyla güncellendi.');
        this.closeBulkPositionModal();
        if (this.dataTableComponent) {
          this.dataTableComponent.reload();
        }
      }
    });
  }
  
  // Bulk Web Client Modal Methods
  onBulkWebClientModalChange(show: boolean) {
    this.showBulkWebClientModal = show;
    if (!show) {
      this.closeBulkWebClientModal();
    }
  }
  
  closeBulkWebClientModal() {
    this.showBulkWebClientModal = false;
    this.selectedEmployeesForWebClient = [];
    this.webClientEnabled = false;
    this.selectedWebClientAuthorizationId = null;
  }
  
  onConfirmBulkWebClient() {
    if (this.selectedEmployeesForWebClient.length === 0) {
      this.toastr.warning('Seçili çalışan bulunamadı.');
      return;
    }
    
    if (this.webClientEnabled && !this.selectedWebClientAuthorizationId) {
      this.toastr.warning('Web Client erişimi açıkken yetki seçimi zorunludur.');
      return;
    }
    
    this.isUpdatingWebClient = true;
    
    // Get employee IDs
    const employeeIds = this.selectedEmployeesForWebClient.map(emp => 
      emp['recid'] ?? emp['EmployeeID'] ?? emp['id']
    );
    
    // API call to update web client access
    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Employees/BulkUpdateWebClient`, {
      EmployeeIDs: employeeIds,
      WebClient: this.webClientEnabled,
      WebClientAuthorizationId: this.webClientEnabled ? this.selectedWebClientAuthorizationId : null
    }).pipe(
      catchError(error => {
        this.isUpdatingWebClient = false;
        this.cdr.markForCheck();
        const errorMessage = error?.error?.message || error?.message || 'Web Client erişim güncelleme sırasında bir hata oluştu.';
        this.toastr.error(errorMessage);
        console.error('Error updating web client access:', error);
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        this.isUpdatingWebClient = false;
        this.cdr.markForCheck();
        this.toastr.success('Web Client erişimleri başarıyla güncellendi.');
        this.closeBulkWebClientModal();
        if (this.dataTableComponent) {
          this.dataTableComponent.reload();
        }
      }
    });
  }
  
  // Bulk Password Reset Modal Methods
  onBulkPasswordResetModalChange(show: boolean) {
    this.showBulkPasswordResetModal = show;
    if (!show) {
      this.closeBulkPasswordResetModal();
    }
  }
  
  closeBulkPasswordResetModal() {
    this.showBulkPasswordResetModal = false;
    this.selectedEmployeesForPasswordReset = [];
  }
  
  onConfirmBulkPasswordReset() {
    if (this.selectedEmployeesForPasswordReset.length === 0) {
      this.toastr.warning('Seçili çalışan bulunamadı.');
      return;
    }
    
    this.isResettingPassword = true;
    
    // Get employee IDs
    const employeeIds = this.selectedEmployeesForPasswordReset.map(emp => 
      emp['recid'] ?? emp['EmployeeID'] ?? emp['id']
    );
    
    // API call to reset passwords
    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Employees/BulkResetPassword`, {
      EmployeeIDs: employeeIds
    }).pipe(
      catchError(error => {
        this.isResettingPassword = false;
        this.cdr.markForCheck();
        const errorMessage = error?.error?.message || error?.message || 'Şifre sıfırlama sırasında bir hata oluştu.';
        this.toastr.error(errorMessage);
        console.error('Error resetting passwords:', error);
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        this.isResettingPassword = false;
        this.cdr.markForCheck();
        this.toastr.success('Şifreler başarıyla sıfırlandı.');
        this.closeBulkPasswordResetModal();
        if (this.dataTableComponent) {
          this.dataTableComponent.reload();
        }
      }
    });
  }

  onBulkSms(event: MouseEvent, item: any) {
    if (!this.dataTableComponent) {
      this.toastr.warning('DataTableComponent not found');
      return;
    }
    
    // Get selected rows
    const selectedRows = this.dataTableComponent.selectedRows;
    if (selectedRows.size === 0) {
      this.toastr.warning('Lütfen en az bir çalışan seçiniz.');
      return;
    }
    
    // Get selected employee records
    const selectedIds = Array.from(selectedRows);
    const dataSource = this.dataTableComponent.dataSource ? this.dataTableComponent.filteredData : this.dataTableComponent.data;
    this.selectedEmployeesForSms = dataSource.filter((row: any) => {
      const id = row['recid'] ?? row['EmployeeID'] ?? row['id'];
      return selectedIds.includes(id);
    });
    
    // Reset form
    this.smsMessage = '';
    
    // Open modal
    this.showBulkSmsModal = true;
  }

  onBulkMail(event: MouseEvent, item: any) {
    if (!this.dataTableComponent) {
      this.toastr.warning('DataTableComponent not found');
      return;
    }
    
    // Get selected rows
    const selectedRows = this.dataTableComponent.selectedRows;
    if (selectedRows.size === 0) {
      this.toastr.warning('Lütfen en az bir çalışan seçiniz.');
      return;
    }
    
    // Get selected employee records
    const selectedIds = Array.from(selectedRows);
    const dataSource = this.dataTableComponent.dataSource ? this.dataTableComponent.filteredData : this.dataTableComponent.data;
    this.selectedEmployeesForMail = dataSource.filter((row: any) => {
      const id = row['recid'] ?? row['EmployeeID'] ?? row['id'];
      return selectedIds.includes(id);
    });
    
    // Reset form
    this.mailSubject = '';
    this.mailMessage = '';
    
    // Open modal
    this.showBulkMailModal = true;
  }

  // Bulk SMS Modal Methods
  onBulkSmsModalChange(show: boolean) {
    this.showBulkSmsModal = show;
    if (!show) {
      this.closeBulkSmsModal();
    }
  }
  
  closeBulkSmsModal() {
    this.showBulkSmsModal = false;
    this.selectedEmployeesForSms = [];
    this.smsMessage = '';
  }
  
  onConfirmBulkSms() {
    if (!this.smsMessage || this.smsMessage.trim() === '') {
      this.toastr.warning('Lütfen mesaj giriniz.');
      return;
    }
    
    if (this.selectedEmployeesForSms.length === 0) {
      this.toastr.warning('Seçili çalışan bulunamadı.');
      return;
    }
    
    // Check if any employee has phone number
    const employeesWithPhone = this.selectedEmployeesForSms.filter(emp => {
      const phone = emp['MobilePhone1'] || emp['MobilePhone2'] || emp['HomePhone'] || emp['CompanyPhone'];
      return phone && phone.trim() !== '';
    });
    
    if (employeesWithPhone.length === 0) {
      this.toastr.warning('Seçili çalışanlardan hiçbirinde telefon numarası tanımlı değil.');
      return;
    }
    
    this.isSendingSms = true;
    
    // Get employee IDs
    const employeeIds = employeesWithPhone.map(emp => 
      emp['recid'] ?? emp['EmployeeID'] ?? emp['id']
    );
    
    // API call to send SMS
    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Employees/BulkSendSms`, {
      EmployeeIDs: employeeIds,
      Message: this.smsMessage.trim()
    }).pipe(
      catchError(error => {
        this.isSendingSms = false;
        this.cdr.markForCheck();
        const errorMessage = error?.error?.message || error?.message || 'SMS gönderimi sırasında bir hata oluştu.';
        this.toastr.error(errorMessage);
        console.error('Error sending SMS:', error);
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        this.isSendingSms = false;
        this.cdr.markForCheck();
        this.toastr.success(`${employeesWithPhone.length} çalışana SMS başarıyla gönderildi.`);
        this.closeBulkSmsModal();
      }
    });
  }
  
  // Bulk Mail Modal Methods
  onBulkMailModalChange(show: boolean) {
    this.showBulkMailModal = show;
    if (!show) {
      this.closeBulkMailModal();
    }
  }
  
  closeBulkMailModal() {
    this.showBulkMailModal = false;
    this.selectedEmployeesForMail = [];
    this.mailSubject = '';
    this.mailMessage = '';
  }
  
  onConfirmBulkMail() {
    if (!this.mailSubject || this.mailSubject.trim() === '') {
      this.toastr.warning('Lütfen mail konusu giriniz.');
      return;
    }
    
    if (!this.mailMessage || this.mailMessage.trim() === '') {
      this.toastr.warning('Lütfen mail mesajı giriniz.');
      return;
    }
    
    if (this.selectedEmployeesForMail.length === 0) {
      this.toastr.warning('Seçili çalışan bulunamadı.');
      return;
    }
    
    // Check if any employee has email
    const employeesWithEmail = this.selectedEmployeesForMail.filter(emp => {
      const email = emp['Mail'];
      return email && email.trim() !== '' && email.includes('@');
    });
    
    if (employeesWithEmail.length === 0) {
      this.toastr.warning('Seçili çalışanlardan hiçbirinde e-posta adresi tanımlı değil.');
      return;
    }
    
    this.isSendingMail = true;
    
    // Get employee IDs
    const employeeIds = employeesWithEmail.map(emp => 
      emp['recid'] ?? emp['EmployeeID'] ?? emp['id']
    );
    
    // API call to send mail
    this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Employees/BulkSendMail`, {
      EmployeeIDs: employeeIds,
      Subject: this.mailSubject.trim(),
      Message: this.mailMessage.trim()
    }).pipe(
      catchError(error => {
        this.isSendingMail = false;
        this.cdr.markForCheck();
        const errorMessage = error?.error?.message || error?.message || 'Mail gönderimi sırasında bir hata oluştu.';
        this.toastr.error(errorMessage);
        console.error('Error sending mail:', error);
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        this.isSendingMail = false;
        this.cdr.markForCheck();
        this.toastr.success(`${employeesWithEmail.length} çalışana mail başarıyla gönderildi.`);
        this.closeBulkMailModal();
      }
    });
  }
  
  // Helper methods to check if employees have phone/email
  getEmployeesWithPhoneCount(): number {
    return this.selectedEmployeesForSms.filter(emp => {
      const phone = emp['MobilePhone1'] || emp['MobilePhone2'] || emp['HomePhone'] || emp['CompanyPhone'];
      return phone && phone.trim() !== '';
    }).length;
  }
  
  getEmployeesWithEmailCount(): number {
    return this.selectedEmployeesForMail.filter(emp => {
      const email = emp['Mail'];
      return email && email.trim() !== '' && email.includes('@');
    }).length;
  }

  onImportFromExcel(event: MouseEvent, item: any) {
    this.excelHeaders = [];
    this.excelRows = [];
    this.excelColumnMapping = {};
    this.showExcelImportModal = true;
    this.cdr.markForCheck();
    setTimeout(() => this.cdr.detectChanges(), 0);
  }

  onExcelImportModalChange(show: boolean) {
    this.showExcelImportModal = show;
    if (!show) this.closeExcelImportModal();
  }

  closeExcelImportModal() {
    this.showExcelImportModal = false;
    this.excelHeaders = [];
    this.excelRows = [];
    this.excelGridColumns = [];
    this.excelImportTableColumns = [];
    this.excelColumnMapping = {};
    this.showExcelOptionsOverlay = false;
    this.excelOptionsOverlayData = {};
    this.excelAddUnknownCompanyToCheck = false;
    this.excelAddUnknownDepartmentToCheck = false;
    this.excelAddUnknownKadroToCheck = false;
    this.excelAddUnknownAccessGroupToCheck = false;
  }

  onExcelFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array((e.target?.result as ArrayBuffer) || []);
        const wb = XLSX.read(data, { type: 'array' });
        const firstSheet = wb.Sheets[wb.SheetNames[0]];
        const json: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });
        if (json.length < 1) {
          this.toastr.warning('Excel dosyasında veri bulunamadı.');
          input.value = '';
          return;
        }
        const headers = (json[0] as any[]).map((h) => String(h ?? '').trim() || ' ');
        const rows = json.slice(1).map((row: any[], idx: number) => {
          const obj: any = { _result: '', row: idx + 1 };
          headers.forEach((h, i) => {
            obj[h] = row[i] != null ? String(row[i]).trim() : '';
          });
          return obj;
        });
        this.excelHeaders = headers;
        this.excelRows = rows;
        this.excelColumnMapping = {};
        headers.forEach((h) => { this.excelColumnMapping[h] = this.excelColumnMapping[h] ?? ''; });
        this.excelGridColumns = [{ field: '_result', label: 'Sonuç' }, ...headers.map((h) => ({ field: h, label: h }))];
        this.excelImportTableColumns = this.excelGridColumns.map((c) => ({
          field: c.field,
          label: c.label,
          text: c.label,
          type: 'text' as ColumnType,
          sortable: false,
          width: c.field === '_result' ? '80px' : undefined
        }));
        this.cdr.detectChanges();
      } catch (err) {
        console.error(err);
        this.toastr.error('Excel dosyası okunamadı.');
      }
      input.value = '';
    };
    reader.readAsArrayBuffer(file);
  }

  openExcelOptionsOverlay(sectionKey: string) {
    this.showExcelOptionsOverlay = true;
    this.excelOptionsOverlayLoading = true;
    this.excelOptionsOverlayData = {};
    this.excelOptionsOverlayActiveKey = sectionKey;
    this.cdr.detectChanges();
    const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;
    // AuthorizationGroup: 0 = Web istemci yetkisi, 1 = Admin yetkisi
    const requests: { key: string; obs: Observable<any> }[] = [
      { key: 'Firma', obs: this.http.post<any>(`${apiUrl}/api/PdksCompanys`, { limit: -1, offset: 0 }).pipe(map((d) => (d.records || []).map((r: any) => ({ id: r.PdksCompanyID, text: r.PdksCompanyName })))) },
      { key: 'Kadro', obs: this.http.post<any>(`${apiUrl}/api/PdksStaffs`, { limit: -1, offset: 0 }).pipe(map((d) => (d.records || []).map((r: any) => ({ id: r.ID, text: r.Name })))) },
      { key: 'Departman', obs: this.http.post<any>(`${apiUrl}/api/Departments`, { limit: -1, offset: 0 }).pipe(map((d) => (d.records || []).map((r: any) => ({ id: r.DepartmentID, text: r.DepartmentName })))) },
      { key: 'AccessGroup', obs: this.http.post<any>(`${apiUrl}/api/AccessGroups`, { limit: -1, offset: 0 }).pipe(map((d) => (d.records || []).map((r: any) => ({ id: r.AccessGroupID || r.Id, text: r.AccessGroupName || r.Name })))) },
      { key: 'CafeteriaGroup', obs: this.http.post<any>(`${apiUrl}/api/CafeteriaGroups`, { limit: -1, offset: 0 }).pipe(map((d) => (d.records || []).map((r: any) => ({ id: r.CafeteriaGroupID || r.Id, text: r.CafeteriaGroupName || r.Name })))) },
      { key: 'WebClientAuthorization', obs: this.http.post<any>(`${apiUrl}/api/Authorizations`, { limit: -1, offset: 0, search: [{ field: 'AuthorizationGroup', operator: 'is', type: 'int', value: 0 }], searchLogic: 'AND' }).pipe(map((d) => (d.records || []).filter((r: any) => r.AuthorizationGroup === 0 || r.AuthorizationGroup === '0').map((r: any) => ({ id: r.Id, text: r.Name })))) },
      { key: 'Authorization', obs: this.http.post<any>(`${apiUrl}/api/Authorizations`, { limit: -1, offset: 0, search: [{ field: 'AuthorizationGroup', operator: 'is', type: 'int', value: 1 }], searchLogic: 'AND' }).pipe(map((d) => (d.records || []).filter((r: any) => r.AuthorizationGroup === 1 || r.AuthorizationGroup === '1').map((r: any) => ({ id: r.Id, text: r.Name })))) },
    ];
    let done = 0;
    requests.forEach(({ key, obs }) => {
      obs.pipe(catchError(() => of([]))).subscribe((list) => {
        this.excelOptionsOverlayData[key] = list;
        done++;
        if (done === requests.length) {
          this.excelOptionsOverlayLoading = false;
          this.cdr.detectChanges();
        }
      });
    });
  }

  closeExcelOptionsOverlay() {
    this.showExcelOptionsOverlay = false;
    this.excelOptionsOverlayActiveKey = null;
    this.cdr.detectChanges();
  }

  /**
   * Excel eşlemesindeki alan adını API'de beklenen önekli anahtara dönüştürür:
   * IdentificationNumber → aynen; CustomField01.. → CustomField.CustomField01; Kart alanları → Card.XXX; diğerleri → Employee.XXX
   */
  private excelFieldToApiKey(field: string): string {
    if (!field) return field;
    if (/^CustomField\d{2}$/.test(field)) return `CustomField.${field}`;
    const cardFields = this.getExcelCardGridFields().map((f) => f.value);
    if (cardFields.includes(field)) return `Card.${field}`;
    return `Employee.${field}`;
  }

  /**
   * Excel satırlarını eşleme tablosuna göre API formatına (önekli alan adı -> değer) dönüştürür.
   * Anahtarlar: Employee.XXX, CustomField.CustomField01, Card.XXX, IdentificationNumber.
   * Checkbox/boolean alanlarında "1" -> true, "0" veya boş -> false yapılır.
   */
  private buildExcelImportRecords(): Record<string, any>[] {
    const mapping = this.excelColumnMapping;
    const rows = this.excelRows || [];
    const boolFields = new Set(this.excelBooleanFields.map((b) => b.field));
    return rows.map((row: any) => {
      const rec: Record<string, any> = {};
      this.excelHeaders.forEach((header) => {
        const field = mapping[header];
        if (!field || field === '') return;
        let val = row[header];
        if (val !== undefined && val !== null) val = String(val).trim();
        else val = '';
        const apiKey = this.excelFieldToApiKey(field);
        if (boolFields.has(field)) {
          rec[apiKey] = val === '1' || val === 'true' || val === 'evet' || val === 'Evet';
        } else {
          rec[apiKey] = val;
        }
      });
      return rec;
    });
  }

  onConfirmExcelImport() {
    const records = this.buildExcelImportRecords();
    if (records.length === 0) {
      this.toastr.warning('Aktarılacak kayıt yok veya alan eşlemesi yapılmamış.');
      return;
    }
    const chunkSize = this.excelImportChunkSize;
    const chunks: Record<string, any>[][] = [];
    for (let i = 0; i < records.length; i += chunkSize) {
      chunks.push(records.slice(i, i + chunkSize));
    }
    const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;
    this.excelImportInProgress = true;
    this.excelImportProgressText = `0/${records.length} kayıt gönderiliyor...`;
    this.cdr.detectChanges();
    let sent = 0;
    from(chunks)
      .pipe(
        concatMap((chunk) =>
          this.http.post<ExcelImportResponse>(`${apiUrl}/api/Employees/ImportXls`, {
            records: chunk,
            addUnknownCompanyToCheck: this.excelAddUnknownCompanyToCheck,
            addUnknownDepartmentToCheck: this.excelAddUnknownDepartmentToCheck,
            addUnknownKadroToCheck: this.excelAddUnknownKadroToCheck,
            addUnknownAccessGroupToCheck: this.excelAddUnknownAccessGroupToCheck
          }).pipe(
            tap(() => {
              sent += chunk.length;
              this.excelImportProgressText = `${sent}/${records.length} kayıt gönderiliyor...`;
              this.cdr.detectChanges();
            }),
            map((res) => res)
          )
        ),
        toArray(),
        finalize(() => {
          this.excelImportInProgress = false;
          this.excelImportProgressText = '';
          this.cdr.detectChanges();
        }),
        catchError((err) => {
          this.toastr.error(err?.error?.message || err?.message || 'İçe aktarım sırasında hata oluştu.');
          return of([]);
        })
      )
      .subscribe({
        next: (results) => {
          if (results.length === chunks.length && chunks.length > 0) {
            const aggregated = this.aggregateExcelImportResults(results, chunks.length, chunkSize);
            this.excelImportResult = aggregated;
            const { imported, updated, errors, needReview } = aggregated;
            this.applyExcelImportResultToGrid(needReview);
            this.toastr.success(
              `${imported} kayıt içe aktarıldı` +
              (updated > 0 ? `, ${updated} kayıt güncellendi` : '') +
              (needReview.length > 0 ? `. ${needReview.length} kayıt kontrol gerektiriyor.` : '.')
            );
            if (errors.length > 0) {
              this.toastr.warning(`Hatalar: ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? '...' : ''}`);
            }
            this.dataTableComponent?.reload();
          }
        }
      });
  }

  /** needReview sonucuna göre Excel grid'deki satırların Sonuç (_result) ve satır rengini (_rowStatus) günceller. */
  private applyExcelImportResultToGrid(needReview: { row: number; employeeId: number; status?: string; reasons: string[] }[]): void {
    if (!needReview.length || !this.excelRows.length) return;
    const needReviewByRow = new Map(needReview.map((n) => [n.row, n]));
    this.excelRows = this.excelRows.map((r) => {
      const item = needReviewByRow.get(r.row);
      if (item && item.reasons && item.reasons.length > 0) {
        const messages = item.reasons.map((code) => this.excelImportReasonLabel(code));
        const rowStatus = item.status === 'success' ? 'success' : 'error';
        return { ...r, _result: messages.join(', '), _rowStatus: rowStatus };
      }
      return r;
    });
    this.cdr.markForCheck();
  }

  /** Excel import grid satırına status'a göre yeşil/kırmızı sınıf döndürür (getRowClass için). */
  excelImportGetRowClass = (row: any): string | null => {
    const status = row?._rowStatus;
    if (status === 'success') return 'excel-import-row-success';
    if (status === 'error') return 'excel-import-row-error';
    return null;
  };

  /** needReview reason kodunu kullanıcıya gösterilecek etikete çevirir. */
  private excelImportReasonLabel(code: string): string {
    const labels: Record<string, string> = {
      unknown_department: 'Bilinmeyen departman',
      unknown_company: 'Bilinmeyen firma',
      unknown_kadro: 'Bilinmeyen kadro',
      unknown_access_group: 'Bilinmeyen erişim grubu'
    };
    return labels[code] ?? code;
  }

  /** Chunk chunk'larından dönen ImportXls yanıtlarını tek sonuçta toplar; needReview satır numaralarını chunk offset ile düzeltir. */
  private aggregateExcelImportResults(
    results: ExcelImportResponse[],
    chunkCount: number,
    chunkSize: number
  ): { imported: number; updated: number; errors: string[]; needReview: { row: number; employeeId: number; status?: string; reasons: string[] }[] } {
    let imported = 0;
    let updated = 0;
    const errors: string[] = [];
    const needReview: { row: number; employeeId: number; status?: string; reasons: string[] }[] = [];
    results.forEach((res, chunkIndex) => {
      imported += res.imported ?? 0;
      updated += res.updated ?? 0;
      (res.errors || []).forEach((e) => errors.push(e));
      (res.needReview || []).forEach((item) => {
        needReview.push({
          row: chunkIndex * chunkSize + item.row,
          employeeId: item.employeeId,
          status: item.status,
          reasons: item.reasons || []
        });
      });
    });
    return { imported, updated, errors, needReview };
  }

  onBulkImageUpload(event: MouseEvent, item: any) {
    this.bulkImageUploadItems = [];
    this.showBulkImageUploadModal = true;
  }

  onBulkImageUploadModalChange(show: boolean) {
    this.showBulkImageUploadModal = show;
    if (!show) {
      this.closeBulkImageUploadModal();
    }
  }

  closeBulkImageUploadModal() {
    this.showBulkImageUploadModal = false;
    this.bulkImageUploadItems = [];
    this.bulkImageItemStatuses = [];
    this.isUploadingBulkImages = false;
    this.isReadingBulkImageFiles = false;
    this.bulkImageUploadProgress = { uploaded: 0, total: 0 };
  }

  onBulkImageFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input?.files;
    if (!files || files.length === 0) return;
    this.isReadingBulkImageFiles = true;
    const promises: Promise<{ ImageName: string; Data: string }>[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      promises.push(
        new Promise<{ ImageName: string; Data: string }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            const base64 = dataUrl.indexOf('base64,') >= 0 ? dataUrl.split('base64,')[1] : dataUrl;
            resolve({ ImageName: file.name, Data: base64 ?? '' });
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        })
      );
    }
    Promise.all(promises)
      .then((items) => {
        this.bulkImageUploadItems = [...this.bulkImageUploadItems, ...items];
        this.cdr.detectChanges();
      })
      .catch((err) => {
        console.error('Error reading image files:', err);
        this.toastr.error('Resimler okunurken hata oluştu.');
      })
      .finally(() => {
        this.isReadingBulkImageFiles = false;
        this.cdr.detectChanges();
        input.value = '';
      });
  }

  removeBulkImageItem(index: number) {
    this.bulkImageUploadItems = this.bulkImageUploadItems.filter((_, i) => i !== index);
    this.cdr.detectChanges();
  }

  onConfirmBulkImageUpload() {
    if (this.bulkImageUploadItems.length === 0) {
      this.toastr.warning('En az bir resim ekleyiniz.');
      return;
    }
    const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;
    const maxPerRequest = this.BULK_IMAGE_MAX_PER_REQUEST;
    const allImages = this.bulkImageUploadItems;
    const chunks: { ImageName: string; data: string }[][] = [];
    for (let i = 0; i < allImages.length; i += maxPerRequest) {
      const chunk = allImages.slice(i, i + maxPerRequest).map((img) => ({
        ImageName: img.ImageName,
        data: img.Data
      }));
      chunks.push(chunk);
    }
    this.isUploadingBulkImages = true;
    this.bulkImageUploadProgress = { uploaded: 0, total: allImages.length };
    this.bulkImageItemStatuses = allImages.map(() => 'pending');
    this.cdr.detectChanges();

    const chunkPayloads = chunks.map((chunk, chunkIndex) => ({ chunk, chunkIndex }));
    from(chunkPayloads)
      .pipe(
        concatMap(({ chunk, chunkIndex }) => {
          const startIdx = chunkIndex * maxPerRequest;
          return this.http
            .post<{
              ok?: boolean;
              message?: string;
              successCount?: number;
              errorCount?: number;
              success?: Record<string, string>;
              errors?: Record<string, string>;
            }>(`${apiUrl}/api/Employees/BulkImageUpload`, { Images: chunk })
            .pipe(
              tap((res) => {
                this.bulkImageUploadProgress = {
                  uploaded: this.bulkImageUploadProgress.uploaded + chunk.length,
                  total: this.bulkImageUploadProgress.total
                };
                const successMap = res?.success ?? {};
                const errorsMap = res?.errors ?? {};
                for (let k = 0; k < chunk.length; k++) {
                  const imageName = chunk[k].ImageName;
                  const status: 'success' | 'error' =
                    successMap[imageName] != null ? 'success' : errorsMap[imageName] != null ? 'error' : 'error';
                  this.bulkImageItemStatuses[startIdx + k] = status;
                }
                this.cdr.detectChanges();
              }),
              catchError((err) => {
                console.warn('BulkImageUpload chunk error:', chunkIndex, err);
                for (let k = 0; k < chunk.length; k++) {
                  this.bulkImageItemStatuses[startIdx + k] = 'error';
                }
                this.bulkImageUploadProgress = {
                  uploaded: this.bulkImageUploadProgress.uploaded + chunk.length,
                  total: this.bulkImageUploadProgress.total
                };
                this.cdr.detectChanges();
                return of(null);
              })
            );
        }),
        toArray(),
        finalize(() => {
          this.isUploadingBulkImages = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          const successCount = this.bulkImageItemStatuses.filter((s) => s === 'success').length;
          const errorCount = this.bulkImageItemStatuses.filter((s) => s === 'error').length;
          this.imageCacheBuster = Date.now();
          if (this.dataTableComponent) {
            if (typeof this.dataTableComponent.clearCache === 'function') {
              this.dataTableComponent.clearCache();
            }
            if (this.dataTableComponent.reload) {
              this.dataTableComponent.reload();
            }
          }
          this.cdr.detectChanges();
          if (errorCount === 0) {
            this.toastr.success(`Toplu resim aktarımı tamamlandı (${successCount} resim).`);
            this.closeBulkImageUploadModal();
          } else {
            this.toastr.warning(`${successCount} başarılı, ${errorCount} hata. Listede yeşil/kırmızı ile gösterildi.`);
          }
        },
        error: (err) => {
          console.error('BulkImageUpload error:', err);
          this.toastr.error(err?.error?.message || err?.message || 'Toplu resim aktarımı sırasında hata oluştu.');
        }
      });
  }

  onBulkWebClient(event: MouseEvent, item: any) {
    if (!this.dataTableComponent) {
      this.toastr.warning('DataTableComponent not found');
      return;
    }
    
    // Get selected rows
    const selectedRows = this.dataTableComponent.selectedRows;
    if (selectedRows.size === 0) {
      this.toastr.warning('Lütfen en az bir çalışan seçiniz.');
      return;
    }
    
    // Get selected employee records
    const selectedIds = Array.from(selectedRows);
    const dataSource = this.dataTableComponent.dataSource ? this.dataTableComponent.filteredData : this.dataTableComponent.data;
    this.selectedEmployeesForWebClient = dataSource.filter((row: any) => {
      const id = row['recid'] ?? row['EmployeeID'] ?? row['id'];
      return selectedIds.includes(id);
    });
    
    // Reset form
    this.webClientEnabled = false;
    this.selectedWebClientAuthorizationId = null;
    
    // Load authorization options if not loaded
    this.loadWebClientAuthorizationOptionsIfNeeded();
    
    // Open modal
    this.showBulkWebClientModal = true;
  }

  onBulkPasswordReset(event: MouseEvent, item: any) {
    if (!this.dataTableComponent) {
      this.toastr.warning('DataTableComponent not found');
      return;
    }
    
    // Get selected rows
    const selectedRows = this.dataTableComponent.selectedRows;
    if (selectedRows.size === 0) {
      this.toastr.warning('Lütfen en az bir çalışan seçiniz.');
      return;
    }
    
    // Get selected employee records
    const selectedIds = Array.from(selectedRows);
    const dataSource = this.dataTableComponent.dataSource ? this.dataTableComponent.filteredData : this.dataTableComponent.data;
    this.selectedEmployeesForPasswordReset = dataSource.filter((row: any) => {
      const id = row['recid'] ?? row['EmployeeID'] ?? row['id'];
      return selectedIds.includes(id);
    });
    
    // Open modal
    this.showBulkPasswordResetModal = true;
  }

  onExportToExcel(event: MouseEvent, item: any) {
    //console.log('Export to Excel:', event, item);
  }

  /**
   * Get selected card IDs from EmployeeCardGrid
   */
  private getSelectedCardIds(): number[] {
    if (!this.dataTableComponent) {
      console.warn('DataTableComponent not found');
      return [];
    }

    // Find EmployeeCardGrid in nested grids
    if (!this.dataTableComponent.nestedGrids) {
      console.warn('Nested grids not found');
      return [];
    }

    const cardGrid = this.dataTableComponent.nestedGrids.find(
      (grid: DataTableComponent) => grid.id === 'EmployeeCardGrid'
    );

    if (!cardGrid) {
      console.warn('EmployeeCardGrid not found');
      return [];
    }

    // Get selected row IDs from the grid
    const selectedRowIds = Array.from(cardGrid.selectedRows);
    
    // Get actual CardID values from the data
    const cardIds: number[] = [];
    const recidField = cardGrid.recid || 'CardID';
    
    // Use filteredData or internalData depending on dataSource
    const dataSource = cardGrid.dataSource ? cardGrid.filteredData : cardGrid.data;
    
    selectedRowIds.forEach((rowId: any) => {
      const row = dataSource.find((r: any) => {
        const id = r['recid'] ?? r[recidField] ?? r['CardID'] ?? r['id'];
        return id === rowId;
      });
      
      if (row) {
        const cardId = row['CardID'] ?? row[recidField] ?? row['recid'] ?? rowId;
        if (cardId != null) {
          cardIds.push(cardId);
        }
      }
    });
    return cardIds;
  }

  /**
   * Get selected card details from EmployeeCardGrid (alternative to API call)
   */
  private getSelectedCardDetails(): any[] {
    if (!this.dataTableComponent) {
      console.warn('DataTableComponent not found');
      return [];
    }

    // Find EmployeeCardGrid in nested grids
    if (!this.dataTableComponent.nestedGrids) {
      console.warn('Nested grids not found');
      return [];
    }

    const cardGrid = this.dataTableComponent.nestedGrids.find(
      (grid: DataTableComponent) => grid.id === 'EmployeeCardGrid'
    );

    if (!cardGrid) {
      console.warn('EmployeeCardGrid not found');
      return [];
    }

    // Get selected row IDs from the grid
    const selectedRowIds = Array.from(cardGrid.selectedRows);
    
    // Get actual card data from the grid
    const cards: any[] = [];
    const recidField = cardGrid.recid || 'CardID';
    
    // Use filteredData or internalData depending on dataSource
    const dataSource = cardGrid.dataSource ? cardGrid.filteredData : cardGrid.data;
    
    selectedRowIds.forEach((rowId: any) => {
      const row = dataSource.find((r: any) => {
        const id = r['recid'] ?? r[recidField] ?? r['CardID'] ?? r['id'];
        return id === rowId;
      });
      
      if (row) {
        // Return the full card object
        cards.push(row);
      }
    });
    
    return cards;
  }

  // Card operation handlers
  onCardFormat(event: MouseEvent, item: any) {
    const selectedCardIds = this.getSelectedCardIds();
    
    //console.log('onCardFormat - selectedCardIds:', selectedCardIds);
    
    if (selectedCardIds.length === 0) {
      this.toastr.warning('Lütfen formatlamak için en az bir kart seçin', 'Uyarı');
      return;
    }

    // Store selected card IDs and clear previous card details
    this.selectedCardIdsForFormat = selectedCardIds;
    this.selectedCardsForFormat = []; // Clear previous card details
    this.selectedReaderForFormat = null; // Clear previous reader selection
    
    //console.log('onCardFormat - selectedCardIdsForFormat:', this.selectedCardIdsForFormat);
    
    // Open modal and load readers
    this.showFormatModal = true;
    this.loadReaders();
  }

  /**
   * Setup WebSocket listeners
   */
  private setupWebSocketListeners(): void {
    // Listen to WebSocket messages
    this.wsMessageSubscription = this.wsService.getMessages().subscribe((message: any) => {
      this.handleWebSocketMessage(message);
    });

    // Listen to connection status
    this.wsConnectionSubscription = this.wsService.getConnectionStatus().subscribe((connected: boolean) => {
      if (!connected && this.showFormatModal) {
        // Connection lost while modal is open
        this.toastr.warning('WebSocket bağlantısı kesildi', 'Uyarı');
      }
    });
  }

  /**
   * Handle WebSocket messages
   * Supports both old format: { type: 'xxx', status: true/false, data: {...}, ... }
   * and new format: { Type: 'xxx', Status: true/false, Data: {...}, Message: '...', ... }
   */
  private handleWebSocketMessage(message: any): void {
    // Normalize message format (support both old and new format)
    const messageType = message.Type || message.type;
    const messageData = message.Data || message.data;
    const messageStatus = message.Status !== undefined ? message.Status : message.status;
    
    // Handle formatconnect messages (format operation responses)
    if (messageType === 'formatconnect' || message.type === 'formatconnect' || (message.Message && this.isFormatting)) {
      //console.log('Format WebSocket message received:', message);
      
      // Update status message
      if (message.Message) {
        this.formatStatusMessage = message.Message;
        this.cdr.markForCheck();
      }

      // If Kill message received, close modal
      if (message.Kill) {
        this.isFormatting = false;
        
        // Close modal after 2 seconds
        setTimeout(() => {
          this.closeFormatModal();
          this.toastr.success('Format işlemi tamamlandı', 'Başarılı');
          
          // Reload card grid if needed
          if (this.dataTableComponent) {
            const cardGrid = this.dataTableComponent.nestedGrids?.find(
              (grid: DataTableComponent) => grid.id === 'EmployeeCardGrid'
            );
            if (cardGrid) {
              cardGrid.reload();
            }
          }
        }, 2000);
      }
      
      return; // Don't process further
    }
    
    // Handle checkReader response (supports both old and new format)
    if (messageType === 'checkReader' || message.type === 'checkReader' || message.type === 'RC2XXDeviceStatus') {
      
      // Handle new format: { Type: 'checkReader', Status: true, Message: '...', Data: { readers: [...] } }
      if (messageData && messageData.readers && Array.isArray(messageData.readers)) {
        // New format: { Type: 'checkReader', Data: { readers: [{ isConnected: true, readerSerial: '264550284', message: '...', ... }] } }
        messageData.readers.forEach((reader: any) => {
          const serial = reader.readerSerial || reader.SerialNumber || reader.serialNumber;
          if (serial) {
            const status = reader.isConnected === true ? 'connected' : 'disconnected';
            this.readerStatuses.set(String(serial), status);
            // Store message if available
            if (reader.message) {
              this.readerMessages.set(String(serial), reader.message);
            }
          }
        });
      } else if (message.data && message.data.readers && Array.isArray(message.data.readers)) {
        // Old format: { type: 'checkReader', data: { readers: [{ isConnected: false, readerSerial: '210551988', message: '...', ... }] } }
        message.data.readers.forEach((reader: any) => {
          const serial = reader.readerSerial || reader.SerialNumber || reader.serialNumber;
          if (serial) {
            const status = reader.isConnected === true ? 'connected' : 'disconnected';
            this.readerStatuses.set(String(serial), status);
            // Store message if available
            if (reader.message) {
              this.readerMessages.set(String(serial), reader.message);
            }
          }
        });
      } else if (messageData && typeof messageData === 'object' && !messageData.readers) {
        // Format: { Type: 'checkReader', Data: { '210551988': true, ... } } or old format
        Object.keys(messageData).forEach((serial: string) => {
          const result = messageData[serial];
          if (typeof result === 'boolean') {
            const status = result === true ? 'connected' : 'disconnected';
            this.readerStatuses.set(serial, status);
          } else if (typeof result === 'object' && result !== null) {
            // Format: { Type: 'checkReader', Data: { '210551988': { connected: true, ... } } }
            const status = result.connected || result.isConnected === true ? 'connected' : 'disconnected';
            this.readerStatuses.set(serial, status);
          }
        });
      } else if (message.data && typeof message.data === 'object' && !message.data.readers) {
        // Old format: { subType: 'checkReader', data: { '210551988': true, ... } }
        Object.keys(message.data).forEach((serial: string) => {
          const result = message.data[serial];
          if (typeof result === 'boolean') {
            const status = result === true ? 'connected' : 'disconnected';
            this.readerStatuses.set(serial, status);
          } else if (typeof result === 'object' && result !== null) {
            // Format: { subType: 'checkReader', data: { '210551988': { connected: true, ... } } }
            const status = result.connected || result.isConnected === true ? 'connected' : 'disconnected';
            this.readerStatuses.set(serial, status);
          }
        });
      } else if (message.results && Array.isArray(message.results)) {
        // Format: { subType: 'checkReader', results: [{ serialNumber: 'xxx', connected: true }, ...] }
        message.results.forEach((result: any) => {
          const serial = result.serialNumber || result.SerialNumber || result.deviceSerial;
          if (serial) {
            const status = result.connected || result.isConnected === true ? 'connected' : 'disconnected';
            this.readerStatuses.set(serial, status);
          }
        });
      } else if (message.deviceSerials && Array.isArray(message.deviceSerials)) {
        // Format: { subType: 'checkReader', deviceSerials: ['xxx', 'yyy'], 'xxx': true, 'yyy': false }
        message.deviceSerials.forEach((serial: string) => {
          const result = message[serial];
          if (result !== undefined) {
            const status = result === true || result === 'connected' ? 'connected' : 'disconnected';
            this.readerStatuses.set(serial, status);
          } else {
            // If no result for this serial, mark as disconnected
            this.readerStatuses.set(serial, 'disconnected');
          }
        });
      } else if (message.status !== undefined && message.readerSerial) {
        // Format: { subType: 'checkReader', status: true, readerSerial: '210551988' }
        const serial = String(message.readerSerial);
        const status = message.status === true ? 'connected' : 'disconnected';
        this.readerStatuses.set(serial, status);
      }
      this.cdr.markForCheck();
    }
  }

  /**
   * Load readers from API
   */
  loadReaders(): void {
    this.isLoadingReaders = true;
    this.readers = [];
    this.readerStatuses.clear();
    
    const url = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Terminals/GetDefinitionReaders`;
    
    this.http.post<any>(url, {}).pipe(
      catchError(error => {
        this.isLoadingReaders = false;
        this.toastr.error('Reader\'lar yüklenirken bir hata oluştu', 'Hata');
        return of({ status: 'error', records: [] });
      })
    ).subscribe({
      next: (response) => {
        this.isLoadingReaders = false;
        if (response && response.status === 'success' && response.records) {
          this.readers = response.records;
          // Initialize all readers as disconnected initially
          this.readers.forEach((reader: any) => {
            const serial = reader.SerialNumber || reader.serialNumber;
            if (serial) {
              this.readerStatuses.set(serial, 'disconnected');
            }
          });
          // Send checkReader message via WebSocket
          this.checkReaderConnections();
        } else if (response && Array.isArray(response)) {
          // If response is directly an array
          this.readers = response;
          this.readers.forEach((reader: any) => {
            const serial = reader.SerialNumber || reader.serialNumber;
            if (serial) {
              this.readerStatuses.set(serial, 'disconnected');
            }
          });
          this.checkReaderConnections();
        } else if (response && response.readers && Array.isArray(response.readers)) {
          // If response has readers property
          this.readers = response.readers;
          this.readers.forEach((reader: any) => {
            const serial = reader.SerialNumber || reader.serialNumber;
            if (serial) {
              this.readerStatuses.set(serial, 'disconnected');
            }
          });
          this.checkReaderConnections();
        } else {
          this.readers = [];
          this.toastr.warning('Reader bulunamadı', 'Uyarı');
        }
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.isLoadingReaders = false;
        this.toastr.error('Reader\'lar yüklenirken bir hata oluştu', 'Hata');
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Check reader connections via WebSocket
   * PHP server expects: { type: 'checkReader', data: { deviceSerials: [...] } }
   */
  private checkReaderConnections(): void {
    if (!this.wsService.isConnected()) {
      this.toastr.warning('WebSocket bağlantısı yok', 'Uyarı');
      return;
    }

    const deviceSerials = this.readers
      .map((reader: any) => reader.SerialNumber || reader.serialNumber)
      .filter((serial: any) => serial);

    if (deviceSerials.length === 0) {
      return;
    }

    // PHP server format: type: 'checkReader'
    const message = {
      type: 'checkReader',
      data: {
        deviceSerials: deviceSerials
      }
    };

    // Set all readers to checking status
    deviceSerials.forEach((serial: string) => {
      this.readerStatuses.set(serial, 'checking');
    });
    this.cdr.markForCheck();

    this.wsService.sendMessage(message);
  }

  /**
   * Check single reader connection
   * PHP server expects: { type: 'checkReader', data: { deviceSerials: [...] } }
   */
  private checkSingleReader(serial: string): void {
    if (!this.wsService.isConnected()) {
      this.toastr.error('Bağlantı yok', 'Hata');
      return;
    }

    this.readerStatuses.set(serial, 'checking');
    this.cdr.markForCheck();

    // PHP server format: type: 'checkReader'
    const message = {
      type: 'checkReader',
      data: {
        deviceSerials: [serial]
      }
    };

    this.wsService.sendMessage(message);
  }

  /**
   * Get reader status
   */
  getReaderStatus(reader: any): 'connected' | 'disconnected' | 'checking' {
    const serial = reader.SerialNumber || reader.serialNumber;
    if (!serial) {
      return 'disconnected';
    }
    return this.readerStatuses.get(serial) || 'disconnected';
  }

  /**
   * Check if reader is selectable (connected)
   */
  isReaderSelectable(reader: any): boolean {
    return this.getReaderStatus(reader) === 'connected';
  }

  /**
   * Get reader message
   */
  getReaderMessage(reader: any): string | null {
    const serial = reader.SerialNumber || reader.serialNumber || reader.readerSerial;
    if (!serial) {
      return null;
    }
    return this.readerMessages.get(String(serial)) || null;
  }

  /**
   * Close format modal
   */
  closeFormatModal(): void {
    // Stop formatting
    this.formatWebSocket(false);
    
    this.showFormatModal = false;
    this.readers = [];
    this.selectedCardIdsForFormat = [];
    this.selectedCardsForFormat = [];
    this.formatStatusMessage = '';
    this.isFormatting = false;
    this.selectedReaderForFormat = null;
    this.readerStatuses.clear();
    this.readerMessages.clear();
  }

  /**
   * Cleanup subscriptions
   */
  ngOnDestroy(): void {
    // Close format WebSocket connection
    this.formatWebSocket(false);
    
    if (this.wsMessageSubscription) {
      this.wsMessageSubscription.unsubscribe();
    }
    if (this.wsConnectionSubscription) {
      this.wsConnectionSubscription.unsubscribe();
    }
  }

  /**
   * Handle reader selection for format operation
   */
  onReaderSelect(reader: any): void {
    const serial = reader.SerialNumber || reader.serialNumber;
    const status = this.getReaderStatus(reader);
    //console.log('status', status);

    // If disconnected, try to check connection again
    if (status === 'disconnected') {
      if (serial) {
        this.checkSingleReader(serial);
      } else {
        this.toastr.error('Bağlantı yok', 'Hata');
      }
      return;
    }

    // If checking, wait
    if (status === 'checking') {
      return;
    }

    // Only allow selection if connected
    if (status !== 'connected') {
      this.toastr.error('Bağlantı yok', 'Hata');
      return;
    }

    // If already formatting, don't allow another selection
    if (this.isFormatting) {
      this.toastr.warning('Format işlemi devam ediyor', 'Uyarı');
      return;
    }


    // Store selected reader
    this.selectedReaderForFormat = reader;
    
    //console.log('selectedCardIdsForFormat:', this.selectedCardIdsForFormat);
    //console.log('selectedCardsForFormat:', this.selectedCardsForFormat);
    
    // Try to get card details directly from grid first (faster, no API call needed)
    if (this.selectedCardsForFormat.length === 0) {
      const cardDetails = this.getSelectedCardDetails();
      if (cardDetails && cardDetails.length > 0) {
        //console.log('Got card details from grid:', cardDetails);
        this.selectedCardsForFormat = cardDetails;
      }
    }
    
    // If we have card details, start format operation
    if (this.selectedCardsForFormat.length > 0) {
      //console.log('Starting format operation with card details from grid...');
      this.startFormatOperation(reader);
    } else if (this.selectedCardIdsForFormat.length > 0) {
      // Fallback: Load from API if grid data not available
      //console.log('Loading card details from API...');
      this.loadCardDetailsForFormat();
    } else {
      console.error('No cards selected for format');
      this.toastr.error('Format için kart seçilmedi', 'Hata');
    }
  }

  /**
   * Load card details for format operation
   */
  private loadCardDetailsForFormat(): void {
    if (this.selectedCardIdsForFormat.length === 0) {
      console.error('No card IDs selected');
      this.toastr.error('Kart seçilmedi', 'Hata');
      return;
    }

    //console.log('Loading card details for IDs:', this.selectedCardIdsForFormat);
    const url = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Cards`;
    
    // Use the same format as Card component - with proper search structure
    const requestBody = {
      page: 1,
      limit: -1,
      offset: 0,
      search: {
        field: 'CardID',
        operator: 'in',
        value: this.selectedCardIdsForFormat
      },
      searchLogic: 'AND',
      sort: undefined,
      join: undefined,
      showDeleted: false
    };
    
    //console.log('Request body:', requestBody);
    
    this.http.post<any>(url, requestBody).pipe(
      catchError(error => {
        console.error('Error loading card details:', error);
        console.error('Error details:', error.error || error.message);
        this.toastr.error('Kart detayları yüklenirken hata oluştu', 'Hata');
        return of({ records: [], total: 0 });
      })
    ).subscribe({
      next: (response) => {
        //console.log('Card details response:', response);
        //console.log('Response type:', typeof response);
        //console.log('Response keys:', response ? Object.keys(response) : 'null');
        
        // Handle different response formats
        let records: any[] = [];
        if (response && response.records) {
          records = response.records;
        } else if (response && Array.isArray(response)) {
          records = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          records = response.data;
        }
        
        //console.log('Extracted records:', records);
        
        if (records && records.length > 0) {
          this.selectedCardsForFormat = records;
          //console.log('Cards loaded:', this.selectedCardsForFormat);
          // Start format operation with first card
          if (this.selectedReaderForFormat) {
            //console.log('Starting format operation...');
            this.startFormatOperation(this.selectedReaderForFormat);
          } else {
            console.error('No reader selected for format');
          }
        } else {
          console.error('No records in response:', response);
          this.toastr.error('Kart detayları bulunamadı', 'Hata');
        }
      },
      error: (error) => {
        console.error('Subscription error:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error body:', error.error);
      }
    });
  }

  /**
   * Start format operation with selected reader and card
   */
  private startFormatOperation(reader: any): void {
    //console.log('startFormatOperation called with reader:', reader);
    //console.log('selectedCardsForFormat:', this.selectedCardsForFormat);
    
    if (this.selectedCardsForFormat.length === 0) {
      console.error('No cards available for format');
      this.toastr.error('Kart bilgisi bulunamadı', 'Hata');
      return;
    }

    // Use first card for format (or iterate through all cards)
    const card = this.selectedCardsForFormat[0];
    //console.log('Using card for format:', card);
    
    // Start format WebSocket connection
    //console.log('Calling formatWebSocket...');
    this.formatWebSocket(true, reader, card);
  }

  /**
   * Format WebSocket function - based on PHP formatWebsocket function
   * Uses existing WebSocketService connection instead of creating a new one
   */
  formatWebSocket(status: boolean, reader: any = null, card: any = null): void {
    if (!status) {
      // Stop formatting - send disconnect message if needed
      this.isFormatting = false;
      this.formatStatusMessage = '';
      this.cdr.markForCheck();
      return;
    }

    if (!reader || !card) {
      this.toastr.error('Reader veya kart bilgisi eksik', 'Hata');
      return;
    }

    // Check if WebSocket is connected
    if (!this.wsService.isConnected()) {
      this.toastr.error('WebSocket bağlantısı yok. Lütfen bekleyin...', 'Hata');
      // Try to connect
      this.wsService.connect();
      return;
    }

    try {
      this.isFormatting = true;
      this.formatStatusMessage = '';
      
      // Determine message based on card type
      // CardTypeID == 3 means card, otherwise fingerprint
      const messageCard = card.CardTypeID == 3 ? 'Kart okutunuz..' : 'Parmak izi terminaline bağlanıyor..';
      this.formatStatusMessage = messageCard;
      this.cdr.markForCheck();

      // Send formatconnect message using existing WebSocket connection
      // Format must be: { type: 'formatconnect', card: card, reader: reader }
      const client = {
        type: 'formatconnect',
        card: card,
        reader: reader.SerialNumber
      };
      
      //console.log('Sending formatconnect message:', client);
      
      // Use WebSocketService to send message
      // sendMessage will handle formatconnect specially and add token
      this.wsService.sendMessage(client);
      
    } catch (error) {
      console.error('Error sending formatconnect message:', error);
      this.toastr.error('Format mesajı gönderilemedi', 'Hata');
      this.isFormatting = false;
      this.formatStatusMessage = '';
      this.cdr.markForCheck();
    }
  }

  /**
   * Handle reader item click (for disconnected readers)
   */
  onReaderItemClick(reader: any, event: MouseEvent): void {
    const status = this.getReaderStatus(reader);
    const serial = reader.SerialNumber || reader.serialNumber;
    
    // Set message to "--" when clicked
    if (serial) {
      this.readerMessages.set(String(serial), '--');
      this.cdr.markForCheck();
    }
    
    // If disconnected, check connection
    if (status === 'disconnected') {
      if (serial) {
        this.checkSingleReader(serial);
      } else {
        this.toastr.error('Bağlantı yok', 'Hata');
      }
    } else if (status === 'connected') {
      // If connected, allow selection
      this.onReaderSelect(reader);
    }
    // If checking, do nothing
  }

  onCardTransfer(event: MouseEvent, item: any) {
    //console.log('Transfer clicked', event, item);
    
    const selectedCardIds = this.getSelectedCardIds();
    
    if (selectedCardIds.length === 0) {
      this.toastr.warning('Lütfen transfer etmek için en az bir kart seçin', 'Uyarı');
      return;
    }

    //console.log('Transfer edilecek kart ID\'leri:', selectedCardIds);
    // TODO: Transfer API'sine gönder
    // Örnek: this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Cards/Transfer`, { CardIDs: selectedCardIds })
  }

  onCardReset(event: MouseEvent, item: any) {
    //console.log('Sıfırla clicked', event, item);
    
    const selectedCardIds = this.getSelectedCardIds();
    
    if (selectedCardIds.length === 0) {
      this.toastr.warning('Lütfen sıfırlamak için en az bir kart seçin', 'Uyarı');
      return;
    }

    //console.log('Sıfırlanacak kart ID\'leri:', selectedCardIds);
    // TODO: Sıfırla API'sine gönder
    // Örnek: this.http.post(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Cards/Reset`, { CardIDs: selectedCardIds })
  }

  /**
   * Kartı Kişiden Al - POST to api/Cards/SetFreeForEmployee with CardID
   */
  onCardSetFree(event: MouseEvent, item: any) {
    const selectedCardIds = this.getSelectedCardIds();
    
    if (selectedCardIds.length === 0) {
      this.toastr.warning('Lütfen kartı kişiden almak için bir kart seçin', 'Uyarı');
      return;
    }

    if (selectedCardIds.length > 1) {
      this.toastr.warning('Lütfen sadece bir kart seçin', 'Uyarı');
      return;
    }

    if (!window.confirm('Kart kişiden alıncaktır onaylıyor musunuz?')) {
      return;
    }

    const cardId = selectedCardIds[0];
    const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

    this.http.post(`${apiUrl}/api/Cards/SetFreeForEmployee`, { CardID: cardId }).pipe(
      catchError(err => {
        this.toastr.error(err?.error?.message || err?.message || 'Kart kişiden alınırken hata oluştu', 'Hata');
        return of(null);
      })
    ).subscribe(response => {
      if (response !== null) {
        this.toastr.success('Kart kişiden alındı', 'Başarılı');
        const cardGrid = this.dataTableComponent?.nestedGrids?.find(
          (g: DataTableComponent) => g.id === 'EmployeeCardGrid'
        );
        if (cardGrid) {
          cardGrid.reload();
        }
      }
    });
  }

  /**
   * Handle card close and clone button click
   */
  onCardCloseAndClone(event: MouseEvent, item: any) {
    const selectedCardIds = this.getSelectedCardIds();
    
    if (selectedCardIds.length === 0) {
      this.toastr.warning('Lütfen kapatmak için bir kart seçin', 'Uyarı');
      return;
    }

    if (selectedCardIds.length > 1) {
      this.toastr.warning('Lütfen sadece bir kart seçin', 'Uyarı');
      return;
    }

    // Get selected card details
    const selectedCards = this.getSelectedCardDetails();
    if (selectedCards.length === 0) {
      this.toastr.error('Kart bilgisi bulunamadı', 'Hata');
      return;
    }

    this.selectedCardForCloseAndClone = selectedCards[0];
    this.closeAndCloneCardDesc = '';
    this.showCloseAndCloneModal = true;
  }

  /**
   * Close close and clone modal
   */
  closeCloseAndCloneModal(): void {
    this.showCloseAndCloneModal = false;
    this.closeAndCloneCardDesc = '';
    this.closeAndCloneCardDescError = false;
    this.selectedCardForCloseAndClone = null;
  }

  /**
   * Submit close and clone operation
   */
  submitCloseAndClone(): void {
    // Reset error
    this.closeAndCloneCardDescError = false;
    
    // Validate required field
    if (!this.closeAndCloneCardDesc || this.closeAndCloneCardDesc.trim() === '') {
      this.closeAndCloneCardDescError = true;
      this.toastr.warning('Eski kartın kapatılma sebebi zorunludur', 'Uyarı');
      this.cdr.markForCheck();
      return;
    }

    if (!this.selectedCardForCloseAndClone) {
      this.toastr.error('Kart bilgisi bulunamadı', 'Hata');
      return;
    }

    const cardId = this.selectedCardForCloseAndClone.CardID || this.selectedCardForCloseAndClone.recid;
    if (!cardId) {
      this.toastr.error('Kart ID bulunamadı', 'Hata');
      return;
    }

    const url = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Cards/CloseAndClone`;
    const payload = {
      CardID: cardId,
      CardDesc: this.closeAndCloneCardDesc.trim()
    };

    this.http.post(url, payload).subscribe({
      next: (response: any) => {
        // Check if response indicates success
        const isSuccess = response && (response.error === false || response.error === undefined || response.status === 'success');
        
        if (isSuccess) {
          this.toastr.success('Kart kapatıldı ve yeni kart oluşturuldu', 'Başarılı');
          this.closeCloseAndCloneModal();
          
          // Reload EmployeeCardGrid
          if (this.dataTableComponent) {
            const cardGrid = this.dataTableComponent.nestedGrids?.find(
              (grid: DataTableComponent) => grid.id === 'EmployeeCardGrid'
            );
            if (cardGrid) {
              cardGrid.reload();
            }
          }
        } else {
          const errorMessage = response?.message || response?.error || 'İşlem başarısız oldu';
          this.toastr.error(errorMessage, 'Hata');
        }
      },
      error: (error) => {
        console.error('Error closing and cloning card:', error);
        const errorMessage = error?.error?.message || error?.message || 'Kart kapatma ve klonlama işlemi başarısız oldu';
        this.toastr.error(errorMessage, 'Hata');
      }
    });
  }

  /**
   * Reload a nested grid by ID in the main data table
   */
  reloadNestedGrid(gridId: string): void {
    if (this.dataTableComponent) {
      setTimeout(() => {
        if (this.dataTableComponent?.nestedGrids) {
          const grid = this.dataTableComponent.nestedGrids.find((g: any) => g.id === gridId);
          if (grid && grid.dataSource) {
            grid.reload();
          }
        }
      }, 0);
    }
  }

  /**
   * Deep copy formTabs while preserving functions (onSave, formLoadRequest, etc.)
   */
  private deepCopyFormTabs(tabs: FormTab[]): FormTab[] {
    return tabs.map(tab => ({
      ...tab,
      grids: tab.grids?.map(grid => ({
        ...grid,
        // Preserve functions that might be lost in JSON serialization
        onSave: grid.onSave,
        formLoadRequest: grid.formLoadRequest,
        formDataMapper: grid.formDataMapper,
        dataSource: grid.dataSource,
        data: grid.data
      }))
    }));
  }

  /**
   * Load total price based on CafeteriaAccount and EmployeeID
   */
  loadTotalPrice(accountId: number): void {
    if (!this.dataTableComponent) {
      return;
    }

    // Get EmployeeID from formData
    const employeeId = this.dataTableComponent.formData['EmployeeID'] || 
                      this.dataTableComponent.formData['recid'] ||
                      this.dataTableComponent.editingRecordId;

    if (!employeeId) {
      console.warn('EmployeeID not found, cannot load total price');
      return;
    }

    const url = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/CafeteriaEvents/GetTotalBalanceWithAccountIdAndEmployeeId`;
    const payload = {
      EmployeeID: employeeId,
      AccountId: accountId
    };
    
    //console.log('Loading total price from:', url, 'with payload:', payload);

    this.http.post<any>(url, payload).pipe(
      finalize(() => {
        // Handle finalization if needed
      })
    ).subscribe({
      next: (response) => {
        //console.log('Total price response:', response);
        if (response && response.status === 'success' && response.totalBalance != null) {
          // Update formData with totalBalance using onFormDataChange to trigger change detection
          if (this.dataTableComponent) {
            this.dataTableComponent.onFormDataChange({ TotalPrice: response.totalBalance });
            // Force change detection to update the view after form data change
            this.cdr.detectChanges();
          }
        } else {
          console.warn('Invalid response structure or status:', response);
        }
      },
      error: (error) => {
        console.error('Error loading total price:', error);
      }
    });
  }

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    public translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private wsService: WebSocketService
  ) {
    // Deep copy formTabs while preserving functions (onSave, formLoadRequest, etc.)
    this.formTabs = this.deepCopyFormTabs(formTabs);
    this.setupWebSocketListeners();
  }

  ngOnInit(): void {
    const skip = new Set(['SubscriptionCard', 'TotalPrice']);
    this.excelMappableFields = (formFields || [])
      .filter((f) => f.field && !skip.has(f.field))
      .map((f) => ({ value: f.field!, label: f.label || f.text || f.field! }));
    this.refreshExcelBooleanFields();
    // Initialize toolbar items for EmployeeCardGrid with translations and handlers
    this.initializeCardGridToolbar();
    // Load and update custom field settings
    this.loadCustomFieldSettings();
  }

  /**
   * Load custom field settings from API and update columns
   */
  private loadCustomFieldSettings(): void {
    this.http.post<GridResponse>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/CustomFieldSettings`, {
      limit: -1,
      offset: 0
    }).pipe(
      catchError(error => {
        console.error('Error loading custom field settings:', error);
        return of({
          status: 'error' as const,
          total: 0,
          records: []
        } as GridResponse);
      })
    ).subscribe(response => {
      if (response.status === 'success' && response.records && response.records.length > 0) {
        this.updateColumnsFromCustomFieldSettings(response.records);
      }
    });
  }

  /**
   * Update columns based on CustomFieldSettings data
   */
  private updateColumnsFromCustomFieldSettings(settings: any[]): void {
    // Wait for dataTableComponent to be available (use setTimeout to ensure ViewChild is initialized)
    setTimeout(() => {
      if (!this.dataTableComponent) {
        console.warn('DataTableComponent not available yet, retrying...');
        setTimeout(() => this.updateColumnsFromCustomFieldSettings(settings), 100);
        return;
      }

      // Update table columns
      settings.forEach(setting => {
        const fieldName = setting.Field; // e.g., "CustomField01"
        
        // Update table column
        if (this.dataTableComponent) {
          const updates: Partial<TableColumn> = {};
          
          // Update text and label
          if (setting.Text) {
            updates.text = setting.Text;
            updates.label = setting.Text;
          }
          
          // Update type
          if (setting.Type) {
            updates.type = setting.Type as ColumnType;
          }
          
          // Update visibility (IsVisible: false means hidden: true)
          if (setting.IsVisible !== undefined) {
            updates.hidden = !setting.IsVisible;
            // Store original hidden value for join visibility logic
            (updates as any)._customFieldHidden = !setting.IsVisible;
          }
          
          // Update column using setColumn method
          this.dataTableComponent.setColumn(fieldName, updates);
        }
        
        // Update form field
        const formFieldIndex = this.formFields.findIndex(f => f.field === fieldName);
        if (formFieldIndex !== -1) {
          const formField = this.formFields[formFieldIndex];
          
          // Update text and label
          if (setting.Text) {
            formField.text = setting.Text;
            formField.label = setting.Text;
          }
          
          // Update type
          if (setting.Type) {
            formField.type = setting.Type as ColumnType;
          }
          
          // Update disabled state (IsDisable: true means disabled: true)
          if (setting.IsDisable !== undefined) {
            formField.disabled = setting.IsDisable;
          }
          
          // Update visibility for form (IsVisible: false means hidden: true)
          if (setting.IsVisible !== undefined) {
            formField.hidden = !setting.IsVisible;
          }
        }
      });
      
      // Create new array reference to trigger change detection
      this.formFields = [...this.formFields];
      this.refreshExcelBooleanFields();
      this.refreshExcelMappableFields();

      // Trigger change detection
      this.cdr.markForCheck();
    }, 100);
  }

  /** Excel eşlenebilir alan listesini formFields + Kart grid alanları ile günceller (CustomFieldSettings etiketleri ve hidden dahil). */
  private refreshExcelMappableFields(): void {
    const skip = new Set(['SubscriptionCard', 'TotalPrice','Card']);
    const fromMain = (this.formFields || [])
      .filter((f) => f.field && !skip.has(f.field) && !f.hidden)
      .map((f) => ({ value: f.field!, label: f.label || f.text || f.field! }));
    const cardFields = this.getExcelCardGridFields();
    const seen = new Set(fromMain.map((x) => x.value));
    const fromCard = cardFields.filter((x) => !seen.has(x.value) && (seen.add(x.value), true));
    this.excelMappableFields = [...fromMain, ...fromCard];
  }

  /** Kart eklerken gerekli alanları (EmployeeCardGrid formFields) Excel eşleme listesi için döndürür. */
  private getExcelCardGridFields(): { value: string; label: string }[] {
    const cardTab = this.formTabs.find((tab) => tab.grids?.some((g) => g.id === 'EmployeeCardGrid'));
    const grid = cardTab?.grids?.find((g) => g.id === 'EmployeeCardGrid');
    const fields = grid?.formFields;
    if (!fields || !Array.isArray(fields)) return [];
    const skip = new Set(['CardID', 'ReferanceID', 'Card']);
    return fields
      .filter((f: any) => f.field && !skip.has(f.field) && !f.hidden && f.showInAdd !== false)
      .map((f: any) => ({ value: f.field, label: f.label || f.text || f.field }));
  }

  /** Checkbox/boolean alanlarını formFields üzerinden günceller (Excel import açıklamaları için; hidden alanlar hariç). */
  private refreshExcelBooleanFields(): void {
    const isBool = (t: ColumnType | string | undefined) => t === 'checkbox' || t === 'boolean';
    this.excelBooleanFields = (this.formFields || [])
      .filter((f) => f.field && isBool(f.type as string) && !f.hidden)
      .map((f) => ({ field: f.field!, label: f.label || f.text || f.field! }));
  }

  /**
   * Initialize toolbar items for EmployeeCardGrid (İşlemler menu)
   */
  private initializeCardGridToolbar(): void {
    // Find the CardGrid in formTabs
    const cardTab = this.formTabs.find(tab => 
      tab.grids && tab.grids.some(grid => grid.id === 'EmployeeCardGrid')
    );
    
    if (cardTab && cardTab.grids) {
      const cardGrid = cardTab.grids.find(grid => grid.id === 'EmployeeCardGrid');
      if (cardGrid && cardGrid.toolbar && cardGrid.toolbar.items) {
        cardGrid.toolbar.items = cardGrid.toolbar.items.map(item => {
          if (item.id === 'islemler' && item.type === 'menu' && item.items) {
            return {
              ...item,
              items: item.items.map((subItem: any) => {
                const handlers: Record<string, (e: MouseEvent, i: any) => void> = {
                  'formatla': (e, i) => this.onCardFormat(e, i),
                  'transfer': (e, i) => this.onCardTransfer(e, i),
                  'sifirla': (e, i) => this.onCardReset(e, i),
                  'kapat-ve-yeni-ekle': (e, i) => this.onCardCloseAndClone(e, i),
                  'kart-kisiden-al': (e, i) => this.onCardSetFree(e, i)
                };
                const texts: Record<string, string> = {
                  'formatla': this.translate.instant('card.format'),
                  'transfer': this.translate.instant('card.transfer'),
                  'sifirla': this.translate.instant('card.reset'),
                  'kapat-ve-yeni-ekle': 'Kartı Kapat ve Yeni Ekle',
                  'kart-kisiden-al': 'Kartı Kişiden Al'
                };
                return {
                  ...subItem,
                  text: texts[subItem.id] ?? subItem.text,
                  onClick: handlers[subItem.id]
                };
              })
            };
          }
          return item;
        });
      }
    }
  }
  
  /**
   * Load department options if not already loaded
   */
  private loadDepartmentOptionsIfNeeded(): void {
    const departmentColumn = this.tableColumns.find(col => col.field === 'Department');
    if (!departmentColumn || !departmentColumn.load) {
      return;
    }
    
    // If options already loaded, return
    if (departmentColumn.options && Array.isArray(departmentColumn.options) && departmentColumn.options.length > 0) {
      return;
    }
    
    // Load options from API
    const load = departmentColumn.load;
    const url = typeof load.url === 'function' ? load.url({}) : load.url;
    const method = load.method || 'GET';
    const data = typeof load.data === 'function' ? load.data({}) : (load.data || {});
    
    let request: Observable<any>;
    if (method === 'GET') {
      request = this.http.get(url);
    } else {
      request = this.http.request(method, url, { body: data });
    }
    
    request.pipe(
      map((response: any) => {
        // Apply map function if provided
        if (load.map && typeof load.map === 'function') {
          const mapped = load.map(response);
          // Convert { id, text } format to { label, value } format
          if (Array.isArray(mapped)) {
            return mapped.map((item: any) => ({
              label: item.text || item.label || item.DepartmentName || item.Name || String(item.id || item.value),
              value: item.id || item.value || item.DepartmentID || item.Id
            }));
          }
          return mapped;
        }
        
        // Default mapping
        let records: any[] = [];
        if (response && response.records && Array.isArray(response.records)) {
          records = response.records;
        } else if (response && Array.isArray(response)) {
          records = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          records = response.data;
        }
        
        return records.map((item: any) => ({
          label: item.DepartmentName || item.text || item.label || item.name || String(item.DepartmentID || item.id),
          value: item.DepartmentID || item.id || item.value
        }));
      }),
      catchError(error => {
        console.error('Error loading department options:', error);
        return of([]);
      })
    ).subscribe(options => {
      if (departmentColumn) {
        departmentColumn.options = options;
        this.cdr.markForCheck();
      }
    });
  }
  
  /**
   * Load access group options if not already loaded
   */
  private loadAccessGroupOptionsIfNeeded(): void {
    const accessGroupColumn = this.tableColumns.find(col => col.field === 'AccessGroup');
    if (!accessGroupColumn || !accessGroupColumn.load) {
      return;
    }
    
    // If options already loaded, return
    if (accessGroupColumn.options && Array.isArray(accessGroupColumn.options) && accessGroupColumn.options.length > 0) {
      return;
    }
    
    // Load options from API
    const load = accessGroupColumn.load;
    const url = typeof load.url === 'function' ? load.url({}) : load.url;
    const method = load.method || 'GET';
    const data = typeof load.data === 'function' ? load.data({}) : (load.data || {});
    
    let request: Observable<any>;
    if (method === 'GET') {
      request = this.http.get(url);
    } else {
      request = this.http.request(method, url, { body: data });
    }
    
    request.pipe(
      map((response: any) => {
        // Apply map function if provided
        if (load.map && typeof load.map === 'function') {
          const mapped = load.map(response);
          // Convert { id, text } format to { label, value } format
          if (Array.isArray(mapped)) {
            return mapped.map((item: any) => ({
              label: item.text || item.label || item.AccessGroupName || item.Name || String(item.id || item.value),
              value: item.id || item.value || item.AccessGroupID || item.Id
            }));
          }
          return mapped;
        }
        
        // Default mapping
        let records: any[] = [];
        if (response && response.records && Array.isArray(response.records)) {
          records = response.records;
        } else if (response && Array.isArray(response)) {
          records = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          records = response.data;
        }
        
        return records.map((item: any) => ({
          label: item.AccessGroupName || item.Name || item.text || item.label || item.name || String(item.AccessGroupID || item.Id || item.id),
          value: item.AccessGroupID || item.Id || item.id || item.value
        }));
      }),
      catchError(error => {
        console.error('Error loading access group options:', error);
        return of([]);
      })
    ).subscribe(options => {
      if (accessGroupColumn) {
        accessGroupColumn.options = options;
        this.cdr.markForCheck();
      }
    });
  }
  
  /**
   * Get department options for bulk department change modal
   */
  getDepartmentOptions(): any[] {
    const departmentColumn = this.tableColumns.find(col => col.field === 'Department');
    if (departmentColumn && departmentColumn.options && Array.isArray(departmentColumn.options)) {
      return departmentColumn.options.map(opt => ({
        label: opt.label,
        value: opt.value
      }));
    }
    return [];
  }
  
  /**
   * Get access group options for bulk access group change modal
   */
  getAccessGroupOptions(): any[] {
    const accessGroupColumn = this.tableColumns.find(col => col.field === 'AccessGroup');
    if (accessGroupColumn && accessGroupColumn.options && Array.isArray(accessGroupColumn.options)) {
      return accessGroupColumn.options.map(opt => ({
        label: opt.label,
        value: opt.value
      }));
    }
    return [];
  }
  
  /**
   * Load company options if not already loaded
   */
  private loadCompanyOptionsIfNeeded(): void {
    const companyColumn = this.tableColumns.find(col => col.field === 'Company');
    if (!companyColumn || !companyColumn.load) {
      return;
    }
    
    // If options already loaded, return
    if (companyColumn.options && Array.isArray(companyColumn.options) && companyColumn.options.length > 0) {
      return;
    }
    
    // Load options from API
    const load = companyColumn.load;
    const url = typeof load.url === 'function' ? load.url({}) : load.url;
    const method = load.method || 'GET';
    const data = typeof load.data === 'function' ? load.data({}) : (load.data || {});
    
    let request: Observable<any>;
    if (method === 'GET') {
      request = this.http.get(url);
    } else {
      request = this.http.request(method, url, { body: data });
    }
    
    request.pipe(
      map((response: any) => {
        // Apply map function if provided
        if (load.map && typeof load.map === 'function') {
          const mapped = load.map(response);
          // Convert { id, text } format to { label, value } format
          if (Array.isArray(mapped)) {
            return mapped.map((item: any) => ({
              label: item.text || item.label || item.PdksCompanyName || item.Name || String(item.id || item.value),
              value: item.id || item.value || item.PdksCompanyID || item.Id
            }));
          }
          return mapped;
        }
        
        // Default mapping
        let records: any[] = [];
        if (response && response.records && Array.isArray(response.records)) {
          records = response.records;
        } else if (response && Array.isArray(response)) {
          records = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          records = response.data;
        }
        
        return records.map((item: any) => ({
          label: item.PdksCompanyName || item.Name || item.text || item.label || String(item.PdksCompanyID || item.Id || item.id),
          value: item.PdksCompanyID || item.Id || item.id || item.value
        }));
      }),
      catchError(error => {
        console.error('Error loading company options:', error);
        return of([]);
      })
    ).subscribe(options => {
      if (companyColumn) {
        companyColumn.options = options;
        this.cdr.markForCheck();
      }
    });
  }
  
  /**
   * Load position (Kadro) options if not already loaded
   */
  private loadPositionOptionsIfNeeded(): void {
    const positionColumn = this.tableColumns.find(col => col.field === 'Kadro');
    if (!positionColumn || !positionColumn.load) {
      return;
    }
    
    // If options already loaded, return
    if (positionColumn.options && Array.isArray(positionColumn.options) && positionColumn.options.length > 0) {
      return;
    }
    
    // Load options from API
    const load = positionColumn.load;
    const url = typeof load.url === 'function' ? load.url({}) : load.url;
    const method = load.method || 'GET';
    const data = typeof load.data === 'function' ? load.data({}) : (load.data || {});
    
    let request: Observable<any>;
    if (method === 'GET') {
      request = this.http.get(url);
    } else {
      request = this.http.request(method, url, { body: data });
    }
    
    request.pipe(
      map((response: any) => {
        // Apply map function if provided
        if (load.map && typeof load.map === 'function') {
          const mapped = load.map(response);
          // Convert { id, text } format to { label, value } format
          if (Array.isArray(mapped)) {
            return mapped.map((item: any) => ({
              label: item.text || item.label || item.Name || String(item.id || item.value),
              value: item.id || item.value || item.ID || item.Id
            }));
          }
          return mapped;
        }
        
        // Default mapping
        let records: any[] = [];
        if (response && response.records && Array.isArray(response.records)) {
          records = response.records;
        } else if (response && Array.isArray(response)) {
          records = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          records = response.data;
        }
        
        return records.map((item: any) => ({
          label: item.Name || item.text || item.label || String(item.ID || item.Id || item.id),
          value: item.ID || item.Id || item.id || item.value
        }));
      }),
      catchError(error => {
        console.error('Error loading position options:', error);
        return of([]);
      })
    ).subscribe(options => {
      if (positionColumn) {
        positionColumn.options = options;
        this.cdr.markForCheck();
      }
    });
  }
  
  /**
   * Get company options for bulk company change modal
   */
  getCompanyOptions(): any[] {
    const companyColumn = this.tableColumns.find(col => col.field === 'Company');
    if (companyColumn && companyColumn.options && Array.isArray(companyColumn.options)) {
      return companyColumn.options.map(opt => ({
        label: opt.label,
        value: opt.value
      }));
    }
    return [];
  }
  
  /**
   * Get position (Kadro) options for bulk position change modal
   */
  getPositionOptions(): any[] {
    const positionColumn = this.tableColumns.find(col => col.field === 'Kadro');
    if (positionColumn && positionColumn.options && Array.isArray(positionColumn.options)) {
      return positionColumn.options.map(opt => ({
        label: opt.label,
        value: opt.value
      }));
    }
    return [];
  }
  
  /**
   * Load WebClientAuthorization options if not already loaded
   */
  private loadWebClientAuthorizationOptionsIfNeeded(): void {
    const webClientAuthField = this.formFields.find(col => col.field === 'WebClientAuthorizationId');
    if (!webClientAuthField || !webClientAuthField.load) {
      return;
    }
    
    // Check if options already loaded in formFields
    if (webClientAuthField.options && Array.isArray(webClientAuthField.options) && webClientAuthField.options.length > 0) {
      return;
    }
    
    // Load options from API
    const load = webClientAuthField.load;
    const url = typeof load.url === 'function' ? load.url({}) : load.url;
    const method = load.method || 'GET';
    let data = typeof load.data === 'function' ? load.data({}) : (load.data || {});
    
    // Add AuthorizationGroup=2 filter to the request
    if (method === 'POST') {
      // Add search filter for AuthorizationGroup = 2 in W2UI format
      data = { ...data };
      if (!data.search) {
        data.search = [];
      }
      // Add AuthorizationGroup filter in W2UI format
      data.search.push({
        field: 'AuthorizationGroup',
        operator: 'is',
        type: 'int',
        value: 2
      });
      if (!data.searchLogic) {
        data.searchLogic = 'AND';
      }
    }
    
    let request: Observable<any>;
    if (method === 'GET') {
      request = this.http.get(url);
    } else {
      request = this.http.request(method, url, { body: data });
    }
    
    request.pipe(
      map((response: any) => {
        // Apply map function if provided
        if (load.map && typeof load.map === 'function') {
          const mapped = load.map(response);
          // Filter by AuthorizationGroup = 2 if not already filtered in API
          let filtered = mapped;
          if (Array.isArray(mapped)) {
            filtered = mapped.filter((item: any) => {
              // Check if AuthorizationGroup is 2
              return item.AuthorizationGroup === 2 || 
                     item.authorizationGroup === 2 ||
                     (item.originalData && item.originalData.AuthorizationGroup === 2);
            });
          }
          // Convert { id, text } format to { label, value } format
          if (Array.isArray(filtered)) {
            return filtered.map((item: any) => ({
              label: item.text || item.label || item.Name || String(item.id || item.value),
              value: item.id || item.value || item.Id
            }));
          }
          return filtered;
        }
        
        // Default mapping
        let records: any[] = [];
        if (response && response.records && Array.isArray(response.records)) {
          records = response.records;
        } else if (response && Array.isArray(response)) {
          records = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          records = response.data;
        }
        
        // Filter by AuthorizationGroup = 2
        records = records.filter((item: any) => {
          return item.AuthorizationGroup === 2 || 
                 item.authorizationGroup === 2;
        });
        
        return records.map((item: any) => ({
          label: item.Name || item.text || item.label || String(item.Id || item.id),
          value: item.Id || item.id || item.value
        }));
      }),
      catchError(error => {
        console.error('Error loading web client authorization options:', error);
        return of([]);
      })
    ).subscribe(options => {
      if (webClientAuthField) {
        webClientAuthField.options = options;
        this.cdr.markForCheck();
      }
    });
  }
  
  /**
   * Get WebClientAuthorization options for bulk web client change modal
   */
  getWebClientAuthorizationOptions(): any[] {
    const webClientAuthField = this.formFields.find(col => col.field === 'WebClientAuthorizationId');
    if (webClientAuthField && webClientAuthField.options && Array.isArray(webClientAuthField.options)) {
      return webClientAuthField.options.map(opt => ({
        label: opt.label,
        value: opt.value
      }));
    }
    return [];
  }
}
