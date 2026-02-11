// Card Template Editor Component
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { SelectComponent, SelectOption } from 'src/app/components/select/select.component';
import { tableColumns as employeeTableColumns } from 'src/app/pages/employee/employee-table-columns';
import { tableColumns as cardTableColumns } from 'src/app/pages/card/card-table-columns';
import QRCode from 'qrcode';

interface TemplateItem {
  id: string;
  type: 'fix' | 'label' | 'image' | 'imagefix' | 'barcode';
  field: string;
  top: number;
  left: number;
  color?: string;
  fontsize?: number;
  fontFamily?: string;
  textTransform?: string;
  lwidth?: number;
  textAlign?: 'left' | 'center' | 'right';
  fontWeight?: string;
  width?: string;
  height?: string;
  objectFit?: string;
  borderRadius?: string;
  src?: string;
}

interface TemplateData {
  FRONT: {
    width: string;
    height: string;
    background: string;
    items: { [key: string]: TemplateItem };
  };
  BACK?: {
    width: string;
    height: string;
    background: string;
    items: { [key: string]: TemplateItem };
  };
  SIDE?: string; // 'SINGLE' or 'MULTI'
}

@Component({
  selector: 'app-card-template-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    TranslateModule,
    TablerIconsModule,
    SelectComponent
  ],
  templateUrl: './card-template-editor.component.html',
  styleUrls: ['./card-template-editor.component.scss']
})
export class CardTemplateEditorComponent implements OnInit, OnDestroy {
  @ViewChild('frontContainer', { static: false }) frontContainerRef?: ElementRef<HTMLDivElement>;
  @ViewChild('backContainer', { static: false }) backContainerRef?: ElementRef<HTMLDivElement>;
  @ViewChild('wrapperRef', { static: false }) wrapperRef?: ElementRef<HTMLDivElement>;
  @ViewChild('fileInput', { static: false }) fileInputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('sampleImgInput', { static: false }) sampleImgInputRef?: ElementRef<HTMLInputElement>;

  templateId: number | null = null;
  templateName: string = '';
  
  // Page settings
  pageType: '0' | '1' | '2' = '0'; // 0: Yatay, 1: Dikey, 2: Özel
  width: number = 85.5;
  height: number = 54;
  designType: 'SINGLE' | 'MULTI' = 'MULTI';
  designDirection: 'FRONT' | 'BACK' = 'FRONT';
  
  // Content editing
  contentType: '0' | '1' | '2' | '4' = '0'; // 0: Yazı, 1: Personel Resim, 2: 2D Barkod, 4: Sabit Resim
  field: string = 'Fix';
  fixText: string = '';
  fontFamily: string = 'Special';
  fontSize: number = 5;
  textWidth: number = 20;
  fontWeight: string = '500';
  textTransform: string = 'none';
  textAlign: 'left' | 'center' | 'right' = 'left';
  textColor: string = '#000000';
  
  // Image properties
  imageWidth: number = 20;
  imageHeight: number = 20;
  objectFit: string = 'fill';
  borderRadius: string = '0mm';
  
  // Field options
  fieldOptions: Array<{ Field: string; Name: string }> = [];
  
  // Template data
  templateData: TemplateData = {
    FRONT: {
      width: '171mm',
      height: '108mm',
      background: 'transparent',
      items: {}
    },
    BACK: {
      width: '171mm',
      height: '108mm',
      background: 'transparent',
      items: {}
    }
  };
  
  selectedItemId: string | null = null;
  isDragging: boolean = false;

