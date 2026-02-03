/**
 * Rapor filtrelerinde enum/list alanları için serializable load config.
 * Tüm sayfalara uyumlu generic yapı - kaydedilirken url, method, data, idField, textField saklanır.
 */
import { TableColumn } from '../components/data-table/data-table.component';

export interface SerializableLoadConfig {
  url: string;
  method?: 'GET' | 'POST';
  data?: any;
  recordsPath?: string;
  idField: string;
  textField: string;
}

/**
 * API path'ine göre id/text alan eşlemesi (tüm sayfalar için ortak)
 */
const API_FIELD_MAP: Array<{ pattern: RegExp | string; idField: string; textField: string }> = [
  { pattern: /\/api\/Departments/i, idField: 'DepartmentID', textField: 'DepartmentName' },
  { pattern: /\/api\/PdksCompanys/i, idField: 'PdksCompanyID', textField: 'PdksCompanyName' },
  { pattern: /\/api\/PdksStaffs/i, idField: 'ID', textField: 'Name' },
  { pattern: /\/api\/AccessGroups/i, idField: 'AccessGroupID', textField: 'AccessGroupName' },
  { pattern: /\/api\/Authorizations/i, idField: 'Id', textField: 'Name' },
  { pattern: /\/api\/Terminals/i, idField: 'TerminalID', textField: 'ReaderName' },
  { pattern: /\/api\/CafeteriaAccounts/i, idField: 'CafeteriaAccountID', textField: 'AccountName' },
  { pattern: /\/api\/CafeteriaGroups/i, idField: 'CafeteriaGroupID', textField: 'Name' },
  { pattern: /\/api\/CardTypes/i, idField: 'CardTypeID', textField: 'Name' },
  { pattern: /\/api\/CardStatuses/i, idField: 'CardStatusId', textField: 'Name' },
  { pattern: /\/api\/CardCodeTypes/i, idField: 'CardCodeTypeID', textField: 'Name' },
  { pattern: /\/api\/CafeteriaApplications/i, idField: 'CafeteriaApplicationID', textField: 'Name' },
  { pattern: /\/api\/CafeteriaPlaces/i, idField: 'CafeteriaPlaceID', textField: 'Name' },
  { pattern: /\/api\/ReportTasks/i, idField: 'Id', textField: 'Name' },
  { pattern: /\/api\/ReportTemplates/i, idField: 'Id', textField: 'Name' },
  { pattern: /\/api\/CardTemplates/i, idField: 'Id', textField: 'Name' },
];

function getFieldsForUrl(url: string): { idField: string; textField: string } {
  for (const { pattern, idField, textField } of API_FIELD_MAP) {
    if (typeof pattern === 'string' ? url.includes(pattern) : pattern.test(url)) {
      return { idField, textField };
    }
  }
  return { idField: 'id', textField: 'Name' };
}

/**
 * Column.load'dan serializable load config üretir.
 * Rapor kaydedilirken bu config Filters içinde saklanır.
 */
export function buildSerializableLoadConfig(column: TableColumn): SerializableLoadConfig | null {
  const load = column?.load;
  if (!load || !load.url) return null;
  if (typeof load.url === 'function') return null;

  const url = load.url;
  const { idField, textField } = getFieldsForUrl(url);
  const method = (load.method || 'POST') as 'GET' | 'POST';
  let data = load.data;
  if (typeof data === 'function') data = {};
  const recordsPath = 'records';

  return {
    url,
    method,
    data: data || (method === 'POST' ? { limit: -1, offset: 0 } : undefined),
    recordsPath,
    idField,
    textField,
  };
}
