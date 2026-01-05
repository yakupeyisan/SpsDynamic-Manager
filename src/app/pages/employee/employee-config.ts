// Employee component configuration from old app.component.ts
// This file contains all grid and form configurations for Employee management

import { environment } from 'src/environments/environment';
import { TableColumn, JoinOption, FormTab, ColumnType, ToolbarConfig } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.apiUrl;

// Join Options for Data Table
export const joinOptions: JoinOption[] = [
  { key: 'Company', label: 'Firma', nested: false, default: true },
  { key: 'Kadro', label: 'Kadro', nested: false, default: true },
  { key: 'Department', label: 'Departman', nested: false, default: true },
  { key: 'AccessGroup', label: 'Erişim Grubu', nested: false, default: true },
  { key: 'CustomField', label: 'Özel Alan', nested: false, default: true },
  { key: 'WebClient', label: 'Kişisel Panel Yetkisi', nested: false, default: false },
  { key: 'WebAdmin', label: 'Yönetim Paneli Yetkisi', nested: false, default: false }
];

// Custom form fields for add/edit form
export const formFields: TableColumn[] = [
  { field: 'Name', label: 'Ad', text: 'Ad', type: 'text' },
  { field: 'SurName', label: 'Soyad', text: 'Soyad', type: 'text' },
  { field: 'IdentificationNumber', label: 'TC Kimlik', text: 'TC Kimlik', type: 'text' },
  { 
    field: 'Gender', 
    label: 'Cinsiyet', 
    text: 'Cinsiyet', 
    type: 'enum', 
    options: [
      { label: 'Erkek', value: 'M' },
      { label: 'Kadın', value: 'F' }
    ]
  },
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
  { 
    field: 'Company', 
    label: 'Firma', 
    text: 'Firma', 
    type: 'list', 
    load: {
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
    }
  },
  { 
    field: 'Kadro', 
    label: 'Kadro', 
    text: 'Kadro', 
    type: 'list', 
    load: {
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
    }
  },
  { 
    field: 'Department', 
    label: 'Departman', 
    text: 'Departman', 
    type: 'enum', 
    load: {
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
    }
  },
  { 
    field: 'Banned', 
    label: 'Tüm sistemde engellenensin mi?', 
    text: 'Tüm sistemde engellenensin mi?', 
    type: 'checkbox', 
    fullWidth: true 
  },
  { 
    field: 'BannedMsg', 
    label: 'Engellenme Mesajı', 
    text: 'Engellenme Mesajı', 
    type: 'textarea', 
    fullWidth: true 
  },
  { 
    field: 'AccessGroup', 
    label: 'Erişim Grubu', 
    text: 'Erişim Grubu', 
    type: 'enum', 
    load: {
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
    }
  },
  { field: 'WebClient', label: 'Web İstemci', text: 'Web İstemci', type: 'checkbox' },
  { field: 'WebAdmin', label: 'Web Admin', text: 'Web Admin', type: 'checkbox' },
  { 
    field: 'WebClientAuthorizationId', 
    label: 'Web İstemci Yetki', 
    text: 'Web İstemci Yetki', 
    type: 'list', 
    load: {
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
    }
  },
  { 
    field: 'AuthorizationId', 
    label: 'Yetki', 
    text: 'Yetki', 
    type: 'list', 
    load: {
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
    }
  },
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
  // Kafeterya fields
  { 
    field: 'CafeteriaStatus', 
    label: 'Kafeterya Durumu', 
    text: 'Kafeterya Durumu', 
    type: 'checkbox' as ColumnType, 
    fullWidth: true 
  },
  { 
    field: 'CafeteriaAccount', 
    label: 'Kafeterya Hesabı', 
    text: 'Kafeterya Hesabı', 
    type: 'list', 
    fullWidth: true, 
    load: {
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
    }
  },
  // disabled
  { 
    field: 'TotalPrice', 
    label: 'Toplam Fiyat', 
    text: 'Toplam Fiyat', 
    type: 'currency' as ColumnType, 
    fullWidth: true, 
    disabled: true, 
    currencyPrefix: '', 
    currencySuffix: '₺', 
    currencyPrecision: 2 
  },
  { 
    field: 'SubscriptionCard', 
    label: 'Abone Kartı', 
    text: 'Abone Kartı', 
    type: 'list' as ColumnType, 
    load: {
      url: `${apiUrl}/api/Cards/GetCardsByEmployeeID`,
      injectAuth: true,
      method: 'POST',
      data: (formData?: any) => {
        const employeeId = formData?.['EmployeeID'] || null;
        return { 
          limit: -1, 
          offset: 0, 
          EmployeeID: employeeId 
        };
      },
      map: (data: any) => {
        return data.records ? data.records.map((item: any) => ({
          id: item.TagCode,
          text: item.TagCode + ' ' + (item.CafeteriaGroup?.CafeteriaGroupName || '') + ' ' + (item.CardDesc ? ' - ' + item.CardDesc : '')
        })) : [];
      }
    }
  },
];

