// LocationBasedFirstUseReports form configuration
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';
import { environment } from 'src/environments/environment';

// Custom form fields for view form (read-only for reports)
export const formFields: TableColumn[] = [
  { 
    field: 'CafeteriaGroupName', 
    label: 'Kafeterya Grup Adı', 
    text: 'Kafeterya Grup Adı', 
    type: 'text' as ColumnType,
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
    field: 'Count', 
    label: 'Sayı', 
    text: 'Sayı', 
    type: 'int' as ColumnType,
    fullWidth: true,
    disabled: true
  }
];

export const formTabs: FormTab[] = [
  {
    label: 'Genel Bilgiler',
    fields: ['CafeteriaGroupName', 'Location', 'Count']
  }
];

export const formLoadUrl = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/CafeteriaEvents/CafeteriaFirstTimeUsageByLocation`;
export const formLoadRequest = (recid: any) => ({
  recid: recid
});

export const formDataMapper = (apiRecord: any): any => {
  return apiRecord;
};
