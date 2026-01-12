// PayStationLogs join options configuration
import { JoinOption } from 'src/app/components/data-table/data-table.component';

export const joinOptions: JoinOption[] = [
  {
    key: 'Employee',
    label: 'Çalışan',
    nested: false
  },
  {
    key: 'PayStation',
    label: 'Otomat',
    nested: false
  }
];
