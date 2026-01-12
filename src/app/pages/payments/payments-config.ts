// Payments configuration - Join options
import { JoinOption } from 'src/app/components/data-table/data-table.component';

export const joinOptions: JoinOption[] = [
  { key: 'Account', label: 'Hesap', nested: false, default: true },
  { key: 'PaymentType', label: 'Ödeme Tipi', nested: false, default: false },
];
