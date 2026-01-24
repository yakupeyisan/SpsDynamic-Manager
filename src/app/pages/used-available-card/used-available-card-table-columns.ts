// UsedAvailableCard table columns configuration
import { TableColumn, ColumnType } from 'src/app/components/data-table/data-table.component';
import { environment } from 'src/environments/environment';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

export const tableColumns: TableColumn[] = [
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
    field: 'CardTypeName', 
    label: 'Kart Tipi', 
    text: 'Kart Tipi',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '150px', 
    size: '150px',
    searchable: false,
    resizable: true,
    render: (record: any) => record.CardType?.CardType || record.CardType?.CardTypeName || record.CardType?.Name || '',
    joinTable: 'CardType'
  },
  { 
    field: 'EmployeeName', 
    label: 'Kişi Adı', 
    text: 'Kişi Adı',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '150px', 
    size: '150px',
    searchable: false,
    resizable: true,
    render: (record: any) => {
      if (record.Employee) {
        return `${record.Employee.Name || ''} ${record.Employee.SurName || ''}`.trim() || record.Employee.Name || record.Employee.SurName || '';
      }
      return '';
    },
    joinTable: 'Employee'
  },
  { 
    field: 'CafeteriaGroupName', 
    label: 'Kafeterya Grup', 
    text: 'Kafeterya Grup',
    type: 'enum' as ColumnType, 
    sortable: false, 
    width: '180px', 
    size: '180px',
    searchable: 'enum',
    searchField: 'CafeteriaGroupID',
    resizable: true,
    render: (record: any) => record.CafeteriaGroup?.CafeteriaGroupName || record.CafeteriaGroup?.Name || '',
    joinTable: 'CafeteriaGroup',
    load: {
      url: `${apiUrl}/api/CafeteriaGroups`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        if (!data || !data.records || !Array.isArray(data.records)) {
          return [];
        }
        return data.records.map((item: any) => ({
          id: item.CafeteriaGroupID,
          text: item.CafeteriaGroupName || item.Name
        }));
      }
    }
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
    field: 'CardStatusName', 
    label: 'Kart Statü', 
    text: 'Kart Statü',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '150px', 
    size: '150px',
    searchable: false,
    resizable: true,
    render: (record: any) => record.CardStatus?.Name || '',
    joinTable: 'CardStatus'
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
    width: '150px', 
    size: '150px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'CardCode', 
    label: 'Kart Kodu', 
    text: 'Kart Kodu',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '100px', 
    size: '100px',
    searchable: 'int',
    resizable: true
  },
  { 
    field: 'CardDesc', 
    label: 'Kart Açıklaması', 
    text: 'Kart Açıklaması',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    searchable: 'text',
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
  }
];
