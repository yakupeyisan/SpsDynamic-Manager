// TerminalTariffs configuration - Join options
import { JoinOption } from 'src/app/components/data-table/data-table.component';

export const joinOptions: JoinOption[] = [
  { key: 'Terminal', label: 'Terminal', nested: false, default: true },
  { key: 'CafeteriaGroup', label: 'Kafeterya Grubu', nested: false, default: true }
];
