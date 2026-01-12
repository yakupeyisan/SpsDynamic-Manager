// CafeteriaSummary form configuration
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';
import { environment } from 'src/environments/environment';

// Custom form fields for view form (read-only for reports)
export const formFields: TableColumn[] = [
  { 
    field: 'ApplicationName', 
    label: 'Uygulama Adı', 
    text: 'Uygulama Adı', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'CafeteriaGroupName', 
    label: 'Kafeterya Grup Adı', 
    text: 'Kafeterya Grup Adı', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'Subscription', 
    label: 'Abonelik', 
    text: 'Abonelik', 
    type: 'int' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'FirstPass', 
    label: 'İlk Geçiş', 
    text: 'İlk Geçiş', 
    type: 'int' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'FirstPassPrice', 
    label: 'İlk Geçiş Fiyatı', 
    text: 'İlk Geçiş Fiyatı', 
    type: 'float' as ColumnType,
    fullWidth: true,
    disabled: true,
    render: (record: any) => {
      const price = record['FirstPassPrice'];
      if (price !== undefined && price !== null) {
        const priceInTL = Number(price) / 100;
        return priceInTL.toLocaleString('tr-TR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) + ' ₺';
      }
      return '0,00 ₺';
    }
  },
  { 
    field: 'SecondPass', 
    label: 'İkinci Geçiş', 
    text: 'İkinci Geçiş', 
    type: 'int' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'SecondPassPrice', 
    label: 'İkinci Geçiş Fiyatı', 
    text: 'İkinci Geçiş Fiyatı', 
    type: 'float' as ColumnType,
    fullWidth: true,
    disabled: true,
    render: (record: any) => {
      const price = record['SecondPassPrice'];
      if (price !== undefined && price !== null) {
        const priceInTL = Number(price) / 100;
        return priceInTL.toLocaleString('tr-TR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) + ' ₺';
      }
      return '0,00 ₺';
    }
  }
];

export const formTabs: FormTab[] = [
  {
    label: 'Genel Bilgiler',
    fields: ['ApplicationName', 'CafeteriaGroupName', 'Subscription', 'FirstPass', 'FirstPassPrice', 'SecondPass', 'SecondPassPrice']
  }
];

export const formLoadUrl = `${environment.apiUrl}/api/CafeteriaEvents/Summary`;
export const formLoadRequest = (recid: any) => ({
  recid: recid
});

export const formDataMapper = (apiRecord: any): any => {
  return apiRecord;
};
