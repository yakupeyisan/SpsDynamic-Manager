// TerminalLogs form configuration
import { TableColumn, FormTab } from 'src/app/components/data-table/data-table.component';
import { tableColumns } from './terminal-logs-table-columns';

// Form fields - same as table columns for read-only view
export const formFields: TableColumn[] = tableColumns.map(col => ({
  ...col,
  disabled: true // Make all fields read-only
}));

// Form tabs - single tab for all fields
export const formTabs: FormTab[] = [
  {
    label: 'Genel Bilgiler',
    fields: formFields.map(f => f.field)
  }
];

// Form load URL
export const formLoadUrl = '';

// Form load request - not needed for terminal logs (read-only)
export const formLoadRequest = undefined;

// Form data mapper - not needed for terminal logs (read-only)
export const formDataMapper = undefined;
