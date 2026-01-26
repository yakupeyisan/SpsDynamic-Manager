// AccessDetails configuration - Join options
import { JoinOption } from 'src/app/components/data-table/data-table.component';

export const joinOptions: JoinOption[] = [
  { key: 'Company', label: 'Firma', nested: false, default: true },
  { key: 'Kadro', label: 'Kadro', nested: false, default: true },
  { key: 'EmployeeDepartments', label: 'Bölümler', nested: true, default: true },
  { key: 'EmployeeAccessGroups', label: 'Geçiş Yetki Grupları', nested: true, default: true },
  { key: 'AccessGroup', label: 'Geçiş Yetki Grubu', nested: true, parent: 'EmployeeAccessGroups' },
  { key: 'AccessGroupReaders', label: 'Okuyucular', nested: true, parent: 'EmployeeAccessGroups' },
  { key: 'CustomField', label: 'Özel Alanlar', nested: false, default: true },
  { key: 'Cards', label: 'Kartlar', nested: true, default: true },
];
