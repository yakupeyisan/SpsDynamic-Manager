// LocationBasedFirstUseReports table columns configuration
import { TableColumn, ColumnType, TableRow } from 'src/app/components/data-table/data-table.component';
import { environment } from 'src/environments/environment';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

export const tableColumns: TableColumn[] = [
  { 
    field: 'Date', 
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
    field: 'CafeteriaGroupName', 
    label: 'Kafeterya Grup Adı', 
    text: 'Kafeterya Grup Adı',
    type: 'enum' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    min: 20,
    searchable: 'enum' as ColumnType,
    searchField: 'CafeteriaGroupName',
    resizable: true,
    load: {
      url: `${apiUrl}/api/CafeteriaGroups`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        const records = data?.records ?? data?.data ?? (Array.isArray(data) ? data : []);
        return (records || []).map((item: any) => {
          const name = item?.CafeteriaGroupName ?? item?.Name ?? '';
          return { id: String(name), text: String(name || '(boş)') };
        });
      }
    }
  },
  { 
    field: 'Location', 
    label: 'Konum', 
    text: 'Konum',
    type: 'enum' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    min: 20,
    searchable: 'enum' as ColumnType,
    searchField: 'Location',
    resizable: true,
    load: {
      url: `${apiUrl}/api/Terminals`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        const records = data?.records ?? data?.data ?? (Array.isArray(data) ? data : []);
        return (records || []).map((item: any) => {
          const locationName = item?.ReaderName ?? item?.TerminalName ?? item?.Name ?? '';
          return { id: String(locationName), text: String(locationName || '(boş)') };
        });
      }
    }
  },
  { 
    field: 'Count', 
    label: 'Sayı', 
    text: 'Sayı',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: false,
    resizable: true,
    align: 'right'
  }
];
