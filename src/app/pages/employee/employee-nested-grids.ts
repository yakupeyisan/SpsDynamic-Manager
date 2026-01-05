// Nested grid columns for Employee form (Cards, AccessGroupReaders, Histories, SubscriptionEvents)
import { TableColumn, ColumnType } from 'src/app/components/data-table/data-table.component';

// Grid columns for nested grids in form
export const cardGridColumns: TableColumn[] = [
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
    field: 'CafeteriaGroupID', 
    label: 'Kafeterya Grup ID', 
    text: 'Kafeterya Grup ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'int',
    resizable: true
  },
  { 
    field: 'CafeteriaGroupName', 
    label: 'Kafeterya Grup Adı', 
    text: 'Kafeterya Grup Adı',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '180px', 
    size: '180px',
    searchable: false,
    resizable: true,
    render: (record: any) => record.CafeteriaGroup?.CafeteriaGroupName || '',
    joinTable: 'CafeteriaGroup'
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
    field: 'CardTypeID', 
    label: 'Kart Tipi ID', 
    text: 'Kart Tipi ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '100px', 
    size: '100px',
    searchable: 'int',
    resizable: true,
    joinTable: 'CardType'
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
    width: '120px', 
    size: '120px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'CardCode', 
    label: 'Kart Kodu', 
    text: 'Kart Kodu',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '100px', 
    size: '100px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'CardDesc', 
    label: 'Kart Açıklaması', 
    text: 'Kart Açıklaması',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'CardPassword', 
    label: 'Kart Şifresi', 
    text: 'Kart Şifresi',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '100px', 
    size: '100px',
    searchable: 'text',
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
    field: 'isVisitor', 
    label: 'Ziyaretçi', 
    text: 'Ziyaretçi',
    type: 'checkbox' as ColumnType, 
    sortable: true, 
    width: '80px', 
    size: '80px',
    searchable: false,
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
    field: 'CardStatusId', 
    label: 'Kart Durum ID', 
    text: 'Kart Durum ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '100px', 
    size: '100px',
    searchable: 'int',
    resizable: true
  },
  { 
    field: 'TemporaryId', 
    label: 'Geçici ID', 
    text: 'Geçici ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '100px', 
    size: '100px',
    searchable: 'int',
    resizable: true
  },
  { 
    field: 'TemporaryDate', 
    label: 'Geçici Tarih', 
    text: 'Geçici Tarih',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    searchable: 'datetime',
    resizable: true
  },
  { 
    field: 'FacilityCode', 
    label: 'Tesis Kodu', 
    text: 'Tesis Kodu',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '100px', 
    size: '100px',
    searchable: 'text',
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
    field: 'TransferTagCode', 
    label: 'Transfer Tag Kodu', 
    text: 'Transfer Tag Kodu',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'BackupCardUID', 
    label: 'Yedek Kart UID', 
    text: 'Yedek Kart UID',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'isFingerPrint', 
    label: 'Parmak İzi', 
    text: 'Parmak İzi',
    type: 'checkbox' as ColumnType, 
    sortable: true, 
    width: '80px', 
    size: '80px',
    searchable: false,
    resizable: true
  },
  { 
    field: 'FingerPrintUpdateTime', 
    label: 'Parmak İzi Güncelleme', 
    text: 'Parmak İzi Güncelleme',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '180px', 
    size: '180px',
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
  },
  { 
    field: 'DeletedAt', 
    label: 'Silinme Tarihi', 
    text: 'Silinme Tarihi',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    searchable: 'datetime',
    resizable: true
  }
];

// AccessGroupReader columns based on API response structure
export const accessGroupReadersGridColumns: TableColumn[] = [
  { 
    field: 'AccessGroupReaderID', 
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
    field: 'AccessGroupName', 
    searchField: 'AccessGroup.AccessGroupName',
    label: 'Geçiş Yetkisi Adı', 
    text: 'Geçiş Yetkisi Adı',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '200px', 
    size: '200px',
    searchable: 'text',
    resizable: true,
    render: (record: any) => {
      return record.AccessGroup?.AccessGroupName || '';
    },
    joinTable: 'AccessGroup'
  },
  { 
    field: 'ReaderName', 
    searchField: 'Terminal.ReaderName',
    label: 'Okuyucu Adı', 
    text: 'Okuyucu Adı',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '200px', 
    size: '200px',
    searchable: 'text',
    resizable: true,
    render: (record: any) => {
      return record.Terminal?.ReaderName || '';
    },
    joinTable: 'Terminal'
  },
  { 
    field: 'TimeZone', 
    searchField: 'TimeZone.TimeZoneName',
    label: 'Saat Dilimi', 
    text: 'Saat Dilimi',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '150px', 
    size: '150px',
    searchable: 'text',
    resizable: true,
    render: (record: any) => {
      return record.TimeZone?.TimeZoneName || '';
    }
  },
  { 
    field: 'ReaderID', 
    searchField: 'Terminal.ReaderID',
    label: 'Okuyucu ID', 
    text: 'Okuyucu ID',
    type: 'int' as ColumnType, 
    sortable: false, 
    width: '100px', 
    size: '100px',
    searchable: 'int',
    resizable: true,
    render: (record: any) => {
      return record.Terminal?.ReaderID || record.ReaderID || '';
    }
  },
  { 
    field: 'AccessGroupID', 
    searchField: 'AccessGroup.AccessGroupID',
    label: 'Erişim Grubu ID', 
    text: 'Erişim Grubu ID',
    type: 'int' as ColumnType, 
    sortable: false, 
    width: '120px', 
    size: '120px',
    searchable: 'int',
    resizable: true,
    render: (record: any) => {
      return record.AccessGroup?.AccessGroupID || record.AccessGroupID || '';
    },
    joinTable: 'AccessGroup'
  }
];

