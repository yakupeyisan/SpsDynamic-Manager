// EmployeeWithLocation configuration - Join options
import { JoinOption } from 'src/app/components/data-table/data-table.component';

export const joinOptions: JoinOption[] = [
  { key: 'Company', label: 'Firma', nested: false, default: true },
  { key: 'Kadro', label: 'Kadro', nested: false, default: true },
  { key: 'EmployeeDepartments', label: 'Departman', nested: false, default: true, parent: 'EmployeeDepartments' },
  { key: 'EmployeeLastAccessEvent', label: 'Son Erişim Olayı', nested: false, default: true }
];
