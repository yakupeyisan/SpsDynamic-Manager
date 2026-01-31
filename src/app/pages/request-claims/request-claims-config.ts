// RequestClaims configuration - Join options
import { JoinOption } from 'src/app/components/data-table/data-table.component';

export const joinOptions: JoinOption[] = [
  { key: 'RequestUser', label: 'Talep Eden', nested: false, default: true },
  { key: 'ApprovedUser', label: 'Onaylayan', nested: false, default: true },
  { key: 'RejectedUser', label: 'Reddeden', nested: false, default: true }
];
