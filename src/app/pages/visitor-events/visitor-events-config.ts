// VisitorEvents configuration - Join options
import { JoinOption } from 'src/app/components/data-table/data-table.component';

export const joinOptions: JoinOption[] = [
  {
    key: 'VisitorEmployee',
    label: 'Ziyaretçi',
    nested: false,
    default: true
  },
  {
    key: 'VisitedEmployee',
    label: 'Ziyaret Edilen Kişi',
    nested: false,
    default: true
  }
];
