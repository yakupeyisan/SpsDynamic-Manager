// Günlük Yoklama — AccessEvents ile aynı filtre alanı / searchField deseni (Employee.*)
import { TableColumn, ColumnType, TableRow } from 'src/app/components/data-table/data-table.component';
import { environment } from 'src/environments/environment';
import { formatDateValueForApi } from 'src/app/utils/date-format-api.util';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

function formatTimeCell(v: unknown): string {
  if (v == null || v === '') return '';
  const s = String(v).trim();
  const m = s.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return s;
  return `${m[1].padStart(2, '0')}:${m[2]}${m[3] != null ? ':' + m[3] : ''}`;
}

function formatDayCell(v: unknown): string {
  if (v == null || v === '') return '';
  const s = String(v).trim();
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('tr-TR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }
  return s;
}

function ymdFromFilterValue(v: unknown): string {
  if (v == null || v === '') return '';
  const s = String(v).trim();
  const first = s.includes(',') ? s.split(',')[0].trim() : s;
  return formatDateValueForApi(first, 'date');
}

export const tableColumns: TableColumn[] = [
  // Tarih aralığı (yalnızca filtre; gridde gizli)
  {
    field: 'startDate',
    label: 'Başlangıç Tarihi',
    text: 'Başlangıç Tarihi',
    type: 'date' as ColumnType,
    hidden: true,
    sortable: false,
    searchable: 'date' as ColumnType,
    resizable: true
  },
  {
    field: 'endDate',
    label: 'Bitiş Tarihi',
    text: 'Bitiş Tarihi',
    type: 'date' as ColumnType,
    hidden: true,
    sortable: false,
    searchable: 'date' as ColumnType,
    resizable: true
  },
  {
    field: 'Employee.IdentificationNumber',
    searchField: 'Employee.IdentificationNumber',
    label: 'Kimlik Numarası',
    text: 'Kimlik Numarası',
    type: 'text' as ColumnType,
    sortable: false,
    width: '130px',
    size: '130px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      const employee = record['Employee'] as any;
      return employee?.['IdentificationNumber'] ?? '';
    }
  },
  {
    field: 'Employee.Name',
    label: 'Adı',
    text: 'Adı',
    type: 'text' as ColumnType,
    sortable: false,
    width: '150px',
    size: '150px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      const employee = record['Employee'] as any;
      return employee?.['Name'] ? String(employee['Name']).trim() : '';
    }
  },
  {
    field: 'Employee.SurName',
    label: 'Soyad',
    text: 'Soyad',
    type: 'text' as ColumnType,
    sortable: false,
    width: '150px',
    size: '150px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      const employee = record['Employee'] as any;
      return employee?.['SurName'] ?? '';
    }
  },
  {
    field: 'Employee.Company.PdksCompanyName',
    label: 'Firma Adı',
    text: 'Firma Adı',
    type: 'enum' as ColumnType,
    sortable: false,
    width: '150px',
    size: '150px',
    min: 20,
    searchable: 'enum' as ColumnType,
    searchField: 'Employee.Company.PdksCompanyID',
    resizable: true,
    load: {
      url: `${apiUrl}/api/PdksCompanys`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) =>
        (data?.records || []).map((item: any) => {
          const id = item?.PdksCompanyID ?? item?.CompanyID ?? item?.ID ?? item?.id ?? '';
          const text = item?.PdksCompanyName ?? item?.CompanyName ?? item?.Name ?? '';
          return { id: String(id), text: text || '(boş)' };
        })
    },
    render: (record: TableRow) => {
      const emp = record['Employee'] as any;
      const company = emp?.Company;
      return company?.PdksCompanyName ?? company?.Name ?? '';
    }
  },
  {
    field: 'Employee.Kadro.Name',
    label: 'Kadro Adı',
    text: 'Kadro Adı',
    type: 'enum' as ColumnType,
    sortable: false,
    width: '150px',
    size: '150px',
    min: 20,
    searchable: 'enum' as ColumnType,
    searchField: 'Employee.Kadro.PdksStaffID',
    resizable: true,
    load: {
      url: `${apiUrl}/api/PdksStaffs`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) =>
        (data?.records || []).map((item: any) => {
          const id = item?.PdksStaffID ?? item?.ID ?? item?.id ?? '';
          const text = item?.Name ?? '';
          return { id: String(id), text: text || '(boş)' };
        })
    },
    render: (record: TableRow) => (record['Employee'] as any)?.Kadro?.Name ?? ''
  },
  {
    field: 'Employee.EmployeeDepartments.Department.DepartmentName',
    exportDisplayField: 'Employee.EmployeeDepartments.Department.DepartmentName',
    label: 'Bölüm',
    text: 'Bölüm',
    type: 'enum' as ColumnType,
    sortable: false,
    width: '180px',
    size: '180px',
    min: 20,
    searchable: 'enum' as ColumnType,
    searchField: 'Employee.EmployeeDepartments.DepartmentID',
    resizable: true,
    load: {
      url: `${apiUrl}/api/Departments`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) =>
        (data?.records || []).map((item: any) => ({
          id: item?.DepartmentID ?? item?.id,
          text: item?.DepartmentName ?? item?.Name ?? ''
        }))
    },
    render: (record: TableRow) => {
      const emp = record['Employee'] as any;
      const depts = emp?.EmployeeDepartments;
      if (depts && Array.isArray(depts) && depts.length > 0) {
        return (
          depts
            .map((ed: any) => ed?.Department?.DepartmentName)
            .filter(Boolean)
            .join(', ') || ''
        );
      }
      return '';
    }
  },
  // Sonuç (filtrede yok)
  {
    field: 'Day',
    label: 'Tarih',
    text: 'Tarih',
    type: 'date' as ColumnType,
    sortable: true,
    width: '120px',
    size: '120px',
    min: 20,
    searchable: false,
    resizable: true,
    render: (record: TableRow) => formatDayCell(record['Day'])
  },
  {
    field: 'DayOfWeek',
    label: 'Gün',
    text: 'Gün',
    type: 'text' as ColumnType,
    sortable: true,
    width: '100px',
    size: '100px',
    min: 20,
    searchable: false,
    resizable: true
  },
  {
    field: 'EmployeeID',
    label: 'Personel ID',
    text: 'Personel ID',
    type: 'int' as ColumnType,
    sortable: true,
    width: '100px',
    size: '100px',
    min: 20,
    searchable: false,
    resizable: true
  },
  {
    field: 'StartTime',
    label: 'Mesai Başlangıç',
    text: 'Mesai Başlangıç',
    type: 'time' as ColumnType,
    sortable: true,
    width: '120px',
    size: '120px',
    min: 20,
    searchable: false,
    resizable: true,
    render: (record: TableRow) => formatTimeCell(record['StartTime'])
  },
  {
    field: 'FirstEntry',
    label: 'İlk Giriş',
    text: 'İlk Giriş',
    type: 'time' as ColumnType,
    sortable: true,
    width: '120px',
    size: '120px',
    min: 20,
    searchable: false,
    resizable: true,
    render: (record: TableRow) => formatTimeCell(record['FirstEntry'])
  },
  {
    field: 'Message',
    label: 'Mesaj',
    text: 'Mesaj',
    type: 'text' as ColumnType,
    sortable: true,
    width: '280px',
    size: '280px',
    min: 40,
    searchable: false,
    resizable: true
  }
];

export { ymdFromFilterValue };