// Form tabs configuration - will be created in a helper function that receives http and translate service
export function createFormTabs(http: any, translate: any, onCardFormat: any, onCardTransfer: any, onCardReset: any): FormTab[] {
  return [
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
          { 
            field: 'CardTypeID', 
            label: 'CardTypeID', 
            text: 'CardTypeID', 
            type: 'list', 
            required: true, 
            load: {
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
            }
          },
          { 
            field: 'CafeteriaGroupID', 
            label: 'Kafeterya Grup', 
            text: 'Kafeterya Grup', 
            type: 'list', 
            load: {
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
            }
          },
          { 
            field: 'CardCodeType', 
            label: 'Kart Kullanım Tipi', 
            text: 'Kart Kullanım Tipi', 
            type: 'list', 
            load: {
              url: `${apiUrl}/api/CardCodeTypes`,
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
            }
          },
          { 
            field: 'CardStatusId', 
            label: 'Kart Statü', 
            text: 'Kart Statü', 
            type: 'list', 
            required: true, 
            load: {
              url: `${apiUrl}/api/CardStatuses`,
              injectAuth: true,
              method: 'POST',
              data: { limit: -1, offset: 0 },
              map: (data: any) => {
                return data.records ? data.records.map((item: any) => ({
                  id: item.Id,
                  text: item.Name
                })) : [];
              }
            }
          },
          { field: 'FacilityCode', label: 'FacilityCode', text: 'FacilityCode', type: 'text' },
          { field: 'CardCode', label: 'Kart Kodu', text: 'Kart Kodu', type: 'int' },
          { field: 'CardUID', label: 'CardUID', text: 'CardUID', type: 'text' },
          { field: 'Plate', label: 'Plaka', text: 'Plaka', type: 'text' },
          { field: 'CardDesc', label: 'Kart Açıklaması', text: 'Kart Açıklaması', type: 'textarea' },
          { field: 'Status', label: 'Durum', text: 'Durum', type: 'checkbox' },
        ] as TableColumn[],
        formLoadUrl: `${apiUrl}/api/Cards/GetCardsByEmployeeID`,
        formLoadRequest: (recid: any, parentFormData?: any) => {
          const employeeId = parentFormData?.['EmployeeID'] || null;
          return {
            EmployeeID: employeeId
          };
        },
        onSave: (data: any, isEdit: boolean) => {
          const url = `${apiUrl}/api/Cards/form`;
          const recid = data.CardID || data.recid || null;
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
              text: translate?.instant('card.format') || 'Formatla',
              tooltip: translate?.instant('card.formatTooltip') || 'Formatla',
              onClick: (event: MouseEvent, item: any) => {
                onCardFormat(event, item);
              }
            },
            {
              id: 'transfer',
              type: 'button' as const,
              text: translate?.instant('card.transfer') || 'Transfer',
              tooltip: translate?.instant('card.transferTooltip') || 'Transfer',
              onClick: (event: MouseEvent, item: any) => {
                onCardTransfer(event, item);
              }
            },
            {
              id: 'sifirla',
              type: 'button' as const,
              text: translate?.instant('card.reset') || 'Sıfırla',
              tooltip: translate?.instant('card.resetTooltip') || 'Sıfırla',
              onClick: (event: MouseEvent, item: any) => {
                onCardReset(event, item);
              }
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
}
