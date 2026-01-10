// SmsTransactions configuration - Join options
import { JoinOption } from 'src/app/components/data-table/data-table.component';

export const joinOptions: JoinOption[] = [
  { key: 'Employee', label: 'Personel', nested: false, default: true },
  { key: 'SmsSetting', label: 'SMS Ayarı', nested: false, default: true }
];
