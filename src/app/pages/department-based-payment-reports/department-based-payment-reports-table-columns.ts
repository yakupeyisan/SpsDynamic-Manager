// DepartmentBasedPaymentReports table columns configuration
import { TableColumn, ColumnType, TableRow } from 'src/app/components/data-table/data-table.component';
import { environment } from 'src/environments/environment';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

export const tableColumns: TableColumn[] = [
  { 
    field: 'StartDate', 
    label: 'Tarih', 
    text: 'Tarih',
    type: 'date' as ColumnType, 
    sortable: false, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'date' as ColumnType,
    resizable: true,
    hidden: true // Hidden column, only used for filtering
  },
  { 
    field: 'Department', 
    label: 'Departman', 
    text: 'Departman',
    type: 'enum' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    min: 20,
    searchable: 'enum' as ColumnType,
    searchField: 'Department',
    resizable: true,
    load: {
      url: `${apiUrl}/api/Departments`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        const records = data?.records ?? data?.data ?? (Array.isArray(data) ? data : []);
        return (records || []).map((item: any) => {
          const name = item?.DepartmentName ?? item?.Name ?? '';
          return { id: String(name), text: String(name || '(boş)') };
        });
      }
    }
  },
  { 
    field: 'Total', 
    label: 'Toplam', 
    text: 'Toplam',
    type: 'float' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: false,
    resizable: true,
    align: 'right',
    render: (record: TableRow) => {
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
