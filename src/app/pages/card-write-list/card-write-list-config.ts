// CardWriteList configuration - Join options
import { JoinOption } from 'src/app/components/data-table/data-table.component';

export const joinOptions: JoinOption[] = [
  { key: 'Card', label: 'Kart', nested: false, default: true },
  { key: 'CardTemplate', label: 'Kart Şablonu', nested: false, default: true }
];
