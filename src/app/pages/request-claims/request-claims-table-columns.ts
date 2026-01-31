// RequestClaims table columns configuration
import { TableColumn, ColumnType, TableRow } from 'src/app/components/data-table/data-table.component';

export const tableColumns: TableColumn[] = [
  {
    field: 'Id',
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
    field: 'ClaimName',
    label: 'Talep Adı',
    text: 'Talep Adı',
    type: 'text' as ColumnType,
    sortable: true,
    width: '200px',
    size: '200px',
    searchable: 'text',
    resizable: true
  },
  {
    field: 'ClaimDesc',
    label: 'Yetki Açıklaması',
    text: 'Yetki Açıklaması',
    type: 'text' as ColumnType,
    sortable: true,
    width: '220px',
    size: '220px',
    searchable: 'text',
    resizable: true
  },
  {
    field: 'Description',
    label: 'Açıklama',
    text: 'Açıklama',
    type: 'text' as ColumnType,
    sortable: true,
    width: '250px',
    size: '250px',
    searchable: 'text',
    resizable: true
  },
  {
    field: 'RequestUser.Name',
    label: 'Talep Eden Ad',
    text: 'Talep Eden Ad',
    type: 'text' as ColumnType,
    sortable: false,
    width: '120px',
    size: '120px',
    searchable: 'text',
    resizable: true,
    render: (record: TableRow) => record['RequestUser']?.Name ?? ''
  },
  {
    field: 'RequestUser.SurName',
    label: 'Talep Eden Soyad',
    text: 'Talep Eden Soyad',
    type: 'text' as ColumnType,
    sortable: false,
    width: '120px',
    size: '120px',
    searchable: 'text',
    resizable: true,
    render: (record: TableRow) => record['RequestUser']?.SurName ?? ''
  },
  {
    field: 'RequestedAt',
    label: 'Talep Tarihi',
    text: 'Talep Tarihi',
    type: 'datetime' as ColumnType,
    sortable: true,
    width: '150px',
    size: '150px',
    searchable: 'text',
    resizable: true
  },
  {
    field: 'ApprovedUser.Name',
    label: 'Onaylayan Ad',
    text: 'Onaylayan Ad',
    type: 'text' as ColumnType,
    sortable: false,
    width: '120px',
    size: '120px',
    searchable: 'text',
    resizable: true,
    render: (record: TableRow) => record['ApprovedUser']?.Name ?? ''
  },
  {
    field: 'ApprovedUser.SurName',
    label: 'Onaylayan Soyad',
    text: 'Onaylayan Soyad',
    type: 'text' as ColumnType,
    sortable: false,
    width: '120px',
    size: '120px',
    searchable: 'text',
    resizable: true,
    render: (record: TableRow) => record['ApprovedUser']?.SurName ?? ''
  },
  {
    field: 'ApprovedAt',
    label: 'Onay Tarihi',
    text: 'Onay Tarihi',
    type: 'datetime' as ColumnType,
    sortable: true,
    width: '150px',
    size: '150px',
    searchable: 'text',
    resizable: true
  },
  {
    field: 'RejectedUser.Name',
    label: 'Reddeden Ad',
    text: 'Reddeden Ad',
    type: 'text' as ColumnType,
    sortable: false,
    width: '120px',
    size: '120px',
    searchable: 'text',
    resizable: true,
    render: (record: TableRow) => record['RejectedUser']?.Name ?? ''
  },
  {
    field: 'RejectedUser.SurName',
    label: 'Reddeden Soyad',
    text: 'Reddeden Soyad',
    type: 'text' as ColumnType,
    sortable: false,
    width: '120px',
    size: '120px',
    searchable: 'text',
    resizable: true,
    render: (record: TableRow) => record['RejectedUser']?.SurName ?? ''
  },
  {
    field: 'RejectedAt',
    label: 'Red Tarihi',
    text: 'Red Tarihi',
    type: 'datetime' as ColumnType,
    sortable: true,
    width: '150px',
    size: '150px',
    searchable: 'text',
    resizable: true
  },
  {
    field: 'ResponseMessage',
    label: 'Yanıt Mesajı',
    text: 'Yanıt Mesajı',
    type: 'text' as ColumnType,
    sortable: true,
    width: '200px',
    size: '200px',
    searchable: 'text',
    resizable: true
  }
];
