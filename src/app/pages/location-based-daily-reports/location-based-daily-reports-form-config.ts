// LocationBasedDailyReports form configuration
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';
import { environment } from 'src/environments/environment';

// Custom form fields for view form (read-only for reports)
export const formFields: TableColumn[] = [
  { 
    field: 'Date', 
    label: 'Tarih', 
    text: 'Tarih', 
    type: 'date' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'Location', 
    label: 'Konum', 
    text: 'Konum', 
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
    field: 'SecondPass', 
    label: 'İkinci Geçiş', 
    text: 'İkinci Geçiş', 
    type: 'int' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'TotalPass', 
    label: 'Toplam Geçiş', 
    text: 'Toplam Geçiş', 
    type: 'int' as ColumnType,
    fullWidth: true,
    disabled: true
  }
];

export const formTabs: FormTab[] = [
  {
    label: 'Genel Bilgiler',
    fields: ['Date', 'Location', 'Subscription', 'FirstPass', 'SecondPass', 'TotalPass']
  }
];

export const formLoadUrl = `${environment.apiUrl}/api/CafeteriaEvents/LocationBasedDailyPass`;
export const formLoadRequest = (recid: any) => ({
  recid: recid
});

export const formDataMapper = (apiRecord: any): any => {
  return apiRecord;
};
