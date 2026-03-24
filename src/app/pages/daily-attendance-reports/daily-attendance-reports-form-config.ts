// Günlük Yoklama — salt okunur özet formu
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

export const formFields: TableColumn[] = [
  {
    field: 'Day',
    label: 'Tarih',
    text: 'Tarih',
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  {
    field: 'DayOfWeek',
    label: 'Gün',
    text: 'Gün',
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  {
    field: 'EmployeeID',
    label: 'Personel ID',
    text: 'Personel ID',
    type: 'int' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  {
    field: 'EmployeeName',
    label: 'Ad',
    text: 'Ad',
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true,
    render: (record: any) => record?.Employee?.Name ?? record?.Name ?? ''
  },
  {
    field: 'EmployeeSurName',
    label: 'Soyad',
    text: 'Soyad',
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true,
    render: (record: any) => record?.Employee?.SurName ?? record?.SurName ?? ''
  },
  {
    field: 'StartTime',
    label: 'Mesai Başlangıç',
    text: 'Mesai Başlangıç',
    type: 'time' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  {
    field: 'FirstEntry',
    label: 'İlk Giriş',
    text: 'İlk Giriş',
    type: 'time' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  {
    field: 'Message',
    label: 'Mesaj',
    text: 'Mesaj',
    type: 'textarea' as ColumnType,
    fullWidth: true,
    disabled: true
  }
];

export const formTabs: FormTab[] = [
  {
    label: 'Günlük Yoklama',
    fields: [
      'Day',
      'DayOfWeek',
      'EmployeeID',
      'EmployeeName',
      'EmployeeSurName',
      'StartTime',
      'FirstEntry',
      'Message'
    ]
  }
];

export const formLoadUrl = '';
export const formLoadRequest: ((recid: any, parentFormData?: any) => any) | undefined = undefined;
export const formDataMapper = (data: any) => data;
