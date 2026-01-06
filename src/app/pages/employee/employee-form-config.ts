// Employee form configuration from old app.component.ts
// This file contains all form fields and form tabs configurations for Employee management

import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType, FormTab, JoinOption } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.apiUrl;

// Custom form fields for add/edit form
export const formFields: TableColumn[] = [
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
    url: `${apiUrl}/api/PdksCompanys`,
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
    url: `${apiUrl}/api/PdksStaffs`,
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
    url: `${apiUrl}/api/Departments`,
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
    url: `${apiUrl}/api/AccessGroups`,
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
    url: `${apiUrl}/api/Authorizations`,
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
    url: `${apiUrl}/api/Authorizations`,
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
    url: `${apiUrl}/api/CafeteriaAccounts`,
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
      url: `${apiUrl}/api/Cards/GetCardsByEmployeeID`,
      injectAuth: true,
      method: 'POST',
      data: (formData?: any) => {
        // Get EmployeeID from formData - try EmployeeID first, then recid
        const employeeId = formData?.['EmployeeID'] || formData?.['recid'] || null;
        return { 
          limit: -1, 
          offset: 0, 
          EmployeeID: employeeId 
        };
      },
      map: (data: any) => {
        if (!data || !data.records || !Array.isArray(data.records)) {
          return [];
        }
        return data.records.map((item: any) => {
          const cafeteriaGroupName = item.CafeteriaGroup?.CafeteriaGroupName || '';
          const cardDesc = item.CardDesc ? ' - ' + item.CardDesc : '';
          return {
            id: item.TagCode,
            text: `${item.TagCode} ${cafeteriaGroupName}${cardDesc}`.trim()
          };
        });
      }
    }
  },
];

// Form tabs configuration
export const formTabs: FormTab[] = [
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
    showInAdd: false, // Hide in add mode
    grids: [{
      id: "EmployeeCardGrid",
      selectable: true,
      formFullscreen: false,
      formWidth: '700px',
      formHeight: '600px',
      recid: 'CardID',
      formFields: [
        { field: 'CardTypeID', label: 'CardTypeID', text: 'CardTypeID', type: 'list', required: true, load: {
          url: `${apiUrl}/api/CardTypes`,
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
          url: `${apiUrl}/api/CafeteriaGroups`,
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
          url: `${apiUrl}/api/CardCodeTypes`,
          injectAuth: true,
          method: 'POST',
          data: { limit: -1, offset: 0 },
          map: (data: any) => {
            return data.records ? data.records.map((item: any) => ({
              id: item.id,
              text: item.text
            })) : [];
          }
        }},
        { field: 'CardStatusId', label: 'Kart Statü', text: 'Kart Statü', type: 'list', required: true, load: {
          url: `${apiUrl}/api/CardStatuses`,
          injectAuth: true,
          method: 'POST',
          data: { limit: -1, offset: 0 },
          map: (data: any) => {
            console.log('CardStatuses map - received data:', data);
            
            // Handle different response formats
            let records: any[] = [];
            if (data && data.records && Array.isArray(data.records)) {
              records = data.records;
            } else if (data && Array.isArray(data)) {
              records = data;
            } else if (data && data.data && Array.isArray(data.data)) {
              records = data.data;
            }
            
            console.log('CardStatuses map - extracted records:', records);
            
            const mapped = records.map((item: any) => ({
              id: item.Id || item.id || item.CardStatusId,
              text: item.Name || item.name || item.Text || item.text || String(item.Id || item.id || '')
            }));
            
            console.log('CardStatuses map - mapped result:', mapped);
            
            return mapped;
          }
        }},
        { field: 'FacilityCode', label: 'FacilityCode', text: 'FacilityCode', type: 'text' },
        { field: 'CardCode', label: 'Kart Kodu', text: 'Kart Kodu', type: 'int' },
        { field: 'CardUID', label: 'CardUID', text: 'CardUID', type: 'text' },
        { field: 'Plate', label: 'Plaka', text: 'Plaka', type: 'text' },
        { field: 'CardDesc', label: 'Kart Açıklaması', text: 'Kart Açıklaması', type: 'textarea' },
        { field: 'Status', label: 'Durum', text: 'Durum', type: 'checkbox' },
      ] as TableColumn[],
      formLoadUrl: `${apiUrl}/api/Cards/GetCardsByEmployeeID`,
      formLoadRequest: (recid: any, parentFormData?: any) => {
        // Get EmployeeID from parent form data
        const employeeId = parentFormData?.['EmployeeID'] || null;
        console.log('Card formLoadRequest - recid:', recid, 'employeeId:', employeeId, 'parentFormData:', parentFormData);
        return {
          EmployeeID: employeeId
        };
      },
      onSave: (data: any, isEdit: boolean, http?: any) => {
        if (!http) {
          throw new Error('Http client is required for saving card data');
        }
        const url = `${apiUrl}/api/Cards/form`;
        // Extract recid from data (CardID field)
        const recid = data.CardID || data.recid || null;
        // Remove recid from record data
        const { CardID, recid: _, ...record } = data;
        return http.post(url, {
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
            text: 'Formatla', // Will be translated in component
            tooltip: 'Kartı Formatla', // Will be translated in component
            onClick: null as any // Will be set in component
          },
          {
            id: 'transfer',
            type: 'button' as const,
            text: 'Transfer', // Will be translated in component
            tooltip: 'Kartı Transfer Et', // Will be translated in component
            onClick: null as any // Will be set in component
          },
          {
            id: 'sifirla',
            type: 'button' as const,
            text: 'Sıfırla', // Will be translated in component
            tooltip: 'Kartı Sıfırla', // Will be translated in component
            onClick: null as any // Will be set in component
          }
        ],
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
    showInAdd: false, // Hide in add mode
    fields: ['CafeteriaStatus', 'CafeteriaAccount','TotalPrice'] 
  },
  { 
    label: 'Abone',
    showInAdd: false, // Hide in add mode
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
export const formLoadUrl = `${apiUrl}/api/Employees/form`;

// Form load request builder
export const formLoadRequest = (recid: any) => ({
  action: 'get',
  recid: recid,
  name: 'EditEmployee'
});

// Form data mapper - maps API response to form data
export const formDataMapper = (apiRecord: any) => {
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
export const imageUploadUrl = `${apiUrl}/api/Upload/Image`;

// Image field name
export const imageField = 'PictureID';

// Image preview URL generator
export const imagePreviewUrl = (filename: string) => `${apiUrl}/images/${filename}`;
