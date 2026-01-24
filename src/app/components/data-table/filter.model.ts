export type FilterOperator = 
  | 'equals' 
  | 'notEquals' 
  | 'contains' 
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'lessThan'
  | 'lessThanOrEqual'
  | 'between'
  | 'in'
  | 'notIn'
  | 'isEmpty'
  | 'isNotEmpty';

export type FilterLogic = 'AND' | 'OR';

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: any;
  /**
   * Optional value type for API-side filtering (e.g. "int", "text", "datetime").
   * When provided, backend can parse "value" correctly.
   */
  type?: ColumnType;
}

export interface AdvancedFilter {
  logic: FilterLogic;
  conditions: FilterCondition[];
}

// w2ui compatible operator types
export type OperatorType = 'text' | 'number' | 'date' | 'list' | 'enum' | 'hex' | 'color';

// w2ui compatible column types
export type ColumnType = 
  | 'text' 
  | 'int' 
  | 'float' 
  | 'money' 
  | 'currency' 
  | 'percent' 
  | 'date' 
  | 'time' 
  | 'datetime' 
  | 'list' 
  | 'enum' 
  | 'combo' 
  | 'select' 
  | 'radio' 
  | 'checkbox' 
  | 'toggle' 
  | 'hex' 
  | 'color' 
  | 'alphanumeric' 
  | 'file'
  | 'picture'
  | 'textarea';

// Map column type to operator type (w2ui compatible)
export const OPERATORS_MAP: Record<ColumnType, OperatorType> = {
  'textarea': 'text',
  'text': 'text',
  'int': 'number',
  'float': 'number',
  'money': 'number',
  'currency': 'number',
  'percent': 'number',
  'hex': 'hex',
  'alphanumeric': 'text',
  'color': 'color',
  'date': 'date',
  'time': 'date',
  'datetime': 'date',
  'list': 'list',
  'combo': 'text',
  'enum': 'enum',
  'file': 'enum',
  'select': 'list',
  'radio': 'list',
  'checkbox': 'list',
  'toggle': 'list',
  'picture': 'text'
};

// w2ui compatible operators by type
export const W2UI_OPERATORS: Record<OperatorType, Array<FilterOperator | { oper: FilterOperator; text: string }>> = {
  'text': ['equals', 'startsWith', 'contains', 'endsWith'],
  'number': ['equals', 'between', 'greaterThan', 'lessThan', 'greaterThanOrEqual', 'lessThanOrEqual'],
  'date': ['equals', { oper: 'lessThan', text: 'before' }, { oper: 'greaterThan', text: 'since' }, 'between'],
  'list': ['equals'],
  'hex': ['equals', 'between'],
  'color': ['equals', 'startsWith', 'contains', 'endsWith'],
  'enum': ['in', 'notIn']
};

// Default operators for each type (w2ui compatible)
export const DEFAULT_OPERATORS: Record<OperatorType, FilterOperator> = {
  'text': 'startsWith',
  'number': 'equals',
  'date': 'equals',
  'list': 'equals',
  'enum': 'in',
  'hex': 'startsWith',
  'color': 'startsWith'
};

// Operator labels mapping
export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  'equals': 'Is',
  'notEquals': 'Is Not',
  'contains': 'Contains',
  'notContains': 'Not Contains',
  'startsWith': 'Begins',
  'endsWith': 'Ends',
  'greaterThan': '>',
  'greaterThanOrEqual': '>=',
  'lessThan': '<',
  'lessThanOrEqual': '<=',
  'in': 'In',
  'notIn': 'Not In',
  'isEmpty': 'Is Empty',
  'isNotEmpty': 'Is Not Empty',
  'between': 'Between'
};

export const FILTER_OPERATORS: { 
  value: FilterOperator; 
  label: string; 
  requiresValue: boolean;
  operatorTypes: OperatorType[];
}[] = [
  { value: 'equals', label: 'Is', requiresValue: true, operatorTypes: ['text', 'number', 'date', 'list', 'hex', 'color'] },
  { value: 'notEquals', label: 'Is Not', requiresValue: true, operatorTypes: ['text', 'number', 'date', 'list'] },
  { value: 'contains', label: 'Contains', requiresValue: true, operatorTypes: ['text', 'color'] },
  { value: 'notContains', label: 'Not Contains', requiresValue: true, operatorTypes: ['text', 'color'] },
  { value: 'startsWith', label: 'Begins', requiresValue: true, operatorTypes: ['text', 'hex', 'color'] },
  { value: 'endsWith', label: 'Ends', requiresValue: true, operatorTypes: ['text', 'color'] },
  { value: 'greaterThan', label: '>', requiresValue: true, operatorTypes: ['number', 'date'] },
  { value: 'greaterThanOrEqual', label: '>=', requiresValue: true, operatorTypes: ['number'] },
  { value: 'lessThan', label: '<', requiresValue: true, operatorTypes: ['number', 'date'] },
  { value: 'lessThanOrEqual', label: '<=', requiresValue: true, operatorTypes: ['number'] },
  { value: 'between', label: 'Between', requiresValue: true, operatorTypes: ['number', 'date', 'hex'] },
  { value: 'in', label: 'In', requiresValue: true, operatorTypes: ['enum'] },
  { value: 'notIn', label: 'Not In', requiresValue: true, operatorTypes: ['enum'] },
  { value: 'isEmpty', label: 'Is Empty', requiresValue: false, operatorTypes: ['text', 'number', 'date', 'list', 'enum'] },
  { value: 'isNotEmpty', label: 'Is Not Empty', requiresValue: false, operatorTypes: ['text', 'number', 'date', 'list', 'enum'] },
];

export function getOperatorTypeForColumnType(columnType: ColumnType): OperatorType {
  return OPERATORS_MAP[columnType] || 'text';
}

export function getOperatorsForOperatorType(operatorType: OperatorType): FilterOperator[] {
  const operators = W2UI_OPERATORS[operatorType] || [];
  return operators.map(op => {
    if (typeof op === 'string') {
      return op as FilterOperator;
    } else {
      return op.oper;
    }
  });
}

export function getDefaultOperatorForType(operatorType: OperatorType): FilterOperator {
  return DEFAULT_OPERATORS[operatorType] || 'equals';
}

export function getOperatorLabel(operator: FilterOperator, operatorType?: OperatorType): string {
  // Check if there's a custom label in W2UI_OPERATORS
  if (operatorType) {
    const operators = W2UI_OPERATORS[operatorType] || [];
    const found = operators.find(op => {
      if (typeof op === 'object' && op.oper === operator) {
        return true;
      }
      return op === operator;
    });
    if (found && typeof found === 'object') {
      return found.text;
    }
  }
  return OPERATOR_LABELS[operator] || operator;
}

