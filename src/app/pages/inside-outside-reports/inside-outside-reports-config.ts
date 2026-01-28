// InsideOutsideReports configuration - Join options
import { JoinOption } from 'src/app/components/data-table/data-table.component';

export const joinOptions: JoinOption[] = [
  { key: 'Employee', label: 'Personel', nested: false, default: true },
  { key: 'Company', label: 'Firma', nested: false, default: true },
  { key: 'Kadro', label: 'Kadro', nested: false, default: true },
];
