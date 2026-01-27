// VisitorEvents configuration - Join options
import { JoinOption, TableColumnGroup } from 'src/app/components/data-table/data-table.component';

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

// Column groups configuration
export const columnGroups: TableColumnGroup[] = [
  {
    span: 5,
    text: 'Ziyaretçi'
  },
  {
    span: 4,
    text: 'Ziyaret Edilen'
  },
  {
    span: 6,
    text: 'Diğer'
  }
];
