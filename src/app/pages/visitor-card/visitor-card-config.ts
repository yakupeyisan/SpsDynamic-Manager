// VisitorCard configuration - Join options
import { JoinOption } from 'src/app/components/data-table/data-table.component';

export const joinOptions: JoinOption[] = [
  { key: 'CardType', label: 'Kart Tipi', nested: false, default: true },
  { key: 'CardStatus', label: 'Kart Durumu', nested: false, default: true },
  { key: 'CafeteriaGroup', label: 'Kafeterya Grubu', nested: false, default: true },
];

