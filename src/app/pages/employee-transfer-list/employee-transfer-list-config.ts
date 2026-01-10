// EmployeeTransferList configuration - Join options
import { JoinOption } from 'src/app/components/data-table/data-table.component';

export const joinOptions: JoinOption[] = [
  { key: 'Company', label: 'Şirket', nested: false, default: true },
  { key: 'Department', label: 'Departman', nested: false, default: true }
];
