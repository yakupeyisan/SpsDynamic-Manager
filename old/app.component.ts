import { Component, ViewChild, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonComponent } from './components/button/button.component';
import { InputComponent } from './components/input/input.component';
import { ToggleComponent } from './components/toggle/toggle.component';
import { SelectComponent, SelectOption } from './components/select/select.component';
import { ModalComponent } from './components/modal/modal.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { TabItemComponent } from './components/tabs/tab-item.component';
import { DataTableComponent, TableColumn, ToolbarConfig, JoinOption, ColumnType, FormTab, FormTabGrid } from './components/data-table/data-table.component';
import { FormComponent } from './components/form/form.component';
import { FormFieldComponent } from './components/form/form-field.component';
import { FormGroupComponent } from './components/form/form-group.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { DataService } from './services/data.service';
import { LoadingService } from './services/loading.service';
import { Observable, of } from 'rxjs';
import { map, catchError, finalize } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { GridResponse } from './components/data-table/data-table.component';
import { AdvancedFilter } from './components/data-table/filter.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    InputComponent,
    ToggleComponent,
    SelectComponent,
    ModalComponent,
    TabsComponent,
    TabItemComponent,
    DataTableComponent,
    FormComponent,
    FormFieldComponent,
    FormGroupComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  // EmployeeCardGrid toolbar button handlers
  onCardFormat(event: MouseEvent, item: any) {
    console.log('Formatla clicked', event, item);
    // TODO: Formatla işlemi - seçili kartları formatla
    // Seçili kartları al ve formatla API'sine gönder
  }

  onCardTransfer(event: MouseEvent, item: any) {
    console.log('Transfer clicked', event, item);
    // TODO: Transfer işlemi - seçili kartları transfer et
    // Seçili kartları al ve transfer API'sine gönder
  }

  onCardReset(event: MouseEvent, item: any) {
    console.log('Sıfırla clicked', event, item);
    // TODO: Sıfırla işlemi - seçili kartları sıfırla
    // Seçili kartları al ve sıfırla API'sine gönder
  }

  // İşlemler menü handler metodları
  onBulkAccessPermission(event: MouseEvent, item: any) {
    console.log('Toplu Geçiş Yetkisi Tanımlama', event, item);
    // TODO: Toplu geçiş yetkisi tanımlama işlemi
  }

  onBulkCompany(event: MouseEvent, item: any) {
    console.log('Toplu Firma Tanımlama', event, item);
    // TODO: Toplu firma tanımlama işlemi
  }

  onBulkPosition(event: MouseEvent, item: any) {
    console.log('Toplu Kadro Tanımlama', event, item);
    // TODO: Toplu kadro tanımlama işlemi
  }

  onBulkDepartment(event: MouseEvent, item: any) {
    console.log('Toplu Bölüm Tanımlama', event, item);
    // TODO: Toplu bölüm tanımlama işlemi
  }

  onBulkSms(event: MouseEvent, item: any) {
    console.log('Toplu Sms Gönderme', event, item);
    // TODO: Toplu SMS gönderme işlemi
  }

  onBulkMail(event: MouseEvent, item: any) {
    console.log('Toplu Mail Gönderme', event, item);
    // TODO: Toplu mail gönderme işlemi
  }

  onImportFromExcel(event: MouseEvent, item: any) {
    console.log('Excelden Kişi Aktarma', event, item);
    // TODO: Excelden kişi aktarma işlemi
  }

  onBulkImageUpload(event: MouseEvent, item: any) {
    console.log('Toplu Resim Aktarma', event, item);
    // TODO: Toplu resim aktarma işlemi
  }

  onBulkWebClient(event: MouseEvent, item: any) {
    console.log('Toplu Web Client Erişim Tanımla', event, item);
    // TODO: Toplu web client erişim tanımlama işlemi
  }

  onBulkPasswordReset(event: MouseEvent, item: any) {
    console.log('Toplu Şifre Sıfırla', event, item);
    // TODO: Toplu şifre sıfırlama işlemi
  }

  onExportToExcel(event: MouseEvent, item: any) {
    console.log('Excele Aktar', event, item);
    // TODO: Excele aktarma işlemi
  }

  get loading$(): Observable<boolean> {
    return this.loadingService.loading$;
  }

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    public loadingService: LoadingService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService
  ) {
    this.createForm();
    // Set default language
    this.translate.setDefaultLang('tr');
    this.translate.use('tr');
  }
  
  title = 'Modern UI Library - Demo';
  
  // Data source function for table from service (w2ui compatible)
  tableDataSource!: (params: {
    page?: number;
    limit?: number;
    search?: AdvancedFilter | null;
    searchLogic?: 'AND' | 'OR';
    sort?: { field: string; direction: 'asc' | 'desc' };
    join?: { [key: string]: boolean | { [key: string]: boolean } };
    showDeleted?: boolean;
  }) => Observable<GridResponse>;
  
  
  // Modal
  showModal = false;
  
  // Input
  inputValue = '';
  inputLabel = 'Sample Input';
  inputHelper = 'This is a helper text';
  
  // Toggle
  toggleValue = false;
  
  // Select
  selectValue: any = null;
  selectOptions: SelectOption[] = [
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' },
    { label: 'Option 3', value: 'opt3', disabled: true },
    { label: 'Option 4', value: 'opt4' }
  ];
  
  // Tabs
  activeTabDefault = 0;
  activeTabPills = 0;
  
  // Join Options for Data Table
  // default: true olanlar ilk kullanımda otomatik seçilir
  // Kullanıcı özelleştirme yaparsa, kullanıcının ayarları geçerli olur
  joinOptions: JoinOption[] = [
    { key: 'Company', label: 'Firma', nested: false, default: true },
    { key: 'Kadro', label: 'Kadro', nested: false, default: true },
    { key: 'Department', label: 'Departman', nested: false, default: true }, // EmployeeDepartments is intermediate table, not shown as checkbox
    { key: 'AccessGroup', label: 'Erişim Grubu', nested: false, default: true },
    { key: 'CustomField', label: 'Özel Alan', nested: false, default: true },
    { key: 'WebClient', label: 'Kişisel Panel Yetkisi', nested: false, default: false },
    { key: 'WebAdmin', label: 'Yönetim Paneli Yetkisi', nested: false, default: false }
  ];
  
  // Custom form fields for add/edit form
  formFields: TableColumn[] = [
    { field: 'Name', label: 'Ad', text: 'Ad', type: 'text' },
    { field: 'SurName', label: 'Soyad', text: 'Soyad', type: 'text' },
    { field: 'IdentificationNumber', label: 'TC Kimlik', text: 'TC Kimlik', type: 'text' },
    { field: 'Gender', label: 'Cinsiyet', text: 'Cinsiyet', type: 'enum', options: [
      { label: 'Erkek', value: 'M' },
      { label: 'Kadın', value: 'F' }
    ]},
    { field: 'Mail', label: 'Mail', text: 'Mail', type: 'text' },
    { field: 'MobilePhone1', label: 'Mobil Telefonu 1', text: 'Mobil Telefonu 1', type: 'text' },
    { field: 'MobilePhone2', label: 'Mobil Telefonu 2', text: 'Mobil Telefonu 2', type: 'text' },
    { field: 'HomePhone', label: 'Ev Telefonu', text: 'Ev Telefonu', type: 'text' },
    { field: 'CompanyPhone', label: 'İş Telefonu', text: 'İş Telefonu', type: 'text' },
    { field: 'RelativeName', label: 'Yakın Bilgisi', text: 'Yakın Bilgisi', type: 'text' },
    { field: 'RelativeMobilePhone1', label: 'Yakın Telefonu 1', text: 'Yakın Telefonu 1', type: 'text' },
    { field: 'RelativeMobilePhone2', label: 'Yakın Telefonu 2', text: 'Yakın Telefonu 2', type: 'text' },
    { field: 'Address', label: 'Adres', text: 'Adres', type: 'text' },
    { field: 'City', label: 'Şehir', text: 'Şehir', type: 'text' },
    { field: 'Company', label: 'Firma', text: 'Firma', type: 'list', load: {
      url: 'http://localhost/api/PdksCompanys',
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        return data.records.map((item: any) => ({
          id: item.PdksCompanyID,
          text: item.PdksCompanyName
        }));
      }
    }},
    { field: 'Kadro', label: 'Kadro', text: 'Kadro', type: 'list', load: {
      url: 'http://localhost/api/PdksStaffs',
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        return data.records.map((item: any) => ({
          id: item.ID,
          text: item.Name
        }));
      }
    }},
    { field: 'Department', label: 'Departman', text: 'Departman', type: 'enum',     load: {
      url: 'http://localhost/api/Departments',
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        return data.records.map((item: any) => ({
          id: item.DepartmentID,
          text: item.DepartmentName
        }));
      }
    }},
    { field: 'Banned', label: 'Tüm sistemde engellenensin mi?', text: 'Tüm sistemde engellenensin mi?', type: 'checkbox', fullWidth: true },
    { field: 'BannedMsg', label: 'Engellenme Mesajı', text: 'Engellenme Mesajı', type: 'textarea', fullWidth: true },
    { field: 'AccessGroup', label: 'Erişim Grubu', text: 'Erişim Grubu', type: 'enum',     load: {
      url: 'http://localhost/api/AccessGroups',
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        return data.records.map((item: any) => ({
          id: item.AccessGroupID || item.Id,
          text: item.AccessGroupName || item.Name
        }));
      }
    }},
    { field: 'WebClient', label: 'Web İstemci', text: 'Web İstemci', type: 'checkbox' },
    { field: 'WebAdmin', label: 'Web Admin', text: 'Web Admin', type: 'checkbox' },
    { field: 'WebClientAuthorizationId', label: 'Web İstemci Yetki', text: 'Web İstemci Yetki', type: 'list', load: {
      url: 'http://localhost/api/Authorizations',
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        return data.records.map((item: any) => ({
          id: item.Id,
          text: item.Name
        }));
      }
    }},
    { field: 'AuthorizationId', label: 'Yetki', text: 'Yetki', type: 'list', load: {
      url: 'http://localhost/api/Authorizations',
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        return data.records.map((item: any) => ({
          id: item.Id,
          text: item.Name
        }));
      }
    }},
    { field: 'IsVisitor', label: 'Ziyaretçi', text: 'Ziyaretçi', type: 'checkbox' },
    { field: 'Notes', label: 'Not', text: 'Not', type: 'text' },
    // CustomField01-20
    ...Array.from({ length: 20 }, (_, i) => ({
      field: `CustomField${String(i + 1).padStart(2, '0')}`,
      label: `Özel Alan ${i + 1}`,
      text: `Özel Alan ${i + 1}`,
      type: 'text' as ColumnType,
    })),
    // Card related fields
    { field: 'Card', label: 'Kart', text: 'Kart', type: 'text' as ColumnType },
    { field: 'CardType', label: 'Kart Tipi', text: 'Kart Tipi', type: 'text' as ColumnType },
    // Puantaj fields
    { field: 'Scoring', label: 'Puantaj', text: 'Puantaj', type: 'checkbox' as ColumnType },
    //Kafeterya fields
    { field: 'CafeteriaStatus', label: 'Kafeterya Durumu', text: 'Kafeterya Durumu', type: 'checkbox' as ColumnType, fullWidth: true },
    { field: 'CafeteriaAccount', label: 'Kafeterya Hesabı', text: 'Kafeterya Hesabı', type: 'list', fullWidth: true, load: {
      url: 'http://localhost/api/CafeteriaAccounts',
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        return data.records.map((item: any) => ({
          id: item.ID,
          text: item.AccountName
        }));
      }
    }},
    //disabled  
    { field: 'TotalPrice', label: 'Toplam Fiyat', text: 'Toplam Fiyat', type: 'currency' as ColumnType, 
      fullWidth: true, disabled: true, currencyPrefix: '', currencySuffix: '₺', currencyPrecision: 2 },
      { field: 'SubscriptionCard', label: 'Abone Kartı', text: 'Abone Kartı', type: 'list' as ColumnType, 
        load: {
          url: 'http://localhost/api/Cards/GetCardsByEmployeeID',
          injectAuth: true,
          method: 'POST',
          data: (formData?: any) => {
            const employeeId = formData?.['EmployeeID'] || null;
            console.log('SubscriptionCard load data - employeeId:', employeeId, 'formData:', formData);
            return { 
              limit: -1, 
              offset: 0, 
              EmployeeID: employeeId 
            };
          },
          map: (data: any) => {
            return data.records ? data.records.map((item: any) => ({
              id: item.TagCode,
              text: item.TagCode + ' ' + item.CafeteriaGroup.CafeteriaGroupName + ' ' + (item.CardDesc ? ' - ' + item.CardDesc : '')
            })) : [];
          }
        }
      },
  ];
  
  // Form tabs configuration
  formTabs = [
    { 
      label: 'Kişi Bilgileri', 
      fields: ['Name', 'SurName', 'IdentificationNumber', 'Company', 'Kadro', 'Department'] 
    },
    { 
      label: 'Özlük Bilgileri', 
      fields: ['Gender', 'Mail', 'MobilePhone1', 'MobilePhone2', 'HomePhone', 'CompanyPhone', 
               'RelativeName', 'RelativeMobilePhone1', 'RelativeMobilePhone2', 'Address', 'City', 'Notes'] 
    },
    { 
      label: 'Özel Alanlar', 
      fields: Array.from({ length: 20 }, (_, i) => `CustomField${String(i + 1).padStart(2, '0')}`) 
    },
    { 
      label: 'Kişi Kartları', 
      grids: [{
        id: "EmployeeCardGrid",
        selectable: true,
        formFullscreen: false,
        formWidth: '700px',
        formHeight: '600px',
        recid: 'CardID',
        formFields: [
          { field: 'CardTypeID', label: 'CardTypeID', text: 'CardTypeID', type: 'list', required: true, load: {
            url: 'http://localhost/api/CardTypes',
            injectAuth: true,
            method: 'POST',
            data: { limit: -1, offset: 0 },
            map: (data: any) => {
              return data.records.map((item: any) => ({
                id: item.CardTypeID,
                text: item.CardType || item.CardTypeName || item.Name
              }));
            }
          }},
          { field: 'CafeteriaGroupID', label: 'Kafeterya Grup', text: 'Kafeterya Grup', type: 'list', load: {
            url: 'http://localhost/api/CafeteriaGroups',
            injectAuth: true,
            method: 'POST',
            data: { limit: -1, offset: 0 },
            map: (data: any) => {
              return data.records.map((item: any) => ({
                id: item.CafeteriaGroupID,
                text: item.CafeteriaGroupName || item.Name
              }));
            }
          }},
          { field: 'CardCodeType', label: 'Kart Kullanım Tipi', text: 'Kart Kullanım Tipi', type: 'list', load: {
            url: 'http://localhost/api/CardCodeTypes',
            injectAuth: true,
            method: 'POST',
            data: { limit: -1, offset: 0 },
            map: (data: any) => {
              return data.records ? data.records.map((item: any) => ({
                id: item.id,
                text: item.text
              })) : [
                { id: 'Wiegand26', text: 'Wiegand26' },
                { id: 'Wiegand34', text: 'Wiegand34' },
                { id: 'MIFARE', text: 'MIFARE' }
              ];
            }
          }},
          { field: 'CardStatusId', label: 'Kart Statü', text: 'Kart Statü', type: 'list', required: true, load: {
            url: 'http://localhost/api/CardStatuses',
            injectAuth: true,
            method: 'POST',
            data: { limit: -1, offset: 0 },
            map: (data: any) => {
              return data.records ? data.records.map((item: any) => ({
                id: item.Id,
                text: item.Name
              })) : [
              ];
            }
          }},
          { field: 'FacilityCode', label: 'FacilityCode', text: 'FacilityCode', type: 'text' },
          { field: 'CardCode', label: 'Kart Kodu', text: 'Kart Kodu', type: 'int' },
          { field: 'CardUID', label: 'CardUID', text: 'CardUID', type: 'text' },
          { field: 'Plate', label: 'Plaka', text: 'Plaka', type: 'text' },
          { field: 'CardDesc', label: 'Kart Açıklaması', text: 'Kart Açıklaması', type: 'textarea' },
          { field: 'Status', label: 'Durum', text: 'Durum', type: 'checkbox' },
        ] as TableColumn[],
        formLoadUrl: 'http://localhost/api/Cards/GetCardsByEmployeeID',
        formLoadRequest: (recid: any, parentFormData?: any) => {
          // Get EmployeeID from parent form data
          const employeeId = parentFormData?.['EmployeeID'] || null;
          console.log('Card formLoadRequest - recid:', recid, 'employeeId:', employeeId, 'parentFormData:', parentFormData);
          return {
            EmployeeID: employeeId
          };
        },
        onSave: (data: any, isEdit: boolean) => {
          const url = 'http://localhost/api/Cards/form';
          // Extract recid from data (CardID field)
          const recid = data.CardID || data.recid || null;
          // Remove recid from record data
          const { CardID, recid: _, ...record } = data;
          return this.http.post(url, {
            request: {
              action: 'save',
              recid: recid,
              name: 'EditEmployeeCard',
              record: record
            }
          });
        },
        toolbar: {
          items: [
            {
              id: 'formatla',
              type: 'button' as const,
              text: this.translate.instant('card.format'),
              tooltip: this.translate.instant('card.formatTooltip'),
              onClick: (event: MouseEvent, item: any) => {
                this.onCardFormat(event, item);
              }
            },
            {
              id: 'transfer',
              type: 'button' as const,
              text: this.translate.instant('card.transfer'),
              tooltip: this.translate.instant('card.transferTooltip'),
              onClick: (event: MouseEvent, item: any) => {
                this.onCardTransfer(event, item);
              }
            },
            {
              id: 'sifirla',
              type: 'button' as const,
              text: this.translate.instant('card.reset'),
              tooltip: this.translate.instant('card.resetTooltip'),
              onClick: (event: MouseEvent, item: any) => {
                this.onCardReset(event, item);
              }
            }
          ], // Custom toolbar items (empty means use default buttons from show flags)
          show: {
            reload: true,
            add: true,
            edit: true,
            delete: true,
            save: false
          }
        },
        data: (formData: any) => ({
          EmployeeID: formData.EmployeeID || formData.recid,
          limit: 100,
          offset: 0
        }),
        joinOptions: [
          { key: 'CardType', label: 'Kart Tipi', nested: true },
          { key: 'CafeteriaGroup', label: 'Kafeterya Grubu', nested: true }
        ] as JoinOption[]
      }]
    },
    { 
      label: 'Geçiş Kontrol', 
      fields: ['Banned', 'BannedMsg', 'AccessGroup'],
      grids: [{
        id: 'EmployeeAccessGroupReaders',
        selectable: false,
        formFullscreen: false,
        formWidth: '800px',
        formHeight: '600px',
        recid: 'AccessGroupReaderID',
        data: (formData: any) => {
          let accessGroups: number[] = [];
          
          if (formData && formData.AccessGroup) {
            if (Array.isArray(formData.AccessGroup)) {
              accessGroups = formData.AccessGroup.filter((id: any) => id != null);
            } else if (!Array.isArray(formData.AccessGroup)) {
              accessGroups = [formData.AccessGroup].filter((id: any) => id != null);
            }
          }
          
          console.log('EmployeeAccessGroupReaders data function - formData:', formData);
          console.log('EmployeeAccessGroupReaders data function - AccessGroup:', formData?.AccessGroup);
          console.log('EmployeeAccessGroupReaders data function - accessGroups:', accessGroups);
          
          return {
            limit: 100,
            offset: 0,
            AccessGroups: accessGroups
          };
        },
        toolbar: {
          items: [], // Custom toolbar items (empty means use default buttons from show flags)
          show: {
            reload: true,
            add: false,
            edit: false,
            delete: false,
            save: false
          }
        },
        joinOptions: [
          { key: 'AccessGroup', label: 'Erişim Grubu', nested: true },
          { key: 'Terminal', label: 'Terminal', nested: true }
        ] as JoinOption[]
      }] 
    },
    { 
      label: 'Puantaj', 
      fields: ['Scoring'],
      grids: [{
        id: 'EmployeeHistories',
        selectable: false,
        formFullscreen: false,
        formWidth: '800px',
        formHeight: '600px',
        recid: 'ID',
        data: (formData: any) => {
          return {
            limit: 100,
            offset: 0,
            EmployeeID: formData.EmployeeID || formData.recid
          };
        },
        toolbar: {
          items: [],
          show: {
            reload: true,
            add: false,
            edit: false,
            delete: false,
            save: false
          }
        }
      }]
    },
    { 
      label: 'Yetkiler', 
      fields: ['WebClient', 'WebAdmin', 'WebClientAuthorizationId', 'AuthorizationId'] 
    },
    { 
      label: 'Kafeterya', 
      fields: ['CafeteriaStatus', 'CafeteriaAccount','TotalPrice'] 
    },
    { 
      label: 'Abone',
      fields: ['SubscriptionCard'],
      grids: [{
        id: 'SubscriptionEvents',
        selectable: false,
        formFullscreen: false,
        formWidth: '800px',
        formHeight: '600px',
        recid: 'ID',
        data: (formData: any) => {
          const tagCode = formData?.SubscriptionCard || null;
          
          console.log('SubscriptionEvents data function - formData:', formData);
          console.log('SubscriptionEvents data function - TagCode:', tagCode);
          
          return {
            limit: 100,
            offset: 0,
            TagCode: tagCode
          };
        },
        toolbar: {
          items: [],
          show: {
            reload: true,
            add: false,
            edit: false,
            delete: false,
            save: false
          }
        },
        joinOptions: [
          { key: 'CafeteriaEvent', label: 'Kafeterya Olayı', nested: true },
          { key: 'CafeteriaApplication', label: 'Kafeterya Uygulaması', nested: true },
          { key: 'SubscriptionPackage', label: 'Abone Paketi', nested: true },
          { key: 'AccessZone', label: 'Erişim Bölgesi', nested: true }
        ] as JoinOption[]
      }]
    }
  ];
  
  // Form load URL
  formLoadUrl = 'http://localhost/api/Employees/form';
  
  // Form load request builder
  formLoadRequest = (recid: any) => ({
    action: 'get',
    recid: recid,
    name: 'EditEmployee'
  });
  
  // Form data mapper - maps API response to form data
  formDataMapper = (apiRecord: any) => {
    const formData: any = { ...apiRecord };
    
    // Map nested Company object to Company field
    if (apiRecord.Company && apiRecord.Company.PdksCompanyID) {
      formData['Company'] = apiRecord.Company.PdksCompanyID;
      formData['CompanyId'] = apiRecord.Company.PdksCompanyID;
    }
    
    // Map nested Kadro object to Kadro field
    if (apiRecord.Kadro && apiRecord.Kadro.ID) {
      formData['Kadro'] = apiRecord.Kadro.ID;
      formData['KadroId'] = apiRecord.Kadro.ID;
    }
    
    // Map EmployeeDepartments array to Department field
    if (apiRecord.EmployeeDepartments && Array.isArray(apiRecord.EmployeeDepartments)) {
      const departmentIds = apiRecord.EmployeeDepartments
        .map((ed: any) => ed.Department?.DepartmentID)
        .filter((id: any) => id != null);
      if (departmentIds.length > 0) {
        formData['Department'] = departmentIds;
      }
    }
    
    // Map EmployeeAccessGroups array to AccessGroup field
    if (apiRecord.EmployeeAccessGroups && Array.isArray(apiRecord.EmployeeAccessGroups)) {
      const accessGroupIds = apiRecord.EmployeeAccessGroups
        .map((eag: any) => eag.AccessGroup?.AccessGroupID)
        .filter((id: any) => id != null);
      if (accessGroupIds.length > 0) {
        formData['AccessGroup'] = accessGroupIds;
      }
    }
    
    // Map CustomField object to CustomField01-20 fields
    if (apiRecord.CustomField) {
      for (let i = 1; i <= 20; i++) {
        const fieldName = `CustomField${String(i).padStart(2, '0')}`;
        if (apiRecord.CustomField[fieldName] !== undefined) {
          formData[fieldName] = apiRecord.CustomField[fieldName];
        }
      }
    }
    
    // Map WebClientAuthorization to WebClientAuthorizationId
    if (apiRecord.WebClientAuthorization && apiRecord.WebClientAuthorization.Id) {
      formData['WebClientAuthorizationId'] = apiRecord.WebClientAuthorization.Id;
    }
    
    // Map Authorization to AuthorizationId
    if (apiRecord.Authorization && apiRecord.Authorization.Id) {
      formData['AuthorizationId'] = apiRecord.Authorization.Id;
    }
    
    return formData;
  };
  
  // Image upload URL
  imageUploadUrl = 'http://localhost/api/Upload/Image';
  
  // Image field name
  imageField = 'PictureID';
  
  // Image preview URL generator
  imagePreviewUrl = (filename: string) => `http://localhost/images/${filename}`;
  
  // Save callback
  onSave = (data: any, isEdit: boolean): Observable<any> => {
    const url = 'http://localhost/api/Employees/form';
    // Extract recid from data (EmployeeID field)
    const recid = data.EmployeeID || data.recid || null;
    // Remove recid from record data
    const { EmployeeID, recid: _, ...record } = data;
    return this.http.post(url, {
      request: {
        action: 'save',
        recid: recid,
        name: 'EditEmployee',
        record: record
      }
    });
  };
  
  // Data Table - Adapted for Employees API
  tableColumns: TableColumn[] = [
    { 
      field: 'EmployeeID', 
      label: 'ID', 
      text: 'ID',
      type: 'int', 
      sortable: true, 
      width: '80px', 
      size: '80px',
      searchable: 'int',
      resizable: true,
      tooltip: 'Employee ID'
    },
    { 
      field: 'PictureID', 
      label: 'Resim', 
      text: 'Resim',
      type: 'picture', 
      sortable: false, 
      width: '80px', 
      size: '80px',
      searchable: false,
      resizable: true,
      align: 'center',
      prependUrl: 'http://localhost/images/{0}',
      tooltip: 'Picture'
    },
    { 
      field: 'IdentificationNumber', 
      label: 'TC Kimlik', 
      text: 'TC Kimlik',
      type: 'text', 
      sortable: true, 
      width: '120px',
      size: '120px',
      searchable: 'text',
      resizable: true,
      tooltip: 'Identification Number'
    },
    { 
      field: 'Company', 
      searchField: 'Company.PdksCompanyName',
      label: 'Firma', 
      text: 'Firma',
      type: 'list', // Object type -> list
      sortable: false, 
      searchable: 'text',
      resizable: true,
      tooltip: 'Company',
      joinTable: 'Company',
      hidden: true, // Hidden by default, shown when Company join is selected
      load: {
        url: 'http://localhost/api/PdksCompanys',
        injectAuth: true,
        method: 'POST' as const,
        data: {
          limit: -1,
          offset: 0
        },
        map: (data: any) => {
          return data.records.map((item: any) => ({
            id: item.PdksCompanyID,
            text: item.PdksCompanyName
          }));
        }
      },
      render: (record: any) => {
        return record.Company?.PdksCompanyName || '';
      }
    },
    { 
      field: 'Kadro', 
      searchField: 'Kadro.ID',
      label: 'Kadro', 
      text: 'Kadro',
      type: 'list', // Object type -> list
      sortable: false, 
      searchable: 'text',
      resizable: true,
      tooltip: 'Kadro',
      joinTable: 'Kadro',
      hidden: true, // Hidden by default, shown when Kadro join is selected
      load: {
        url: 'http://localhost/api/PdksStaffs',
        injectAuth: true,
        method: 'POST' as const,
        data: {
          limit: -1,
          offset: 0
        },
        map: (data: any) => {
          return data.records.map((item: any) => ({
            id: item.ID,
            text: item.Name
          }));
        }
      },
      render: (record: any) => {
        return record.Kadro?.Name || '';
      }
    },
    { 
      field: 'Department', 
      searchField: 'EmployeeDepartments.Department.DepartmentID',
      load: {
        url: 'http://localhost/api/Departments',
        injectAuth: true,
        method: 'POST' as const,
        data: {
          limit: -1,
          offset: 0
        },
        map: (data: any) => {
          return data.records.map((item: any) => ({
            id: item.DepartmentID,
            text: item.DepartmentName
          }));
        }
      },
      label: 'Departman', 
      text: 'Departman',
      type: 'enum', 
      sortable: false, 
      searchable: 'enum',
      resizable: true,
      tooltip: 'Department',
      joinTable: 'Department', // Nested under EmployeeDepartments
      hidden: true, // Hidden by default, shown when Department join is selected
      render: (record: any) => {
        if (record.EmployeeDepartments && record.EmployeeDepartments.length > 0) {
          return record.EmployeeDepartments.map((ed: any) => ed.Department?.DepartmentName).filter(Boolean).join(', ') || '';
        }
        return '';
      }
    },
    { 
      field: 'AccessGroup', 
      searchField: 'EmployeeAccessGroups.AccessGroup.AccessGroupName',
      label: 'Erişim Grubu', 
      text: 'Erişim Grubu',
      type: 'enum', // Array type -> enum
      sortable: false, 
      searchable: 'enum',
      resizable: true,
      tooltip: 'Access Group',
      joinTable: 'AccessGroup',
      hidden: true, // Hidden by default, shown when AccessGroup join is selected
      load: {
        url: 'http://localhost/api/AccessGroups',
        injectAuth: true,
        method: 'POST' as const,
        data: {
          limit: -1,
          offset: 0
        },
        map: (data: any) => {
          return data.records.map((item: any) => ({
            id: item.AccessGroupID || item.Id,
            text: item.AccessGroupName || item.Name
          }));
        }
      },
      render: (record: any) => {
        if (record.EmployeeAccessGroups && record.EmployeeAccessGroups.length > 0) {
          return record.EmployeeAccessGroups.map((eag: any) => eag.AccessGroup?.AccessGroupName).filter(Boolean).join(', ') || '';
        }
        return '';
      }
    },
    { 
      field: 'Name', 
      label: 'Ad', 
      text: 'Ad',
      type: 'text', 
      sortable: true, 
      searchable: 'text',
      resizable: true,
      tooltip: 'First Name'
    },
    { 
      field: 'SurName', 
      label: 'Soyad', 
      text: 'Soyad',
      type: 'text', 
      sortable: true, 
      searchable: 'text',
      resizable: true,
      tooltip: 'Last Name'
    },
    { 
      field: 'Mail', 
      label: 'E-posta', 
      text: 'E-posta',
      type: 'text', 
      sortable: true, 
      searchable: 'text',
      resizable: true,
      tooltip: 'Email Address'
    },
    { 
      field: 'MobilePhone1', 
      label: 'Cep Telefonu 1', 
      text: 'Cep Telefonu 1',
      type: 'text', 
      sortable: true, 
      searchable: 'text',
      resizable: true,
      tooltip: 'Mobile Phone 1'
    },
    { 
      field: 'MobilePhone2', 
      label: 'Cep Telefonu 2', 
      text: 'Cep Telefonu 2',
      type: 'text', 
      sortable: true, 
      searchable: 'text',
      resizable: true,
      tooltip: 'Mobile Phone 2'
    },
    { 
      field: 'Address', 
      label: 'Adres', 
      text: 'Adres',
      type: 'text', 
      sortable: true, 
      searchable: 'text',
      resizable: true,
      tooltip: 'Address'
    },
    { 
      field: 'City', 
      label: 'Şehir', 
      text: 'Şehir',
      type: 'text', 
      sortable: true, 
      searchable: 'text',
      resizable: true,
      tooltip: 'City'
    },
    { 
      field: 'Gender', 
      label: 'Cinsiyet', 
      text: 'Cinsiyet',
      type: 'list', 
      sortable: true, 
      align: 'center',
      searchable: 'list',
      resizable: true,
      tooltip: 'Gender',
      options: [
        { label: 'Erkek', value: 'M' },
        { label: 'Kadın', value: 'F' }
      ]
    },
    { 
      field: 'CafeteriaStatus', 
      label: 'Kafeterya Durumu', 
      text: 'Kafeterya Durumu',
      type: 'checkbox', 
      sortable: true, 
      align: 'center',
      searchable: 'checkbox',
      resizable: true,
      tooltip: 'Cafeteria Status'
    },
    { 
      field: 'WebClient', 
      label: 'Web İstemci', 
      text: 'Web İstemci',
      type: 'checkbox', 
      sortable: true, 
      align: 'center',
      searchable: 'checkbox',
      resizable: true,
      tooltip: 'Web Client Access'
    },
    { 
      field: 'WebAdmin', 
      label: 'Web Admin', 
      text: 'Web Admin',
      type: 'checkbox', 
      sortable: true, 
      align: 'center',
      searchable: 'checkbox',
      resizable: true,
      tooltip: 'Web Admin Access'
    },
    { 
      field: 'WebClientAuthorizationId', 
      label: 'Web İstemci Yetki', 
      text: 'Web İstemci Yetki',
      type: 'list', // Object type -> list
      sortable: false, 
      searchable: 'text',
      resizable: true,
      tooltip: 'Web Client Authorization',
      joinTable: 'WebClient',
      hidden: true, // Hidden by default, shown when WebClient join is selected
      load: {
        url: 'http://localhost/api/Authorizations',
        injectAuth: true,
        method: 'POST' as const,
        data: {
          limit: -1,
          offset: 0
        },
        map: (data: any) => {
          return data.records.map((item: any) => ({
            id: item.Id,
            text: item.Name
          }));
        }
      },
      render: (record: any) => {
        return record.WebClientAuthorization?.Name || '';
      }
    },
    { 
      field: 'AuthorizationId', 
      label: 'Yetki', 
      text: 'Yetki',
      type: 'list', // Object type -> list
      sortable: false, 
      searchable: 'text',
      resizable: true,
      tooltip: 'Authorization',
      joinTable: 'WebAdmin',
      hidden: true, // Hidden by default, shown when WebAdmin join is selected
      load: {
        url: 'http://localhost/api/Authorizations',
        injectAuth: true,
        method: 'POST' as const,
        data: {
          limit: -1,
          offset: 0
        },
        map: (data: any) => {
          return data.records.map((item: any) => ({
            id: item.Id,
            text: item.Name
          }));
        }
      },
      render: (record: any) => {
        return record.Authorization?.Name || '';
      }
    },
    { 
      field: 'Banned', 
      label: 'Yasaklı', 
      text: 'Yasaklı',
      type: 'checkbox', 
      sortable: true, 
      align: 'center',
      searchable: 'checkbox',
      resizable: true,
      tooltip: 'Banned Status'
    },
    { 
      field: 'IsVisitor', 
      label: 'Ziyaretçi', 
      text: 'Ziyaretçi',
      type: 'checkbox', 
      sortable: true, 
      align: 'center',
      searchable: 'checkbox',
      resizable: true,
      tooltip: 'Is Visitor'
    },
    { 
      field: 'LastPasswordUpdate', 
      label: 'Son Şifre Güncelleme', 
      text: 'Son Şifre Güncelleme',
      type: 'datetime', 
      sortable: true, 
      searchable: 'date',
      resizable: true,
      tooltip: 'Last Password Update'
    },
    { 
      field: 'Notes', 
      label: 'Notlar', 
      text: 'Notlar',
      type: 'text', 
      sortable: true, 
      searchable: 'text',
      resizable: true,
      tooltip: 'Notes'
    },
    { 
      field: 'CustomField01', 
      searchField: 'CustomField.CustomField01',
      label: 'Özel Alan 1', 
      text: 'Özel Alan 1',
      type: 'text', 
      sortable: true, 
      searchable: 'text',
      resizable: true,
      tooltip: 'Custom Field 1',
      joinTable: 'CustomField',
      hidden: true,
      render: (record: any) => {
        return record.CustomField?.CustomField01 || '';
      }
    },
    { 
      field: 'CustomField02', 
      searchField: 'CustomField.CustomField02',
      label: 'Özel Alan 2', 
      text: 'Özel Alan 2',
      type: 'text', 
      sortable: true, 
      searchable: 'text',
      resizable: true,
      tooltip: 'Custom Field 2',
      joinTable: 'CustomField',
      hidden: true,
      render: (record: any) => {
        return record.CustomField?.CustomField02 || '';
      }
    },
    { 
      field: 'CustomField03', 
      searchField: 'CustomField.CustomField03',
      label: 'Özel Alan 3', 
      text: 'Özel Alan 3',
      type: 'text', 
      sortable: true, 
      searchable: 'text',
      resizable: true,
      tooltip: 'Custom Field 3',
      joinTable: 'CustomField',
      hidden: true,
      render: (record: any) => {
        return record.CustomField?.CustomField03 || '';
      }
    },
    { 
      field: 'CustomField04', 
      searchField: 'CustomField.CustomField04',
      label: 'Özel Alan 4', 
      text: 'Özel Alan 4',
      type: 'text', 
      sortable: true, 
      searchable: 'text',
      resizable: true,
      tooltip: 'Custom Field 4',
      joinTable: 'CustomField',
      hidden: true,
      render: (record: any) => {
        return record.CustomField?.CustomField04 || '';
      }
    },
    { 
      field: 'CustomField05', 
      searchField: 'CustomField.CustomField05',
      label: 'Özel Alan 5', 
      text: 'Özel Alan 5',
      type: 'text', 
      sortable: true, 
      searchable: 'text',
      resizable: true,
      tooltip: 'Custom Field 5',
      joinTable: 'CustomField',
      hidden: true,
      render: (record: any) => {
        return record.CustomField?.CustomField05 || '';
      }
    },
    { 
      field: 'CustomField06', 
      searchField: 'CustomField.CustomField06',
      label: 'Özel Alan 6', 
      text: 'Özel Alan 6',
      type: 'text', 
      sortable: true, 
      searchable: 'text',
      resizable: true,
      tooltip: 'Custom Field 6',
      joinTable: 'CustomField',
      hidden: true,
      render: (record: any) => {
        return record.CustomField?.CustomField06 || '';
      }
    },
    { 
      field: 'CustomField07', 
      searchField: 'CustomField.CustomField07',
      label: 'Özel Alan 7', 
      text: 'Özel Alan 7',
      type: 'text', 
      sortable: true, 
      searchable: 'text',
      resizable: true,
      tooltip: 'Custom Field 7',
      joinTable: 'CustomField',
      hidden: true,
      render: (record: any) => {
        return record.CustomField?.CustomField07 || '';
      }
    },
    { 
      field: 'CustomField08', 
      searchField: 'CustomField.CustomField08',
      label: 'Özel Alan 8', 
      text: 'Özel Alan 8',
      type: 'text', 
      sortable: true, 
      searchable: 'text',
      resizable: true,
      tooltip: 'Custom Field 8',
      joinTable: 'CustomField',
      hidden: true,
      render: (record: any) => {
        return record.CustomField?.CustomField08 || '';
      }
    },
    { 
      field: 'CustomField09', 
      searchField: 'CustomField.CustomField09',
      label: 'Özel Alan 9', 
      text: 'Özel Alan 9',
      type: 'text', 
      sortable: true, 
      searchable: 'text',
      resizable: true,
      tooltip: 'Custom Field 9',
      joinTable: 'CustomField',
      hidden: true,
      render: (record: any) => {
        return record.CustomField?.CustomField09 || '';
      }
    },
    { 
      field: 'CustomField10', 
      searchField: 'CustomField.CustomField10',
      label: 'Özel Alan 10', 
      text: 'Özel Alan 10',
      type: 'text', 
      sortable: true, 
      searchable: 'text',
      resizable: true,
      tooltip: 'Custom Field 10',
      joinTable: 'CustomField',
      hidden: true,
      render: (record: any) => {
        return record.CustomField?.CustomField10 || '';
      }
    },
    { 
      field: 'CustomField11', 
      searchField: 'CustomField.CustomField11',
      label: 'Özel Alan 11', 
      text: 'Özel Alan 11',
      type: 'text', 
      sortable: true, 
      searchable: 'text',
      resizable: true,
      tooltip: 'Custom Field 11',
      joinTable: 'CustomField',
      hidden: true,
      render: (record: any) => {
        return record.CustomField?.CustomField11 || '';
      }
    },
    { 
      field: 'CustomField12', 
      searchField: 'CustomField.CustomField12',
      label: 'Özel Alan 12', 
      text: 'Özel Alan 12',
      type: 'text', 
      sortable: true, 
      searchable: 'text',
      resizable: true,
      tooltip: 'Custom Field 12',
      joinTable: 'CustomField',
      hidden: true,
      render: (record: any) => {
        return record.CustomField?.CustomField12 || '';
      }
    },
    { 
      field: 'CustomField13', 
      searchField: 'CustomField.CustomField13',
      label: 'Özel Alan 13', 
      text: 'Özel Alan 13',
      type: 'text', 
      sortable: true, 
      searchable: 'text',
      resizable: true,
      tooltip: 'Custom Field 13',
      joinTable: 'CustomField',
      hidden: true,
      render: (record: any) => {
        return record.CustomField?.CustomField13 || '';
      }
    },
    { 
      field: 'CustomField14', 
      searchField: 'CustomField.CustomField14',
      label: 'Özel Alan 14', 
      text: 'Özel Alan 14',
      type: 'text', 
      sortable: true, 
      searchable: 'text',
      resizable: true,
      tooltip: 'Custom Field 14',
      joinTable: 'CustomField',
      hidden: true,
      render: (record: any) => {
        return record.CustomField?.CustomField14 || '';
      }
    },
    { 
      field: 'CustomField15', 
      searchField: 'CustomField.CustomField15',
      label: 'Özel Alan 15', 
      text: 'Özel Alan 15',
      type: 'text', 
      sortable: true, 
      searchable: 'text',
      resizable: true,
      tooltip: 'Custom Field 15',
      joinTable: 'CustomField',
      hidden: true,
      render: (record: any) => {
        return record.CustomField?.CustomField15 || '';
      }
    },
    { 
      field: 'CustomField16', 
      searchField: 'CustomField.CustomField16',
      label: 'Özel Alan 16', 
      text: 'Özel Alan 16',
      type: 'text', 
      sortable: true, 
      searchable: 'text',
      resizable: true,
      tooltip: 'Custom Field 16',
      joinTable: 'CustomField',
      hidden: true,
      render: (record: any) => {
        return record.CustomField?.CustomField16 || '';
      }
    },
    { 
      field: 'CustomField17', 
      searchField: 'CustomField.CustomField17',
      label: 'Özel Alan 17', 
      text: 'Özel Alan 17',
      type: 'text', 
      sortable: true, 
      searchable: 'text',
      resizable: true,
      tooltip: 'Custom Field 17',
      joinTable: 'CustomField',
      hidden: true,
      render: (record: any) => {
        return record.CustomField?.CustomField17 || '';
      }
    },
    { 
      field: 'CustomField18', 
      searchField: 'CustomField.CustomField18',
      label: 'Özel Alan 18', 
      text: 'Özel Alan 18',
      type: 'text', 
      sortable: true, 
      searchable: 'text',
      resizable: true,
      tooltip: 'Custom Field 18',
      joinTable: 'CustomField',
      hidden: true,
      render: (record: any) => {
        return record.CustomField?.CustomField18 || '';
      }
    },
    { 
      field: 'CustomField19', 
      searchField: 'CustomField.CustomField19',
      label: 'Özel Alan 19', 
      text: 'Özel Alan 19',
      type: 'text', 
      sortable: true, 
      searchable: 'text',
      resizable: true,
      tooltip: 'Custom Field 19',
      joinTable: 'CustomField',
      hidden: true,
      render: (record: any) => {
        return record.CustomField?.CustomField19 || '';
      }
    },
    { 
      field: 'CustomField20', 
      searchField: 'CustomField.CustomField20',
      label: 'Özel Alan 20', 
      text: 'Özel Alan 20',
      type: 'text', 
      sortable: true, 
      searchable: 'text',
      resizable: true,
      tooltip: 'Custom Field 20',
      joinTable: 'CustomField',
      hidden: true,
      render: (record: any) => {
        return record.CustomField?.CustomField20 || '';
      }
    }
  ];
  
  ngOnInit(): void {
    // Setup data source function that calls the service with parameters (w2ui compatible)
    this.tableDataSource = (params) => {
      return this.dataService.getData({
        page: params.page,
        limit: params.limit,
        search: params.search || undefined,
        searchLogic: params.searchLogic || 'AND',
        sort: params.sort,
        join: params.join, // Pass join options to service
        showDeleted: params.showDeleted, // Pass showDeleted flag to service
        columns: this.tableColumns // Pass columns for type mapping
      });
    };
  }
  
  ngOnDestroy(): void {
    // No cleanup needed when using getter with async pipe
  }
  
  // Toolbar configuration (w2ui style) - getter to support translations
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
              id: 'bulk-department',
              text: this.translate.instant('operations.bulkDepartment'),
              onClick: (event: MouseEvent, item: any) => this.onBulkDepartment(event, item)
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
  
  
  onTableRowClick(event: { row: any; columnIndex?: number }) {
    console.log('Row clicked:', event.row);
    if (event.columnIndex !== undefined) {
      console.log('Column index:', event.columnIndex);
    }
  }
  
  onPictureClick(event: { row: any; column: any; rowIndex: number; columnIndex: number; pictureId: string; event: MouseEvent }) {
    console.log('Picture clicked:', {
      row: event.row,
      column: event.column,
      rowIndex: event.rowIndex,
      columnIndex: event.columnIndex,
      pictureId: event.pictureId
    });
    // Picture overlay is now handled by data-table component
  }
  
  onTableRowSelect(rows: any[]) {
    console.log('Rows selected:', rows);
  }

  onAdvancedFilterChange(filter: any) {
    console.log('Advanced filter changed:', filter);
  }
  
  openModal() {
    this.showModal = true;
  }
  
  closeModal() {
    this.showModal = false;
  }

  // Form
  sampleForm!: FormGroup;

  createForm() {
    this.sampleForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: [''],
      phone: [''],
      address: [''],
      city: [''],
      country: [''],
      agreeToTerms: [false]
    });
  }

  onSubmit() {
    if (this.sampleForm.valid) {
      const formJson = JSON.stringify(this.sampleForm.value, null, 2);
      console.log('Form submitted:', this.sampleForm.value);
      console.log('Form JSON:', formJson);
    } else {
      console.log('Form is invalid');
    }
  }

  onFormSubmit(formData: any) {
    console.log('Form submitted via FormComponent:', formData);
    const formJson = JSON.stringify(formData, null, 2);
    console.log('Form JSON:', formJson);
  }

  private previousAccessGroup: any = null;
  private previousSubscriptionCard: any = null;
  private previousCafeteriaAccount: any = null;

  onFormChange = (formData: any) => {
    // Called whenever form values change
    console.log('onFormChange called with formData:', formData);
    
    // If AccessGroup changed, reload EmployeeAccessGroupReaders grid
    if (formData) {
      const currentAccessGroup = formData['AccessGroup'];
      console.log('AccessGroup check:', {
        hasAccessGroup: formData.hasOwnProperty('AccessGroup'),
        currentAccessGroup: currentAccessGroup,
        previousAccessGroup: this.previousAccessGroup,
        areEqual: JSON.stringify(this.previousAccessGroup) === JSON.stringify(currentAccessGroup)
      });
      
      if (formData.hasOwnProperty('AccessGroup')) {
        // Deep comparison for arrays/objects
        const previousStr = JSON.stringify(this.previousAccessGroup);
        const currentStr = JSON.stringify(currentAccessGroup);
        
        if (previousStr !== currentStr) {
          console.log('AccessGroup changed:', {
            previous: this.previousAccessGroup,
            current: currentAccessGroup
          });
          this.previousAccessGroup = currentAccessGroup;
          this.reloadNestedGrid('EmployeeAccessGroupReaders');
        }
      }
      
      // If SubscriptionCard changed, reload SubscriptionEvents grid
      if (formData.hasOwnProperty('SubscriptionCard')) {
        const currentSubscriptionCard = formData['SubscriptionCard'];
        const previousSubscriptionCard = this.previousSubscriptionCard;
        
        if (previousSubscriptionCard !== currentSubscriptionCard) {
          console.log('SubscriptionCard changed:', {
            previous: previousSubscriptionCard,
            current: currentSubscriptionCard
          });
          this.previousSubscriptionCard = currentSubscriptionCard;
          this.reloadNestedGrid('SubscriptionEvents');
        }
      }

      // If CafeteriaAccount changed, fetch total price
      if (formData.hasOwnProperty('CafeteriaAccount')) {
        const currentCafeteriaAccount = formData['CafeteriaAccount'];
        if (this.previousCafeteriaAccount !== currentCafeteriaAccount && currentCafeteriaAccount != null) {
          console.log('CafeteriaAccount changed:', {
            previous: this.previousCafeteriaAccount,
            current: currentCafeteriaAccount
          });
          this.previousCafeteriaAccount = currentCafeteriaAccount;
          this.loadTotalPrice(currentCafeteriaAccount);
        }
      }
    }
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

    const url = `http://localhost/api/CafeteriaEvents/GetTotalBalanceWithAccountIdAndEmployeeId`;
    const payload = {
      EmployeeID: employeeId,
      AccountId: accountId
    };
    
    console.log('Loading total price from:', url, 'with payload:', payload);

    // Interceptor will show the spinner automatically
    // We'll show it one more time so it stays visible after interceptor's hide() in finalize
    this.loadingService.show();

    this.http.post<any>(url, payload).pipe(
      finalize(() => {
        // Interceptor will hide the spinner here (one hide())
        // We showed it once extra, so after interceptor's hide(), it will still be visible
        // We'll hide it after form update in the subscribe callbacks
      })
    ).subscribe({
      next: (response) => {
        console.log('Total price response:', response);
        if (response && response.status === 'success' && response.totalBalance != null) {
          // Update formData with totalBalance using onFormDataChange to trigger change detection
          if (this.dataTableComponent) {
            this.dataTableComponent.onFormDataChange({ TotalPrice: response.totalBalance });
            // Force change detection to update the view after form data change
              this.cdr.detectChanges();
              setTimeout(() => {
                this.loadingService.hide();
              }, 0);
            // Hide loading spinner after form data is set
            // Interceptor already hid once in finalize(), we need to hide once more for our extra show()
          } else {
            // If no dataTableComponent, hide immediately (once to balance our extra show)
            this.loadingService.hide();
          }
        } else {
          console.warn('Invalid response structure or status:', response);
          // Hide loading spinner on invalid response (once to balance our extra show)
          this.loadingService.hide();
        }
      },
      error: (error) => {
        console.error('Error loading total price:', error);
        // Hide loading spinner on error (once to balance our extra show)
        this.loadingService.hide();
      }
    });
  }

  /**
   * Reload a nested grid by ID in the main data table
   */
  reloadNestedGrid(gridId: string): void {
    if (this.dataTableComponent) {
      // Use setTimeout to ensure ViewChildren is updated
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

  onTableRefresh() {
    console.log('Table refresh requested');
    // Reload data or refresh logic here
  }

  onTableDelete(rows: any[]) {
    console.log('Delete records requested:', rows);
  }
  
  onTableAdd() {
    console.log('Add new record requested');
  }
  
  onTableEdit(row: any) {
    //console.log('Edit record requested:', row);
    // Edit logic here - could open a modal or form
    alert(`Edit record: ${row.name} (ID: ${row.id})`);
  }
  
  onTableUpdate() {
    //console.log('Update/Save requested');
    // Save logic here
    alert('Changes saved!');
  }
  
  // New event handlers for w2ui compatible features
  onTableRowDblClick(row: any) {
    //console.log('Row double-clicked:', row);
  }
  
  onTableContextMenu(event: { row: any; event: MouseEvent }) {
    //console.log('Context menu on row:', event.row);
    // Could show a context menu here
    event.event.preventDefault();
  }
  
  onTableColumnClick(event: { column: TableColumn; event: MouseEvent }) {
    //console.log('Column clicked:', event.column.field);
  }
  
  onTableColumnDblClick(event: { column: TableColumn; event: MouseEvent }) {
    //console.log('Column double-clicked:', event.column.field);
    // Could trigger column auto-resize or other action
  }
  
  onTableColumnContextMenu(event: { column: TableColumn; event: MouseEvent }) {
    //console.log('Context menu on column:', event.column.field);
    // Could show column menu (hide/show, resize, etc.)
    event.event.preventDefault();
  }
  
  onTableMouseEnter(row: any) {
    //console.log('Mouse entered row:', row.id);
    // Could show tooltip or highlight
  }
  
  onTableMouseLeave(row: any) {
    //console.log('Mouse left row:', row.id);
  }
  
  onTableFocus() {
    console.log('Table focused');
  }
  
  onTableBlur() {
    //console.log('Table blurred');
  }
  
  onTableCopy(event: { text: string; event: ClipboardEvent }) {
    //console.log('Copy event:', event.text);
  }
  
  onTablePaste(event: { text: string; event: ClipboardEvent }) {
    //console.log('Paste event:', event.text);
    // Could parse pasted data and add as new rows
  }

  onTableColumnResize(event: { column: TableColumn; width: number }) {
    console.log('Column resized:', event.column.field, 'new width:', event.width);
    // Update column width in the columns array
    const columnIndex = this.tableColumns.findIndex(col => col.field === event.column.field);
    if (columnIndex !== -1) {
      this.tableColumns = this.tableColumns.map((col, index) => {
        if (index === columnIndex) {
          return {
            ...col,
            width: event.width + 'px',
            size: event.width + 'px'
          };
        }
        return col;
      });
    }
  }
  
  @ViewChild(DataTableComponent) dataTableComponent?: DataTableComponent;
  
  // Grid columns for nested grids in form
  cardGridColumns: TableColumn[] = [
    { 
      field: 'CardID', 
      label: 'ID', 
      text: 'ID',
      type: 'int' as ColumnType, 
      sortable: true, 
      width: '80px', 
      size: '80px',
      searchable: 'int',
      resizable: true
    },
    { 
      field: 'Status', 
      label: 'Durum', 
      text: 'Durum',
      type: 'checkbox' as ColumnType, 
      sortable: true, 
      width: '80px', 
      size: '80px',
      searchable: 'checkbox',
      resizable: true
    },
    { 
      field: 'CafeteriaGroupID', 
      label: 'Kafeterya Grup ID', 
      text: 'Kafeterya Grup ID',
      type: 'int' as ColumnType, 
      sortable: true, 
      width: '120px', 
      size: '120px',
      searchable: 'int',
      resizable: true
    },
    { 
      field: 'CafeteriaGroupName', 
      label: 'Kafeterya Grup Adı', 
      text: 'Kafeterya Grup Adı',
      type: 'text' as ColumnType, 
      sortable: false, 
      width: '180px', 
      size: '180px',
      searchable: false,
      resizable: true,
      render: (record: any) => record.CafeteriaGroup?.CafeteriaGroupName || '',
      joinTable: 'CafeteriaGroup'
    },
    { 
      field: 'CardCodeType', 
      label: 'Kart Yapısı', 
      text: 'Kart Yapısı',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '120px', 
      size: '120px',
      searchable: 'text',
      resizable: true
    },
    { 
      field: 'CardTypeID', 
      label: 'Kart Tipi ID', 
      text: 'Kart Tipi ID',
      type: 'int' as ColumnType, 
      sortable: true, 
      width: '100px', 
      size: '100px',
      searchable: 'int',
      resizable: true,
      joinTable: 'CardType'
    },
    { 
      field: 'TagCode', 
      label: 'Tag Kodu', 
      text: 'Tag Kodu',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '120px', 
      size: '120px',
      searchable: 'text',
      resizable: true
    },
    { 
      field: 'CardUID', 
      label: 'Kart UID', 
      text: 'Kart UID',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '120px', 
      size: '120px',
      searchable: 'text',
      resizable: true
    },
    { 
      field: 'CardCode', 
      label: 'Kart Kodu', 
      text: 'Kart Kodu',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '100px', 
      size: '100px',
      searchable: 'text',
      resizable: true
    },
    { 
      field: 'CardDesc', 
      label: 'Kart Açıklaması', 
      text: 'Kart Açıklaması',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '150px', 
      size: '150px',
      searchable: 'text',
      resizable: true
    },
    { 
      field: 'CardPassword', 
      label: 'Kart Şifresi', 
      text: 'Kart Şifresi',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '100px', 
      size: '100px',
      searchable: 'text',
      resizable: true
    },
    { 
      field: 'isDefined', 
      label: 'Tanımlı', 
      text: 'Tanımlı',
      type: 'checkbox' as ColumnType, 
      sortable: true, 
      width: '80px', 
      size: '80px',
      searchable: false,
      resizable: true
    },
    { 
      field: 'isVisitor', 
      label: 'Ziyaretçi', 
      text: 'Ziyaretçi',
      type: 'checkbox' as ColumnType, 
      sortable: true, 
      width: '80px', 
      size: '80px',
      searchable: false,
      resizable: true
    },
    { 
      field: 'DefinedTime', 
      label: 'Tanımlama Tarihi', 
      text: 'Tanımlama Tarihi',
      type: 'datetime' as ColumnType, 
      sortable: true, 
      width: '150px', 
      size: '150px',
      searchable: 'datetime',
      resizable: true
    },
    { 
      field: 'CardStatusId', 
      label: 'Kart Durum ID', 
      text: 'Kart Durum ID',
      type: 'int' as ColumnType, 
      sortable: true, 
      width: '100px', 
      size: '100px',
      searchable: 'int',
      resizable: true
    },
    { 
      field: 'TemporaryId', 
      label: 'Geçici ID', 
      text: 'Geçici ID',
      type: 'int' as ColumnType, 
      sortable: true, 
      width: '100px', 
      size: '100px',
      searchable: 'int',
      resizable: true
    },
    { 
      field: 'TemporaryDate', 
      label: 'Geçici Tarih', 
      text: 'Geçici Tarih',
      type: 'datetime' as ColumnType, 
      sortable: true, 
      width: '150px', 
      size: '150px',
      searchable: 'datetime',
      resizable: true
    },
    { 
      field: 'FacilityCode', 
      label: 'Tesis Kodu', 
      text: 'Tesis Kodu',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '100px', 
      size: '100px',
      searchable: 'text',
      resizable: true
    },
    { 
      field: 'Plate', 
      label: 'Plaka', 
      text: 'Plaka',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '100px', 
      size: '100px',
      searchable: 'text',
      resizable: true
    },
    { 
      field: 'TransferTagCode', 
      label: 'Transfer Tag Kodu', 
      text: 'Transfer Tag Kodu',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '150px', 
      size: '150px',
      searchable: 'text',
      resizable: true
    },
    { 
      field: 'BackupCardUID', 
      label: 'Yedek Kart UID', 
      text: 'Yedek Kart UID',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '120px', 
      size: '120px',
      searchable: 'text',
      resizable: true
    },
    { 
      field: 'isFingerPrint', 
      label: 'Parmak İzi', 
      text: 'Parmak İzi',
      type: 'checkbox' as ColumnType, 
      sortable: true, 
      width: '80px', 
      size: '80px',
      searchable: false,
      resizable: true
    },
    { 
      field: 'FingerPrintUpdateTime', 
      label: 'Parmak İzi Güncelleme', 
      text: 'Parmak İzi Güncelleme',
      type: 'datetime' as ColumnType, 
      sortable: true, 
      width: '180px', 
      size: '180px',
      searchable: 'datetime',
      resizable: true
    },
    { 
      field: 'CreatedAt', 
      label: 'Oluşturma Tarihi', 
      text: 'Oluşturma Tarihi',
      type: 'datetime' as ColumnType, 
      sortable: true, 
      width: '150px', 
      size: '150px',
      searchable: 'datetime',
      resizable: true
    },
    { 
      field: 'UpdatedAt', 
      label: 'Güncelleme Tarihi', 
      text: 'Güncelleme Tarihi',
      type: 'datetime' as ColumnType, 
      sortable: true, 
      width: '150px', 
      size: '150px',
      searchable: 'datetime',
      resizable: true
    },
    { 
      field: 'DeletedAt', 
      label: 'Silinme Tarihi', 
      text: 'Silinme Tarihi',
      type: 'datetime' as ColumnType, 
      sortable: true, 
      width: '150px', 
      size: '150px',
      searchable: 'datetime',
      resizable: true
    }
  ];
  // AccessGroupReader columns based on API response structure
  accessGroupReadersGridColumns: TableColumn[] = [
    { 
      field: 'AccessGroupReaderID', 
      label: 'ID', 
      text: 'ID',
      type: 'int' as ColumnType, 
      sortable: true, 
      width: '80px', 
      size: '80px',
      searchable: 'int',
      resizable: true
    },
    { 
      field: 'AccessGroupName', 
      searchField: 'AccessGroup.AccessGroupName',
      label: 'Geçiş Yetkisi Adı', 
      text: 'Geçiş Yetkisi Adı',
      type: 'text' as ColumnType, 
      sortable: false, 
      width: '200px', 
      size: '200px',
      searchable: 'text',
      resizable: true,
      render: (record: any) => {
        return record.AccessGroup?.AccessGroupName || '';
      },
      joinTable: 'AccessGroup'
    },
    { 
      field: 'ReaderName', 
      searchField: 'Terminal.ReaderName',
      label: 'Okuyucu Adı', 
      text: 'Okuyucu Adı',
      type: 'text' as ColumnType, 
      sortable: false, 
      width: '200px', 
      size: '200px',
      searchable: 'text',
      resizable: true,
      render: (record: any) => {
        return record.Terminal?.ReaderName || '';
      },
      joinTable: 'Terminal'
    },
    { 
      field: 'TimeZone', 
      searchField: 'TimeZone.TimeZoneName',
      label: 'Saat Dilimi', 
      text: 'Saat Dilimi',
      type: 'text' as ColumnType, 
      sortable: false, 
      width: '150px', 
      size: '150px',
      searchable: 'text',
      resizable: true,
      render: (record: any) => {
        return record.TimeZone?.TimeZoneName || '';
      }
    },
    { 
      field: 'ReaderID', 
      searchField: 'Terminal.ReaderID',
      label: 'Okuyucu ID', 
      text: 'Okuyucu ID',
      type: 'int' as ColumnType, 
      sortable: false, 
      width: '100px', 
      size: '100px',
      searchable: 'int',
      resizable: true,
      render: (record: any) => {
        return record.Terminal?.ReaderID || record.ReaderID || '';
      }
    },
    { 
      field: 'AccessGroupID', 
      searchField: 'AccessGroup.AccessGroupID',
      label: 'Erişim Grubu ID', 
      text: 'Erişim Grubu ID',
      type: 'int' as ColumnType, 
      sortable: false, 
      width: '120px', 
      size: '120px',
      searchable: 'int',
      resizable: true,
      render: (record: any) => {
        return record.AccessGroup?.AccessGroupID || record.AccessGroupID || '';
      },
      joinTable: 'AccessGroup'
    }
  ];

  // Employee Histories Grid Columns
  subscriptionEventsGridColumns: TableColumn[] = [
    { 
      field: 'SubscriptionEventsID', 
      label: 'ID', 
      text: 'ID',
      type: 'int' as ColumnType, 
      sortable: true, 
      width: '80px', 
      size: '80px',
      searchable: 'int',
      resizable: true
    },
    { 
      field: 'CafeteriaEventID', 
      label: 'İşlem No', 
      text: 'İşlem No',
      type: 'int' as ColumnType, 
      sortable: true, 
      width: '120px', 
      size: '120px',
      searchable: 'int',
      resizable: true
    },
    { 
      field: 'SubscriptionPackage', 
      searchField: 'SubscriptionPackage.Name',
      label: 'Abone Paketi', 
      text: 'Abone Paketi',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '200px', 
      size: '200px',
      searchable: 'text',
      resizable: true,
      render: (record: any) => {
        return record.SubscriptionPackage?.Name || record.SubscriptionPackage?.PackageName || '';
      }
    },
    { 
      field: 'CafeteriaApplication', 
      searchField: 'CafeteriaApplication.ApplicationName',
      label: 'Uygulama', 
      text: 'Uygulama',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '150px', 
      size: '150px',
      searchable: 'text',
      resizable: true,
      render: (record: any) => {
        return record.CafeteriaApplication?.ApplicationName || record.CafeteriaEvent?.ApplicationName || '';
      },
      joinTable: ['CafeteriaApplication', 'CafeteriaEvent']
    },
    { 
      field: 'Day', 
      label: 'Gün', 
      text: 'Gün',
      type: 'date' as ColumnType, 
      sortable: true, 
      width: '120px', 
      size: '120px',
      searchable: 'date',
      resizable: true,
      render: (record: any) => {
        // Day is an integer (year), convert to YYYY-01-01 format
        if (record.Day) {
          return `${record.Day}-01-01`;
        }
        return '';
      }
    },
    { 
      field: 'Qty', 
      label: 'Kullanım Durumu', 
      text: 'Kullanım Durumu',
      type: 'checkbox' as ColumnType, 
      sortable: true, 
      width: '120px', 
      size: '120px',
      searchable: 'checkbox',
      resizable: true
    },
    { 
      field: 'EventTime', 
      label: 'Satın Alma Tarihi', 
      text: 'Satın Alma Tarihi',
      type: 'datetime' as ColumnType, 
      sortable: true, 
      width: '180px', 
      size: '180px',
      searchable: 'datetime',
      resizable: true,
      render: (record: any) => {
        return record.CafeteriaEvent?.EventTime || record.CafeteriaEvent?.RecordTime || '';
      },
      joinTable: 'CafeteriaEvent'
    }
  ];

  employeeHistoriesGridColumns: TableColumn[] = [
    { 
      field: 'ID', 
      label: 'ID', 
      text: 'ID',
      type: 'int' as ColumnType, 
      sortable: true, 
      width: '80px', 
      size: '80px',
      searchable: 'int',
      resizable: true
    },
    { 
      field: 'Personel', 
      label: 'Personel', 
      text: 'Personel',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '150px', 
      size: '150px',
      searchable: 'text',
      resizable: true
    },
    { 
      field: 'Firma', 
      label: 'Firma', 
      text: 'Firma',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '150px', 
      size: '150px',
      searchable: 'text',
      resizable: true,
      joinTable: 'Company'
    },
    { 
      field: 'Departman', 
      label: 'Departman', 
      text: 'Departman',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '150px', 
      size: '150px',
      searchable: 'text',
      resizable: true,
      joinTable: 'Department'
    },
    { 
      field: 'Kadro', 
      label: 'Kadro', 
      text: 'Kadro',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '120px', 
      size: '120px',
      searchable: 'text',
      resizable: true,
      joinTable: 'Kadro'
    },
    { 
      field: 'Görev', 
      label: 'Görev', 
      text: 'Görev',
      type: 'text' as ColumnType, 
      sortable: true, 
      width: '120px', 
      size: '120px',
      searchable: 'text',
      resizable: true
    },
    { 
      field: 'Başlama', 
      label: 'Başlama', 
      text: 'Başlama',
      type: 'datetime' as ColumnType, 
      sortable: true, 
      width: '150px', 
      size: '150px',
      searchable: 'date',
      resizable: true
    },
    { 
      field: 'Bitiş', 
      label: 'Bitiş', 
      text: 'Bitiş',
      type: 'datetime' as ColumnType, 
      sortable: true, 
      width: '150px', 
      size: '150px',
      searchable: 'date',
      resizable: true
    }
  ];

  // Get grid columns by grid ID
  getGridColumns = (gridId: string): TableColumn[] => {
    switch (gridId) {
      case 'EmployeeCardGrid':
        return this.cardGridColumns;
      case 'EmployeeAccessGroupReaders':
        return this.accessGroupReadersGridColumns;
      case 'EmployeeHistories':
        return this.employeeHistoriesGridColumns;
      case 'SubscriptionEvents':
        return this.subscriptionEventsGridColumns;
      default:
        return [];
    }
  };
  
  // Get grid dataSource by grid ID
  getGridDataSource = (gridId: string, formData: any): ((params: any) => Observable<GridResponse>) | undefined => {
    switch (gridId) {
      case 'EmployeeCardGrid':
        return (params: any) => {
          const requestBody = params;
          
          return this.http.post<GridResponse>('http://localhost/api/Cards/GetCardsByEmployeeID', requestBody).pipe(
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
          
          // Add AccessGroups from params (which is set by buildGridDataSourceParams from grid.data)
          if (params.AccessGroups && Array.isArray(params.AccessGroups) && params.AccessGroups.length > 0) {
            requestBody.AccessGroups = params.AccessGroups;
          }
          
          console.log('EmployeeAccessGroupReaders API request:', requestBody);
          
          return this.http.post<GridResponse>('http://localhost/api/AccessGroupReaders/GetReadersByAccessGroups', requestBody).pipe(
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
          console.log('EmployeeHistories API request:', requestBody);
          
          return this.http.post<GridResponse>('http://localhost/api/PdksCompanyHistories/EmployeeHistories', requestBody).pipe(
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
          
          return this.http.post<GridResponse>('http://localhost/api/SubscriptionEvents/GetAllByCardTagCode', requestBody).pipe(
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
}
