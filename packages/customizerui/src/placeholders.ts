/**
 * Placeholder texts for Customizer UI components
 */
export const PLACEHOLDERS = {
  // Select Component
  SELECT_OPTION: 'Select an option...',
  
  // Filter Panel Component
  FILTER_OPERATOR: 'Operator',
  FILTER_MIN: 'Min',
  FILTER_MAX: 'Max',
  FILTER_SELECT_VALUE: 'Select value',
  FILTER_SELECT_VALUES: 'Select values',
  FILTER_SELECT_DATE: 'Select date',
  FILTER_VALUE: 'Value',
  FILTER_SELECT_FIELD: 'Select Field',
  
  // Data Table Component
  SEARCH: 'Search...',
  
  // Input Component (default empty, but can be used)
  INPUT_EMPTY: '',
} as const;

/**
 * Type for placeholder keys
 */
export type PlaceholderKey = keyof typeof PLACEHOLDERS;

/**
 * Get placeholder text by key
 */
export function getPlaceholder(key: PlaceholderKey): string {
  return PLACEHOLDERS[key];
}

/**
 * Get all placeholders as an object
 */
export function getAllPlaceholders(): Readonly<typeof PLACEHOLDERS> {
  return PLACEHOLDERS;
}
