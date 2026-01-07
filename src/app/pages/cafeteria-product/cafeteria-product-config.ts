// CafeteriaProduct configuration - Join options
import { JoinOption } from 'src/app/components/data-table/data-table.component';

export const joinOptions: JoinOption[] = [
  {
    key: 'CafeteriaProductType',
    label: 'Ürün Tipi',
    nested: false,
    default: true
  }
];