  // Kişi arama ve kart listesi (önizleme verisi)
  selectedEmployeeId: number | null = null;
  employeeOptions: SelectOption[] = [];
  employeeSearchTerm$ = new Subject<string>();
  isLoadingEmployees = false;
  employeeCardsList: any[] = [];
  selectedCardId: number | null = null;
  isLoadingCards = false;
  getForWriteData: any = null;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    public translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Load field options
    this.loadFieldOptions();
    // Kişi arama
    this.setupEmployeeSearch();
    // Check if editing existing template
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadTemplate(Number(id));
      }
    });
    // Initialize page type
    this.updatePageDimensions();
  }

  private setupEmployeeSearch(): void {
    const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;
    this.employeeSearchTerm$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((searchTerm) => {
          if (!searchTerm || String(searchTerm).trim().length < 2) {
            this.employeeOptions = [];
            this.isLoadingEmployees = false;
            this.cdr.markForCheck();
            return of([]);
          }
          this.isLoadingEmployees = true;
          this.cdr.markForCheck();
          return this.http.post<any>(`${apiUrl}/api/Employees/find`, {
            search: String(searchTerm).trim(),
            limit: 50,
            offset: 0
          }).pipe(
            map((res: any) => {
              const records = Array.isArray(res?.records) ? res.records : (res?.data || []);
              return records.map((item: any) => {
                const name = item.Name || '';
                const surname = item.SurName || '';
                const company = item.CompanyName || '';
                let label = `${name} ${surname}`.trim();
                if (company) label += ` - ${company}`;
                if (!label) label = `ID: ${item.EmployeeID}`;
                return { label, value: item.EmployeeID };
              });
            }),
            catchError(() => {
              this.isLoadingEmployees = false;
              this.cdr.markForCheck();
              return of([]);
            })
          );
        })
      )
      .subscribe((opts) => {
        this.employeeOptions = opts;
        this.isLoadingEmployees = false;
        this.cdr.markForCheck();
      });
  }

  onEmployeeSearchChange(term: string): void {
    this.employeeSearchTerm$.next(term || '');
  }

  onEmployeeSelect(employeeId: number | null): void {
    this.selectedEmployeeId = employeeId;
    this.employeeCardsList = [];
    this.selectedCardId = null;
    this.getForWriteData = null;
    if (employeeId) {
      this.loadEmployeeCards(employeeId);
    }
    this.cdr.markForCheck();
  }

  private loadEmployeeCards(employeeId: number): void {
    const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;
    this.isLoadingCards = true;
    this.cdr.markForCheck();
    this.http.post<any>(`${apiUrl}/api/Cards/GetCardsByEmployeeID`, {
      EmployeeID: employeeId,
      limit: -1,
      offset: 0
    }).pipe(
      map((res: any) => Array.isArray(res?.records) ? res.records : (res?.data || [])),
      catchError(() => {
        this.isLoadingCards = false;
        this.employeeCardsList = [];
        this.cdr.markForCheck();
        return of([]);
      })
    ).subscribe((records) => {
      this.employeeCardsList = records;
      this.isLoadingCards = false;
      this.cdr.markForCheck();
    });
  }

  onCardSelect(card: any): void {
    const cardId = card?.CardID ?? card?.CardId ?? card?.recid ?? null;
    if (!cardId) return;
    this.selectedCardId = cardId;
    const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;
    this.http.post<any>(`${apiUrl}/api/Cards/GetForWrite`, { CardID: cardId }).pipe(
      catchError((err) => {
        console.error('GetForWrite error:', err);
        this.toastr.error('Kart verisi alınamadı.', 'Hata');
        return of(null);
      })
    ).subscribe((response) => {
      this.getForWriteData = response;
      const cardData = this.buildCardDataFromGetForWrite(response);
      this.refreshPreviewWithCardData(cardData);
      this.cdr.markForCheck();
    });
  }

  /** GetForWrite yanıtından CardData oluşturur (card-write-list ile uyumlu) */
  private buildCardDataFromGetForWrite(response: any): any {
    const data = response?.data || response?.record || response;
    if (!data) return null;
    const card = data;
    const employee = data.Employee || {};
    const fullName = employee ? `${employee.Name || ''} ${employee.SurName || ''}`.trim() : '';
    let departmentName = '';
    if (employee?.EmployeeDepartments && Array.isArray(employee.EmployeeDepartments) && employee.EmployeeDepartments.length > 0) {
      departmentName = employee.EmployeeDepartments.map((ed: any) => ed.Department?.DepartmentName || ed.Department?.Name).filter(Boolean).join(', ') || '';
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
      Object.keys(employee.CustomField).forEach((k) => {
        if (k.startsWith('CustomField')) cardData[k] = employee.CustomField[k];
      });
    }
    // EmployeeCustomFields (GetForWrite API alternatif yapısı)
    if (employee?.EmployeeCustomFields) {
      const cf = Array.isArray(employee.EmployeeCustomFields) && employee.EmployeeCustomFields.length > 0
        ? employee.EmployeeCustomFields[0]
        : employee.EmployeeCustomFields;
      if (cf && typeof cf === 'object') {
        Object.keys(cf).forEach((k) => {
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

  /** fieldOptions'tan alan key'ine karşılık gelen görünen adı döner */
  private getFieldDisplayName(fieldKey: string): string {
    if (!fieldKey || !this.fieldOptions?.length) return '';
    const opt = this.fieldOptions.find((o) => o.Field === fieldKey);
    return opt?.Name ?? '';
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

  private getFieldValueFromCardData(cardData: any, field: string): string {
    if (!cardData || !field) return '';
    const f = (field || '').trim();
    if (!f) return '';
    // Employee.CustomField.XXX -> CustomFieldXXX (root'ta olabilir)
    const plainField = f.startsWith('Employee.CustomField.') ? f.replace('Employee.CustomField.', '') : f;
    const tryGet = (val: any): string => {
      const s = this.valueToDisplayString(val);
      return s !== '' ? s : '';
    };
    let v = tryGet(cardData[plainField]);
    if (v) return v;
    // Employee.CustomField.XXX nested path
    v = tryGet(cardData?.Employee?.CustomField?.[plainField]);
    if (v) return v;
    // CustomField02 / CustomField2 varyantları (bazı API'ler farklı key kullanır)
    if (/^CustomField\d+$/.test(plainField)) {
      const num = plainField.replace('CustomField', '');
      const altKey = 'CustomField' + String(parseInt(num, 10)).padStart(2, '0');
      v = tryGet(cardData[altKey] ?? cardData?.Employee?.CustomField?.[altKey]);
      if (v) return v;
      const altKey2 = 'CustomField' + parseInt(num, 10);
      v = tryGet(cardData[altKey2] ?? cardData?.Employee?.CustomField?.[altKey2]);
      if (v) return v;
    }
    // FullName: Employee.Name + " " + Employee.SurName (CardWrite ile uyumlu)
    if (f === 'FullName') {
      return (
        cardData.FullName ||
        (cardData.Name != null && cardData.SurName != null ? `${cardData.Name} ${cardData.SurName}`.trim() : '') ||
        (cardData.Employee?.Name != null && cardData.Employee?.SurName != null
          ? `${cardData.Employee.Name} ${cardData.Employee.SurName}`.trim()
          : '') ||
        ''
      );
    }
    // Employee.Name, Employee.SurName gibi nested alanlar
    if (f.includes('.')) {
      const parts = f.split('.');
      let val: any = cardData;
      for (const p of parts) {
        val = val != null && typeof val === 'object' ? val[p] : undefined;
      }
      return tryGet(val);
    }
    return '';
  }

  /** Önizlemedeki öğeleri CardData ile günceller */
  private refreshPreviewWithCardData(cardData: any): void {
    if (!cardData) return;
    const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;
    const avatarUrl = '/assets/images/profile/avaatar.png';
    for (const side of ['FRONT', 'BACK'] as const) {
      const items = this.templateData[side]?.items;
      if (!items) continue;
      const container = side === 'FRONT' ? this.frontContainerRef?.nativeElement : this.backContainerRef?.nativeElement;
      if (!container) continue;
      Object.keys(items).forEach((itemId) => {
        const item = items[itemId];
        const el = document.getElementById(itemId);
        if (!el) return;
        if (item.type === 'fix') {
          el.textContent = item.field || '';
        } else if (item.type === 'label' && item.field) {
          const val = this.getFieldValueFromCardData(cardData, item.field);
          el.textContent = val || this.getFieldDisplayName(item.field) || item.field;
        } else if (item.type === 'image' && item.field) {
          const picField = item.field === 'PictureId' || item.field === 'PictureID' ? 'PictureID' : item.field;
          const pictureId = this.getFieldValueFromCardData(cardData, picField) || cardData.PictureID || cardData.PictureId;
          (el as HTMLImageElement).src = pictureId ? `${apiUrl}/images/${pictureId}?v=${Date.now()}` : avatarUrl;
        } else if (item.type === 'barcode' && item.field) {
          const val = this.getFieldValueFromCardData(cardData, item.field);
          const textToEncode = val || item.field || ' ';
          this.setQrCodeOnElement(el, textToEncode);
        }
      });
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    // Only handle arrow keys if an item is selected and not typing in an input
    if (!this.selectedItemId) return;
    
    const target = event.target as HTMLElement;
    const isEditableElement = 
      target.tagName === 'INPUT' || 
      target.tagName === 'TEXTAREA' || 
      target.tagName === 'SELECT' ||
      target.isContentEditable;
    
    // Don't handle arrow keys if user is typing in an input field
    if (isEditableElement) return;
    
    const side = this.designDirection;
    const item = this.templateData[side]?.items?.[this.selectedItemId];
    if (!item) return;
    
    // Movement step in mm (0.5mm per keypress, or 1mm if Shift is held)
    const step = event.shiftKey ? 1 : 0.5;
    let moved = false;
    
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        item.left = Math.max(0, item.left - step);
        moved = true;
        break;
      case 'ArrowRight':
        event.preventDefault();
        item.left += step;
        moved = true;
        break;
      case 'ArrowUp':
        event.preventDefault();
        item.top = Math.max(0, item.top - step);
        moved = true;
        break;
      case 'ArrowDown':
        event.preventDefault();
        item.top += step;
        moved = true;
        break;
    }
    
    if (moved) {
      // Update element position
      const element = document.getElementById(this.selectedItemId);
      if (element) {
        element.style.left = `${item.left}mm`;
        element.style.top = `${item.top}mm`;
      }
      this.cdr.markForCheck();
    }
  }

  /** Özel alan key'ini Employee.CustomField. prefix'li forma getirir (eski şablon uyumluluğu). */
  private normalizeCustomFieldKey(field: string): string {
    if (!field || typeof field !== 'string') return field;
    if (field.startsWith('Employee.CustomField.')) return field;
    if (/^CustomField\d{2}$/.test(field)) return 'Employee.CustomField.' + field;
    return field;
  }

  private normalizeTemplateItems(items: { [key: string]: TemplateItem } | undefined): { [key: string]: TemplateItem } {
    if (!items) return {};
    const out: { [key: string]: TemplateItem } = {};
    Object.keys(items).forEach((id) => {
      const item = { ...items[id] };
      if (item.field) {
        item.field = this.normalizeCustomFieldKey(item.field);
      }
      out[id] = item;
    });
    return out;
  }

  loadFieldOptions(): void {
    const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

    // ID veya Id ile biten alanları alma (primary/foreign key'ler)
    const isIdField = (field: string) => /(?:ID|Id)$/.test(field);

    // Employee tablosundaki tüm alanlar (CustomField ve ID alanları hariç)
    const employeeFields = employeeTableColumns
      .filter((col) => col.field && !/^CustomField\d{2}$/.test(col.field) && !isIdField(col.field))
      .map((col) => ({
        Field: "Employee."+col.field,
        Name: (col.text || col.label || col.field) as string
      }));

    // Card tablosundaki tüm alanlar (ID alanları hariç)
    const cardFields = cardTableColumns
      .filter((col) => col.field && !isIdField(col.field))
      .map((col) => ({
        Field: col.field,
        Name: (col.text || col.label || col.field) as string
      }));

    // Fix + FullName (hesaplanan) + Employee + Card alanları (tekrarsız)
    const seen = new Set<string>(['Fix', 'FullName']);
    const baseFields: Array<{ Field: string; Name: string }> = [
      { Field: 'Fix', Name: 'Fix' },
      { Field: 'FullName', Name: 'Ad Soyad' },
      ...employeeFields.filter((f) => {
        if (seen.has(f.Field)) return false;
        seen.add(f.Field);
        return true;
      }),
      ...cardFields.filter((f) => {
        if (seen.has(f.Field)) return false;
        seen.add(f.Field);
        return true;
      })
    ];

    // Özel alan tanımları: api/CustomFieldSettings'ten ayarları al, sonra custom field listesini oluştur
    this.http.post<any>(`${apiUrl}/api/CustomFieldSettings`, {
      limit: -1,
      offset: 0
    }).pipe(
      catchError(() => of({ status: 'error' as const, records: [] as any[] })),
      map((res: any) => {
        const records = Array.isArray(res?.records) ? res.records : (res?.data || []);
        return records as Array<{ Field?: string; Text?: string; Name?: string; IsVisible?: boolean }>;
      }),
      map((settings) => {
        const prefix = 'Employee.CustomField.';
        const visibleSettings = settings.filter((s) => s.Field && s.IsVisible !== false);
        const customFields = visibleSettings.map((s, index) => ({
          Field: prefix + s.Field!,
          Name: (s.Text || s.Name || `Özel Alan ${index + 1}`).trim() || s.Field!
        }));
        if (customFields.length === 0) {
          return Array.from({ length: 20 }, (_, i) => ({
            Field: prefix + `CustomField${String(i + 1).padStart(2, '0')}`,
            Name: `Özel Alan ${i + 1}`
          }));
        }
        return customFields;
      })
    ).subscribe((customFields) => {
      this.fieldOptions = [...baseFields, ...customFields];
      this.cdr.markForCheck();
    });
  }

  loadTemplate(id: number): void {
    this.http.post<any>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/CardTemplates/form`, {
      request: {
        action: 'get',
        recid: id,
        name: 'EditCardTemplate'
      }
    }).subscribe({
      next: (response: any) => {
        // Handle different response formats
        let record = null;
        
        if (response.status === 'success' && response.record) {
          record = response.record;
        } else if (response.record) {
          record = response.record;
        } else if (response.Id || response.id || response.recid) {
          // Response is the record itself
          record = response;
        } else if (response.error === false && response.record) {
          record = response.record;
        }
        
        if (record) {
          // Handle different ID field names
          this.templateId = record.Id || record.id || record.recid || null;
          this.templateName = record.TemplateName || '';
          
          if (record.TemplateData) {
            try {
              const data = JSON.parse(record.TemplateData);
              this.initializeTemplate(data);
            } catch (e) {
              console.error('Error parsing template data:', e);
              this.toastr.error('Şablon verisi okunamadı.', 'Hata');
            }
          }
        } else {
          console.error('Unexpected response format:', response);
          this.toastr.error('Şablon yüklenirken beklenmeyen yanıt formatı alındı.', 'Hata');
        }
      },
      error: (error) => {
        console.error('Error loading template:', error);
        this.toastr.error('Şablon yüklenirken hata oluştu.', 'Hata');
      }
    });
  }

  initializeTemplate(data: any): void {
    // Set dimensions first
    if (data.FRONT) {
      const front = data.FRONT;
      if (front.width === '171mm' && front.height === '108mm') {
        this.pageType = '0'; // Yatay
      } else if (front.width === '108mm' && front.height === '171mm') {
        this.pageType = '1'; // Dikey
      } else {
        this.pageType = '2'; // Özel
        // Parse custom dimensions from template data
        const widthMm = parseFloat(front.width?.replace('mm', '') || '171');
        const heightMm = parseFloat(front.height?.replace('mm', '') || '108');
        this.width = widthMm / 2;
        this.height = heightMm / 2;
      }
      this.updatePageDimensions();
      
      // Initialize template data after dimensions are set (özel alan key'lerini prefix'li forma normalize et)
      const frontItems = this.normalizeTemplateItems(front.items);
      this.templateData.FRONT = {
        width: front.width,
        height: front.height,
        background: front.background || 'transparent',
        items: frontItems
      };
      
      // Load background
      if (front.background && front.background !== 'transparent') {
        this.setBackground('FRONT', front.background);
      }
      
      // Load items
      setTimeout(() => {
        this.loadItems('FRONT', frontItems);
      }, 100);
    }
    
    if (data.BACK) {
      const back = data.BACK;
      const backItems = this.normalizeTemplateItems(back.items);
      this.templateData.BACK = {
        width: back.width || this.templateData.FRONT.width,
        height: back.height || this.templateData.FRONT.height,
        background: back.background || 'transparent',
        items: backItems
      };
      
      if (back.background && back.background !== 'transparent') {
        this.setBackground('BACK', back.background);
      }
      setTimeout(() => {
        this.loadItems('BACK', backItems);
      }, 200);
    } else if (data.SIDE === 'SINGLE') {
      this.designType = 'SINGLE';
      delete this.templateData.BACK;
    }
  }

  loadItems(side: 'FRONT' | 'BACK', items: { [key: string]: TemplateItem }): void {
    const container = side === 'FRONT' ? this.frontContainerRef?.nativeElement : this.backContainerRef?.nativeElement;
    if (!container) return;
    
    Object.keys(items).forEach(itemId => {
      const item = items[itemId];
      this.createItemElement(side, item);
    });
  }

  createItemElement(side: 'FRONT' | 'BACK', item: TemplateItem): void {
    const container = side === 'FRONT' ? this.frontContainerRef?.nativeElement : this.backContainerRef?.nativeElement;
    if (!container) return;
    
    if (item.type === 'fix' || item.type === 'label') {
      this.createTextElement(container, item, side);
    } else if (item.type === 'image' || item.type === 'imagefix') {
      this.createImageElement(container, item, side);
    } else if (item.type === 'barcode') {
      this.createBarcodeElement(container, item, side);
    }
  }

  createTextElement(container: HTMLDivElement, item: TemplateItem, side: 'FRONT' | 'BACK'): void {
    const label = document.createElement('label');
    label.id = item.id;
    const displayText = item.type === 'fix' ? (item.field || '') : (this.getFieldDisplayName(item.field) || item.field || '');
    label.textContent = displayText;
    label.style.display = 'inline-block';
    label.style.color = item.color || '#000000';
    label.style.fontSize = `${item.fontsize || 5}mm`;
    label.style.width = `${item.lwidth || 20}mm`;
    label.style.border = '1px dashed white';
    label.style.padding = '0px';
    label.style.position = 'absolute';
    label.style.top = `${item.top}mm`;
    label.style.left = `${item.left}mm`;
    label.style.textAlign = item.textAlign || 'left';
    label.style.fontFamily = item.fontFamily || 'Special';
    label.style.textTransform = item.textTransform || 'none';
    label.style.fontWeight = item.fontWeight || '400';
    label.style.cursor = 'move';
    
    // Make draggable (using mouse events)
    this.makeDraggable(label, side);
    
    // Double click to delete
    label.addEventListener('dblclick', () => {
      this.deleteItem(item.id, side);
    });
    
    // Click to select
    label.addEventListener('click', () => {
      this.selectItem(item.id, side);
    });
    
    container.appendChild(label);
  }

  createImageElement(container: HTMLDivElement, item: TemplateItem, side: 'FRONT' | 'BACK'): void {
    const img = document.createElement('img');
    img.id = item.id;
    img.src = item.src || 'https://restapi.aku.edu.tr/images/avatar.png';
    img.style.position = 'absolute';
    img.style.top = `${item.top}mm`;
    img.style.left = `${item.left}mm`;
    img.style.width = item.width || '20mm';
    img.style.height = item.height || '20mm';
    img.style.objectFit = item.objectFit || 'fill';
    img.style.borderRadius = item.borderRadius || '0mm';
    img.style.cursor = 'move';
    img.style.border = '1px solid white';
    
    this.makeDraggable(img, side);
    
    img.addEventListener('dblclick', () => {
      this.deleteItem(item.id, side);
    });
    
    img.addEventListener('click', () => {
      this.selectItem(item.id, side);
    });
    
    container.appendChild(img);
  }

  /** QR kodunu img elementine veya img içeren containera uygular */
  private setQrCodeOnElement(el: HTMLElement, text: string): void {
    const img = el.tagName === 'IMG' ? el as HTMLImageElement : el.querySelector('img');
    if (!img) return;
    const value = (text || ' ').toString().trim() || ' ';
    QRCode.toDataURL(value, { margin: 1, width: 200, errorCorrectionLevel: 'M' })
      .then((url: string) => { img.src = url; })
      .catch(() => { img.src = ''; });
  }

  createBarcodeElement(container: HTMLDivElement, item: TemplateItem, side: 'FRONT' | 'BACK'): void {
    const wrapper = document.createElement('div');
    wrapper.id = item.id;
    wrapper.style.position = 'absolute';
    wrapper.style.top = `${item.top}mm`;
    wrapper.style.left = `${item.left}mm`;
    wrapper.style.width = item.width || '20mm';
    wrapper.style.height = item.height || '20mm';
    wrapper.style.border = '1px dashed white';
    wrapper.style.cursor = 'move';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'center';
    wrapper.style.overflow = 'hidden';

    const img = document.createElement('img');
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';

    const cardData = this.getForWriteData ? this.buildCardDataFromGetForWrite(this.getForWriteData) : null;
    const value = cardData ? this.getFieldValueFromCardData(cardData, item.field) : null;
    const textToEncode = value || item.field || ' ';

    QRCode.toDataURL(textToEncode, { margin: 1, width: 200, errorCorrectionLevel: 'M' })
      .then((url: string) => { img.src = url; })
      .catch(() => { img.alt = 'QR: ' + (this.getFieldDisplayName(item.field) || item.field); });

    wrapper.appendChild(img);

    this.makeDraggable(wrapper, side);

    wrapper.addEventListener('dblclick', () => {
      this.deleteItem(item.id, side);
    });

    wrapper.addEventListener('click', () => {
      this.selectItem(item.id, side);
    });

    container.appendChild(wrapper);
  }

  makeDraggable(element: HTMLElement, side: 'FRONT' | 'BACK'): void {
    let isDragging = false;
    let hasMouseDown = false;
    let startX = 0;
    let startY = 0;
    let offsetX = 0;
    let offsetY = 0;

    const onMouseMove = (e: MouseEvent) => {
      // Only process if mousedown was triggered
      if (!hasMouseDown) return;
      
      // Check if mouse has moved enough to start dragging
      if (!isDragging && !this.isDragging) {
        const deltaX = Math.abs(e.clientX - startX);
        const deltaY = Math.abs(e.clientY - startY);
        if (deltaX > 3 || deltaY > 3) {
          isDragging = true;
          this.isDragging = true;
        }
      }
      
      if (!isDragging || !this.isDragging) return;
      
      const container = side === 'FRONT' ? this.frontContainerRef?.nativeElement : this.backContainerRef?.nativeElement;
      const containerRect = container?.getBoundingClientRect();
      
      if (containerRect) {
        // Calculate new position: mouse position minus offset (both in container coordinates)
        const mouseXInContainer = e.clientX - containerRect.left;
        const mouseYInContainer = e.clientY - containerRect.top;
        const newXInContainer = mouseXInContainer - offsetX;
        const newYInContainer = mouseYInContainer - offsetY;
        
        // Convert px to mm
        const mmPerPx = this.getMmPerPx();
        const newLeftMm = Math.max(0, this.pxToMm(newXInContainer));
        const newTopMm = Math.max(0, this.pxToMm(newYInContainer));
        
        //console.log('mousemove - clientX:', e.clientX, 'clientY:', e.clientY, 'offsetX:', offsetX, 'offsetY:', offsetY, 'mouseXInContainer:', mouseXInContainer, 'mouseYInContainer:', mouseYInContainer, 'newXInContainer:', newXInContainer, 'newYInContainer:', newYInContainer, 'newLeftMm:', newLeftMm, 'newTopMm:', newTopMm, 'containerRect.left:', containerRect.left, 'containerRect.top:', containerRect.top);
        
        // Update element position
        element.style.left = `${newLeftMm}mm`;
        element.style.top = `${newTopMm}mm`;
        
        // Update data
        const itemId = element.id;
        if (this.templateData[side]?.items?.[itemId]) {
          this.templateData[side]!.items[itemId].left = newLeftMm;
          this.templateData[side]!.items[itemId].top = newTopMm;
        }
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (hasMouseDown) {
        if (isDragging) {
          isDragging = false;
          this.isDragging = false;
        }
        hasMouseDown = false;
      }
    };

    element.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      
      hasMouseDown = true;
      isDragging = false;
      this.isDragging = false;
      startX = e.clientX;
      startY = e.clientY;
      
      const container = side === 'FRONT' ? this.frontContainerRef?.nativeElement : this.backContainerRef?.nativeElement;
      const containerRect = container?.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      
      if (containerRect && elementRect) {
        // Get element's current position from templateData (in mm)
        const itemId = element.id;
        const item = this.templateData[side]?.items?.[itemId];
        let elementLeftPx = elementRect.left - containerRect.left;
        let elementTopPx = elementRect.top - containerRect.top;
        
        // If we have item data, use it for more accurate position
        if (item && item.left !== undefined && item.top !== undefined) {
          elementLeftPx = this.mmToPx(item.left);
          elementTopPx = this.mmToPx(item.top);
        }
        
        // Calculate offset from mouse click point to element's top-left corner
        // Both mouse and element positions relative to container
        const mouseXInContainer = e.clientX - containerRect.left;
        const mouseYInContainer = e.clientY - containerRect.top;
        offsetX = mouseXInContainer - elementLeftPx;
        offsetY = mouseYInContainer - elementTopPx;
        //console.log('mousedown - offsetX:', offsetX, 'offsetY:', offsetY, 'clientX:', e.clientX, 'clientY:', e.clientY, 'elementRect.left:', elementRect.left, 'elementRect.top:', elementRect.top, 'containerRect.left:', containerRect.left, 'containerRect.top:', containerRect.top, 'mouseXInContainer:', mouseXInContainer, 'mouseYInContainer:', mouseYInContainer, 'elementLeftPx:', elementLeftPx, 'elementTopPx:', elementTopPx, 'item.left:', item?.left, 'item.top:', item?.top);
      }
      
      e.preventDefault();
    });

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  getMmPerPx(): number {
    // Approximate conversion: 1mm = 3.7795275591px at 96dpi
    // With scale factor of 2 (as in original code)
    return 3.7795275591 * 2;
  }

  mmToPx(mm: number): number {
    return mm * this.getMmPerPx();
  }

  pxToMm(px: number): number {
    return px / this.getMmPerPx();
  }

  selectItem(itemId: string, side: 'FRONT' | 'BACK'): void {
    if (this.selectedItemId === itemId) {
      // Deselect
      this.selectedItemId = null;
      this.clearSelection();
      return;
    }
    
    this.selectedItemId = itemId;
    this.clearSelection();
    
    const item = this.templateData[side]?.items[itemId];
    const element = document.getElementById(itemId);
    if (element) {
      if (element.tagName === 'LABEL') {
        element.style.borderColor = 'red';
        this.loadItemProperties(itemId, side);
      } else if (item?.type === 'barcode') {
        element.style.border = '2px solid red';
        this.loadBarcodeProperties(itemId, side);
      } else {
        element.style.border = '2px solid red';
        this.loadImageProperties(itemId, side);
      }
    }
  }

  clearSelection(): void {
    const containers = [this.frontContainerRef?.nativeElement, this.backContainerRef?.nativeElement];
    containers.forEach(container => {
      if (container) {
        const items = container.querySelectorAll('label, img, div[id^="item"]');
        items.forEach(item => {
          if (item instanceof HTMLElement) {
            if (item.tagName === 'LABEL') {
              item.style.borderColor = 'white';
            } else {
              item.style.border = '1px solid white';
            }
          }
        });
      }
    });
  }

  loadItemProperties(itemId: string, side: 'FRONT' | 'BACK'): void {
    const item = this.templateData[side]?.items[itemId];
    if (!item) return;
    
    if (item.type === 'fix') {
      this.contentType = '0';
      this.field = 'Fix';
      this.fixText = item.field;
    } else {
      this.contentType = '0';
      this.field = item.field;
      this.fixText = '';
    }
    
    this.fontFamily = item.fontFamily || 'Special';
    this.textTransform = item.textTransform || 'none';
    this.fontWeight = item.fontWeight || '500';
    this.textColor = item.color || '#000000';
    // fontsize is stored as 2x, so divide by 2 when loading
    this.fontSize = (item.fontsize || 10) / 2;
    // lwidth is stored as 2x, so divide by 2 when loading
    this.textWidth = (item.lwidth || 40) / 2;
    this.textAlign = item.textAlign || 'left';
  }

  loadImageProperties(itemId: string, side: 'FRONT' | 'BACK'): void {
    const item = this.templateData[side]?.items[itemId];
    if (!item) return;
    
    if (item.type === 'image') {
      this.contentType = '1';
    } else {
      this.contentType = '4';
    }
    
    this.imageWidth = parseFloat(item.width?.replace('mm', '') || '20') / 2;
    this.imageHeight = parseFloat(item.height?.replace('mm', '') || '20') / 2;
    this.objectFit = item.objectFit || 'fill';
    this.borderRadius = item.borderRadius || '0mm';
  }

  loadBarcodeProperties(itemId: string, side: 'FRONT' | 'BACK'): void {
    const item = this.templateData[side]?.items[itemId];
    if (!item) return;
    
    this.contentType = '2';
    this.field = item.field || '';
    this.imageWidth = parseFloat(item.width?.replace('mm', '') || '20') / 2;
    this.imageHeight = parseFloat(item.height?.replace('mm', '') || '20') / 2;
  }

  deleteItem(itemId: string, side: 'FRONT' | 'BACK'): void {
    const element = document.getElementById(itemId);
    if (element) {
      element.remove();
    }
    
    if (this.templateData[side]?.items?.[itemId]) {
      delete this.templateData[side]!.items[itemId];
    }
    
    if (this.selectedItemId === itemId) {
      this.selectedItemId = null;
    }
  }

  updatePageDimensions(): void {
    if (this.pageType === '0') {
      // Yatay
      this.width = 85.5;
      this.height = 54;
      this.templateData.FRONT.width = '171mm';
      this.templateData.FRONT.height = '108mm';
    } else if (this.pageType === '1') {
      // Dikey
      this.width = 54;
      this.height = 85.5;
      this.templateData.FRONT.width = '108mm';
      this.templateData.FRONT.height = '171mm';
    } else if (this.pageType === '2') {
      // Özel - Use current width and height values
      this.templateData.FRONT.width = `${this.width * 2}mm`;
      this.templateData.FRONT.height = `${this.height * 2}mm`;
    }
    
    // Sync BACK dimensions with FRONT
    if (this.templateData.BACK) {
      this.templateData.BACK.width = this.templateData.FRONT.width;
      this.templateData.BACK.height = this.templateData.FRONT.height;
    }
    
    this.updateContainerSize();
  }

  updateContainerSize(): void {
    // Update both containers' sizes
    if (this.frontContainerRef?.nativeElement && this.templateData.FRONT) {
      this.frontContainerRef.nativeElement.style.width = this.templateData.FRONT.width;
      this.frontContainerRef.nativeElement.style.height = this.templateData.FRONT.height;
    }
    
    if (this.backContainerRef?.nativeElement && this.templateData.BACK) {
      this.backContainerRef.nativeElement.style.width = this.templateData.BACK.width || this.templateData.FRONT.width;
      this.backContainerRef.nativeElement.style.height = this.templateData.BACK.height || this.templateData.FRONT.height;
    }
    
    // Update wrapper size
    if (this.wrapperRef?.nativeElement && this.templateData.FRONT) {
      this.wrapperRef.nativeElement.style.width = this.templateData.FRONT.width;
      this.wrapperRef.nativeElement.style.height = this.templateData.FRONT.height;
    }
  }

  onPageTypeChange(): void {
    this.updatePageDimensions();
  }

  onDesignTypeChange(): void {
    if (this.designType === 'SINGLE') {
      delete this.templateData.BACK;
      this.designDirection = 'FRONT';
    } else {
      this.templateData.BACK = {
        width: this.templateData.FRONT.width,
        height: this.templateData.FRONT.height,
        background: 'transparent',
        items: {}
      };
    }
    this.updateContainerSize();
    this.cdr.markForCheck();
  }

  onDesignDirectionChange(): void {
    // Update container size and clear selection immediately
    this.updateContainerSize();
    this.clearSelection();
    this.selectedItemId = null;
    this.cdr.markForCheck();
  }

  onWidthChange(): void {
    this.templateData.FRONT.width = `${this.width * 2}mm`;
    if (this.templateData.BACK) {
      this.templateData.BACK.width = this.templateData.FRONT.width;
    }
    this.updateContainerSize();
  }

  onHeightChange(): void {
    this.templateData.FRONT.height = `${this.height * 2}mm`;
    if (this.templateData.BACK) {
      this.templateData.BACK.height = this.templateData.FRONT.height;
    }
    this.updateContainerSize();
  }

  onContentTypeChange(): void {
    this.applyChangesToSelected();
  }

  /** İçerik panelindeki değişiklik seçili nesneye anlık uygulanır */
  applyChangesToSelected(): void {
    if (this.selectedItemId) {
      this.updateSelectedItem(true);
    }
  }

  onFieldChange(): void {
    this.applyChangesToSelected();
  }

  addItem(): void {
    if (this.selectedItemId && this.selectedItemId !== null) {
      // Update existing item
      this.updateSelectedItem();
      return;
    }
    
    const side = this.designDirection;
    
    // Ensure templateData[side] exists
    if (!this.templateData[side]) {
      if (side === 'FRONT') {
        this.templateData.FRONT = {
          width: this.templateData.FRONT?.width || '171mm',
          height: this.templateData.FRONT?.height || '108mm',
          background: 'transparent',
          items: {}
        };
      } else {
        this.templateData.BACK = {
          width: this.templateData.FRONT.width,
          height: this.templateData.FRONT.height,
          background: 'transparent',
          items: {}
        };
      }
    }
    
    const randomId = 'item' + Math.floor(Math.random() * 1000000000);
    const container = side === 'FRONT' 
      ? this.frontContainerRef?.nativeElement 
      : this.backContainerRef?.nativeElement;
    
    if (!container) return;
    
    let item: TemplateItem;
    
    if (this.contentType === '0') {
      // Text
      const fieldValue = this.field === 'Fix' ? this.fixText : this.field;
      item = {
        id: randomId,
        type: this.field === 'Fix' ? 'fix' : 'label',
        field: fieldValue,
        top: 0,
        left: 0,
        color: this.textColor,
        fontsize: this.fontSize * 2,
        fontFamily: this.fontFamily,
        textTransform: this.textTransform,
        lwidth: this.textWidth * 2,
        textAlign: this.textAlign,
        fontWeight: this.fontWeight
      };
      
      if (this.templateData[side]) {
        if (!this.templateData[side].items) {
          this.templateData[side].items = {};
        }
        this.templateData[side].items[randomId] = item;
      }
      this.createTextElement(container, item, side);
      this.refreshPreviewIfCardSelected();
    } else if (this.contentType === '1' || this.contentType === '4') {
      // Image
      const file = this.sampleImgInputRef?.nativeElement?.files?.[0];
      if (!file && this.contentType === '1') {
        this.toastr.warning('Lütfen bir resim seçin.', 'Uyarı');
        return;
      }
      
      if (file) {
        this.fileToBase64(file).then(src => {
          item = {
            id: randomId,
            type: this.contentType === '1' ? 'image' : 'imagefix',
            field: this.contentType === '1' ? 'PictureId' : 'Fix',
            top: 0,
            left: 0,
            width: `${this.imageWidth * 2}mm`,
            height: `${this.imageHeight * 2}mm`,
            objectFit: this.objectFit,
            borderRadius: this.borderRadius,
            src: this.contentType === '4' ? src : undefined
          };
          
          if (this.templateData[side]) {
            if (!this.templateData[side].items) {
              this.templateData[side].items = {};
            }
            this.templateData[side].items[randomId] = item;
          }
          this.createImageElement(container, item, side);
          if (this.contentType === '4' && item.src) {
            const img = document.getElementById(randomId) as HTMLImageElement;
            if (img) img.src = item.src;
          }
          this.refreshPreviewIfCardSelected();
        });
      }
    } else if (this.contentType === '2') {
      // Barcode
      item = {
        id: randomId,
        type: 'barcode',
        field: this.field,
        top: 0,
        left: 0,
        width: `${this.imageWidth * 2}mm`,
        height: `${this.imageHeight * 2}mm`
      };
      
      if (this.templateData[side]) {
        if (!this.templateData[side].items) {
          this.templateData[side].items = {};
        }
        this.templateData[side].items[randomId] = item;
      }
      this.createBarcodeElement(container, item, side);
      this.refreshPreviewIfCardSelected();
    }
  }

  /** Seçili kart varsa önizlemeyi CardData ile günceller */
  private refreshPreviewIfCardSelected(): void {
    if (this.getForWriteData) {
      const cardData = this.buildCardDataFromGetForWrite(this.getForWriteData);
      this.refreshPreviewWithCardData(cardData);
    }
  }

  /** @param keepSelection true ise seçim korunur (anlık düzenleme için) */
  updateSelectedItem(keepSelection = false): void {
    if (!this.selectedItemId) return;
    
    const side = this.designDirection;
    const item = this.templateData[side]?.items[this.selectedItemId];
    if (!item) return;
    
    if (item.type === 'fix' || item.type === 'label') {
      item.field = this.field === 'Fix' ? this.fixText : this.field;
      item.color = this.textColor;
      item.fontsize = this.fontSize * 2;
      item.fontFamily = this.fontFamily;
      item.textTransform = this.textTransform;
      item.lwidth = this.textWidth * 2;
      item.textAlign = this.textAlign;
      item.fontWeight = this.fontWeight;
      
      const element = document.getElementById(this.selectedItemId) as HTMLLabelElement;
      if (element) {
        const displayText = item.type === 'fix' ? item.field : (this.getFieldDisplayName(item.field) || item.field);
        element.textContent = displayText;
        element.style.color = item.color;
        element.style.fontSize = `${item.fontsize}mm`;
        element.style.width = `${item.lwidth}mm`;
        element.style.textAlign = item.textAlign;
        element.style.fontFamily = item.fontFamily;
        element.style.textTransform = item.textTransform;
        element.style.fontWeight = item.fontWeight;
      }
    } else if (item.type === 'image' || item.type === 'imagefix') {
      item.width = `${this.imageWidth * 2}mm`;
      item.height = `${this.imageHeight * 2}mm`;
      item.objectFit = this.objectFit;
      item.borderRadius = this.borderRadius;
      
      const element = document.getElementById(this.selectedItemId) as HTMLImageElement;
      if (element) {
        element.style.width = item.width;
        element.style.height = item.height;
        element.style.objectFit = item.objectFit;
        element.style.borderRadius = item.borderRadius;
      }
      
      const file = this.sampleImgInputRef?.nativeElement?.files?.[0];
      if (file && this.contentType === '4') {
        this.fileToBase64(file).then(src => {
          item.src = src;
          if (element) element.src = src;
        });
      }
    } else if (item.type === 'barcode') {
      item.width = `${this.imageWidth * 2}mm`;
      item.height = `${this.imageHeight * 2}mm`;
      item.field = this.field;
      
      const element = document.getElementById(this.selectedItemId) as HTMLDivElement;
      if (element) {
        element.style.width = item.width;
        element.style.height = item.height;
      }
    }
    
    this.refreshPreviewIfCardSelected();
    if (!keepSelection) {
      this.selectedItemId = null;
      this.clearSelection();
    }
    this.cdr.markForCheck();
  }

  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  selectBackgroundImage(): void {
    this.fileInputRef?.nativeElement?.click();
  }

  onBackgroundImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    
    this.fileToBase64(file).then(base64 => {
      this.setBackground(this.designDirection, base64);
      input.value = '';
    });
  }

  setBackground(side: 'FRONT' | 'BACK', base64: string): void {
    if (this.templateData[side]) {
      this.templateData[side].background = base64;
    }
    const container = side === 'FRONT' 
      ? this.frontContainerRef?.nativeElement 
      : this.backContainerRef?.nativeElement;
    
    if (container) {
      container.style.backgroundImage = `url('${base64}')`;
      container.style.backgroundSize = 'cover';
      container.style.backgroundPosition = 'center';
    }
  }

  removeBackground(): void {
    if (this.templateData[this.designDirection]) {
      this.templateData[this.designDirection]!.background = 'transparent';
    }
    const container = this.designDirection === 'FRONT' 
      ? this.frontContainerRef?.nativeElement 
      : this.backContainerRef?.nativeElement;
    
    if (container) {
      container.style.backgroundImage = 'none';
    }
  }

  saveTemplate(): void {
    if (!this.templateName.trim()) {
      this.toastr.warning('Lütfen şablon adı giriniz.', 'Uyarı');
      return;
    }
    
    const frontItems = Object.keys(this.templateData.FRONT.items || {});
    const backItems = this.templateData.BACK ? Object.keys(this.templateData.BACK.items || {}) : [];
    
    if (frontItems.length === 0 && backItems.length === 0) {
      this.toastr.warning('Boş şablon oluşturulamaz.', 'Uyarı');
      return;
    }
    
    // Prepare template data
    let saveData: any = {
      FRONT: {
        ...this.templateData.FRONT,
        width: this.templateData.FRONT.width,
        height: this.templateData.FRONT.height
      }
    };
    
    if (this.designType === 'MULTI' && this.templateData.BACK) {
      saveData.BACK = {
        ...this.templateData.BACK,
        width: this.templateData.FRONT.width,
        height: this.templateData.FRONT.height
      };
    } else {
      saveData.SIDE = 'SINGLE';
    }
    
    const templateDataJson = JSON.stringify(saveData);
    
    // Save to API
    this.http.post<any>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/CardTemplates/form`, {
      request: {
        action: 'save',
        recid: this.templateId || null,
        name: this.templateId ? 'EditCardTemplate' : 'AddCardTemplate',
        record: {
          TemplateName: this.templateName,
          TemplateData: templateDataJson
        }
      }
    }).subscribe({
      next: (response: any) => {
        if (response.error === false || response.status === 'success') {
          this.toastr.success('Şablon başarıyla kaydedildi.', 'Başarılı');
          setTimeout(() => {
            this.router.navigate(['/CardTemplates']);
          }, 1000);
        } else {
          this.toastr.error(response.message || 'Şablon kaydedilirken hata oluştu.', 'Hata');
        }
      },
      error: (error) => {
        console.error('Error saving template:', error);
        this.toastr.error('Şablon kaydedilirken hata oluştu.', 'Hata');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/CardTemplates']);
  }
}