// Employee Histories Grid Columns
export const employeeHistoriesGridColumns: TableColumn[] = [
  { 
    field: 'ID', 
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
    field: 'Personel', 
    label: 'Personel', 
    text: 'Personel',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'Firma', 
    label: 'Firma', 
    text: 'Firma',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    searchable: 'text',
    resizable: true,
    joinTable: 'Company'
  },
  { 
    field: 'Departman', 
    label: 'Departman', 
    text: 'Departman',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    searchable: 'text',
    resizable: true,
    joinTable: 'Department'
  },
  { 
    field: 'Kadro', 
    label: 'Kadro', 
    text: 'Kadro',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'text',
    resizable: true,
    joinTable: 'Kadro'
  },
  { 
    field: 'Görev', 
    label: 'Görev', 
    text: 'Görev',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'Başlama', 
    label: 'Başlama', 
    text: 'Başlama',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    searchable: 'date',
    resizable: true
  },
  { 
    field: 'Bitiş', 
    label: 'Bitiş', 
    text: 'Bitiş',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    searchable: 'date',
    resizable: true
  }
];

// Subscription Events Grid Columns
export const subscriptionEventsGridColumns: TableColumn[] = [
  { 
    field: 'SubscriptionEventsID', 
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
    field: 'CafeteriaEventID', 
    label: 'İşlem No', 
    text: 'İşlem No',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'int',
    resizable: true
  },
  { 
    field: 'SubscriptionPackage', 
    searchField: 'SubscriptionPackage.Name',
    label: 'Abone Paketi', 
    text: 'Abone Paketi',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    searchable: 'text',
    resizable: true,
    render: (record: any) => {
      return record.SubscriptionPackage?.Name || record.SubscriptionPackage?.PackageName || '';
    }
  },
  { 
    field: 'CafeteriaApplication', 
    searchField: 'CafeteriaApplication.ApplicationName',
    label: 'Uygulama', 
    text: 'Uygulama',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    searchable: 'text',
    resizable: true,
    render: (record: any) => {
      return record.CafeteriaApplication?.ApplicationName || record.CafeteriaEvent?.ApplicationName || '';
    },
    joinTable: ['CafeteriaApplication', 'CafeteriaEvent']
  },
  { 
    field: 'Day', 
    label: 'Gün', 
    text: 'Gün',
    type: 'date' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'date',
    resizable: true,
    render: (record: any) => {
      // Day is an integer (year), convert to YYYY-01-01 format
      if (record.Day) {
        return `${record.Day}-01-01`;
      }
      return '';
    }
  },
  { 
    field: 'Qty', 
    label: 'Kullanım Durumu', 
    text: 'Kullanım Durumu',
    type: 'checkbox' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'checkbox',
    resizable: true
  },
  { 
    field: 'EventTime', 
    label: 'Satın Alma Tarihi', 
    text: 'Satın Alma Tarihi',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '180px', 
    size: '180px',
    searchable: 'datetime',
    resizable: true,
    render: (record: any) => {
      return record.CafeteriaEvent?.EventTime || record.CafeteriaEvent?.RecordTime || '';
    },
    joinTable: 'CafeteriaEvent'
  }
];

// Get grid columns by grid ID
export function getGridColumns(gridId: string): TableColumn[] {
  switch (gridId) {
    case 'EmployeeCardGrid':
      return cardGridColumns;
    case 'EmployeeAccessGroupReaders':
      return accessGroupReadersGridColumns;
    case 'EmployeeHistories':
      return employeeHistoriesGridColumns;
    case 'SubscriptionEvents':
      return subscriptionEventsGridColumns;
    default:
      return [];
  }
}
