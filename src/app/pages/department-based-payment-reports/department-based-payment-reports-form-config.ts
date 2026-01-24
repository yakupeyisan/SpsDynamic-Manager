// DepartmentBasedPaymentReports form configuration
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';
import { environment } from 'src/environments/environment';

// Custom form fields for view form (read-only for reports)
export const formFields: TableColumn[] = [
  { 
    field: 'Department', 
    label: 'Departman', 
    text: 'Departman', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'Total', 
    label: 'Toplam', 
    text: 'Toplam', 
    type: 'float' as ColumnType,
    fullWidth: true,
    disabled: true,
    render: (record: any) => {
      const total = record['Total'];
      if (total !== undefined && total !== null) {
        const totalInTL = Number(total) / 100;
        return totalInTL.toLocaleString('tr-TR', {
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
    fields: ['Department', 'Total']
  }
];

export const formLoadUrl = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/CafeteriaEvents/DepartmentBasedPayments`;
export const formLoadRequest = (recid: any) => ({
  recid: recid
});

export const formDataMapper = (apiRecord: any): any => {
  return apiRecord;
};
