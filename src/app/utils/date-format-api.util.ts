/**
 * Tarih filtrelerinin backend'e istek atılırken kullanılacak formatları.
 * - date: yyyy-MM-dd
 * - datetime: yyyy-MM-dd HH:mm (24 saat)
 * - time: HH:mm (24 saat)
 */
import { ColumnType } from '../components/data-table/filter.model';

function toDate(value: string | Date | null | undefined): Date | null {
  if (value == null || value === '') return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const s = String(value).trim();
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function pad2(n: number): string {
  return n < 10 ? '0' + n : String(n);
}

/**
 * Tek bir tarih/saat değerini API formatına çevirir.
 * @param value ISO string, "yyyy-MM-dd", "HH:mm", Date vb.
 * @param type 'date' | 'time' | 'datetime'
 * @returns date: yyyy-MM-dd, datetime: yyyy-MM-dd HH:mm, time: HH:mm (24H); parse edilemezse boş string
 */
export function formatDateValueForApi(
  value: string | Date | null | undefined,
  type: 'date' | 'time' | 'datetime'
): string {
  if (value == null || value === '') return '';

  const str = typeof value === 'string' ? value.trim() : '';
  if (typeof value === 'string' && !value.includes('T') && !value.includes('-')) {
    // Zaten "HH:mm" veya "HH:mm:ss" gibi saat formatında olabilir
    if (type === 'time') {
      const timeMatch = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
      if (timeMatch) {
        const h = parseInt(timeMatch[1], 10);
        const m = parseInt(timeMatch[2], 10);
        if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
          return `${pad2(h)}:${pad2(m)}`;
        }
      }
      return str;
    }
  }

  const d = toDate(value);
  if (!d) return str || '';

  switch (type) {
    case 'date':
      return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    case 'time':
      return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
    case 'datetime':
      return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
    default:
      return str || '';
  }
}

/**
 * ColumnType'dan API format tipine map.
 */
export function getDateApiType(columnType: ColumnType): 'date' | 'time' | 'datetime' | null {
  if (columnType === 'date' || columnType === 'time' || columnType === 'datetime') {
    return columnType;
  }
  return null;
}

/**
 * Filter condition value'yu (tek değer veya between için "min,max") API formatına çevirir.
 */
export function formatFilterDateValueForApi(
  value: any,
  columnType: ColumnType,
  operator?: string
): any {
  const apiType = getDateApiType(columnType);
  if (!apiType) return value;

  if (value == null || value === '') return value;

  if (operator === 'between' && typeof value === 'string' && value.includes(',')) {
    const [minVal, maxVal] = value.split(',').map((v: string) => v.trim());
    const formattedMin = formatDateValueForApi(minVal, apiType);
    const formattedMax = formatDateValueForApi(maxVal, apiType);
    return `${formattedMin},${formattedMax}`;
  }

  return formatDateValueForApi(value, apiType);
}
