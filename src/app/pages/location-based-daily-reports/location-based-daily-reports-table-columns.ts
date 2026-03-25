// LocationBasedDailyReports table columns configuration
import { TableColumn, ColumnType, TableRow } from 'src/app/components/data-table/data-table.component';
import { environment } from 'src/environments/environment';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

export const tableColumns: TableColumn[] = [
  { 
    field: 'Date', 
    label: 'Tarih', 
    text: 'Tarih',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'datetime' as ColumnType,
    resizable: true,
    hidden: false, // Show in table
    render: (record: TableRow) => {
      if (!record['Date']) return '';
      const date = record['Date'];
      if (date instanceof Date || (typeof date === 'string' && date.length > 0)) {
        const dateObj = new Date(date);
        if (!isNaN(dateObj.getTime())) {
          return dateObj.toLocaleString('tr-TR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
        }
      }
      return String(date || '');
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
    searchField: 'DeviceSerial', // API'de DeviceSerial alanıyla arama yapılacak
    resizable: true,
    load: {
      url: `${apiUrl}/api/Terminals`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        // Filtre value DeviceSerial olmalı, ekranda ReaderName görünmeli
        const records = data?.records ?? data?.data ?? (Array.isArray(data) ? data : []);
        return (records || []).map((item: any) => {
          const deviceSerial = item?.SerialNumber ?? item?.DeviceSerial ?? item?.Serial ?? '';
          const readerName = item?.ReaderName ?? item?.TerminalName ?? item?.Name ?? String(deviceSerial);
          return {
            id: String(deviceSerial),
            text: String(readerName || '(boş)')
          };
        });
      }
    }
  },
  { 
    field: 'CafeteriaGroupName', 
    label: 'Kafeterya Grubu', 
    text: 'Kafeterya Grubu',
    type: 'enum' as ColumnType, 
    sortable: false, 
    width: '200px', 
    size: '200px',
    min: 20,
    searchable: 'enum' as ColumnType,
    searchField: 'CafeteriaGroupID', // API'de CafeteriaGroupID alanıyla arama yapılacak
    resizable: true,
    hidden: true, // Sadece filtrede görünsün, tabloda görünmesin
    load: {
      url: `${apiUrl}/api/CafeteriaGroups`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        // Filtre value CafeteriaGroupID olmalı, ekranda grup adı görünmeli
        const records = data?.records ?? data?.data ?? (Array.isArray(data) ? data : []);
        return (records || []).map((item: any) => ({
          id: String(item?.CafeteriaGroupID ?? item?.ID ?? item?.id ?? ''),
          text: String(item?.CafeteriaGroupName ?? item?.Name ?? '(boş)')
        }));
      }
    }
  },
  { 
    field: 'Subscription', 
    label: 'Abonelik', 
    text: 'Abonelik',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: false,
    resizable: true,
    align: 'right'
  },
  { 
    field: 'FirstPass', 
    label: 'İlk Geçiş', 
    text: 'İlk Geçiş',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: false,
    resizable: true,
    align: 'right'
  },
  { 
    field: 'SecondPass', 
    label: 'İkinci Geçiş', 
    text: 'İkinci Geçiş',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: false,
    resizable: true,
    align: 'right'
  },
  { 
    field: 'TotalPass', 
    label: 'Toplam Geçiş', 
    text: 'Toplam Geçiş',
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
