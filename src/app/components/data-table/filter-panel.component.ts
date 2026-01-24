import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { InputComponent } from '../input/input.component';
import { SelectComponent, SelectOption } from '../select/select.component';
import { ButtonComponent } from '../button/button.component';
import { AdvancedFilter, FilterCondition, FilterLogic, FilterOperator, FILTER_OPERATORS, ColumnType, OperatorType, getOperatorTypeForColumnType, getOperatorsForOperatorType, getDefaultOperatorForType, getOperatorLabel } from './filter.model';
import { TableColumn } from '../data-table/data-table.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
// PLACEHOLDERS constant (replacement for @customizer/ui)
// Note: These are now translated via TranslateService in the component
const PLACEHOLDERS = {
  SEARCH: 'table.search',
  SELECT_OPTION: 'filter.selectOption',
  FILTER_OPERATOR: 'filter.operator',
  FILTER_MIN: 'filter.min',
  FILTER_MAX: 'filter.max',
  FILTER_SELECT_VALUE: 'filter.selectValue',
  FILTER_SELECT_VALUES: 'filter.selectValues',
  FILTER_SELECT_DATE: 'filter.selectDate',
  FILTER_VALUE: 'filter.value',
  FILTER_SELECT_FIELD: 'filter.selectField'
};

@Component({
  selector: 'ui-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, InputComponent, SelectComponent, ButtonComponent],
  templateUrl: './filter-panel.component.html',
  styleUrl: './filter-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterPanelComponent implements OnInit {
  @Input() columns: TableColumn[] = [];
  @Input() filter?: AdvancedFilter;
  @Input() data?: any[]; // Optional: for auto-generating options from data
  @Input() limit?: number = 100; // Current limit value
  @Input() limitOptions?: number[] = [25, 50, 100, 250, 500, 1000]; // Available limit options
  @Input() enableReportSave?: boolean = true; // Enable report save feature
  @Input() hasActiveFilter?: boolean = false; // Whether there's an active filter applied
  
  @Output() filterChange = new EventEmitter<AdvancedFilter>();
  @Output() close = new EventEmitter<void>();
  @Output() clear = new EventEmitter<void>();
  @Output() limitChange = new EventEmitter<number>(); // Emit limit changes
  @Output() saveReportRequested = new EventEmitter<AdvancedFilter>(); // Emit when user wants to save current filters as report

  currentFilter: AdvancedFilter = {
    logic: 'AND',
    conditions: []
  };

  fieldOptions: SelectOption[] = [];
  currentLimit: number = 100;
  selectedFieldForAdd: string = '';
  
  logicOptions: SelectOption[] = [];

  // Cache for enum values to prevent creating new array references
  private readonly EMPTY_ARRAY: any[] = [];
  
  // Cache for loaded column options
  private columnOptionsCache: Map<string, SelectOption[]> = new Map();
  private columnOptionsLoading: Map<string, boolean> = new Map();;
  // Cache for options per field to prevent recreating arrays
  private optionsCache: Map<string, SelectOption[]> = new Map();
  private operatorsCache: Map<string, SelectOption[]> = new Map();

  PLACEHOLDERS = PLACEHOLDERS;
  
  getTranslatedPlaceholder(key: keyof typeof PLACEHOLDERS): string {
    return this.translate.instant(PLACEHOLDERS[key]);
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    public translate: TranslateService
  ) {}

  ngOnInit() {
    this.currentLimit = this.limit ?? 100;
    
    // Initialize logic options with translations
    this.logicOptions = [
      { label: this.translate.instant('filter.all'), value: 'AND' },
      { label: this.translate.instant('filter.any'), value: 'OR' }
    ];
    
    this.fieldOptions = this.columns
      .filter(col => col.searchable !== false) // Only show searchable columns
      .map(col => {
        // Try to get translation for column field
        const translationKey = `columns.${col.field}`;
        const translated = this.translate.instant(translationKey);
        const label = (translated && translated !== translationKey) ? translated : (col.label || col.text || col.field);
        return {
          label: label,
          value: col.field
        };
      });
    
    // Set default selected field for add
    const searchableColumns = this.columns.filter(col => col.searchable !== false);
    this.selectedFieldForAdd = searchableColumns[0]?.field || this.columns[0]?.field || '';

    if (this.filter) {
      this.currentFilter = { ...this.filter };
      // Validate operators for each condition
      this.currentFilter.conditions = this.currentFilter.conditions.map(cond => {
        // Ensure condition has type information (for API payloads and correct value parsing)
        if (!cond.type) {
          cond.type = this.getColumnType(cond.field);
        }
        if (!this.isValidOperatorForField(cond.operator, cond.field)) {
          const operatorType = this.getOperatorTypeForField(cond.field);
          const defaultOperator = getDefaultOperatorForType(operatorType);
          cond.operator = defaultOperator;
        }
        return cond;
      });
      
      if (!this.currentFilter.conditions || this.currentFilter.conditions.length === 0) {
        this.addCondition();
      }
    } else {
      this.addCondition();
    }
  }

  getOperator(operatorValue: FilterOperator) {
    return FILTER_OPERATORS.find(op => op.value === operatorValue);
  }

  requiresValue(operator: FilterOperator): boolean {
    const op = this.getOperator(operator);
    return op ? op.requiresValue : true;
  }

  getColumnForField(field: string): TableColumn | undefined {
    return this.columns.find(col => col.field === field|| col.searchField === field);
  }

  getFieldLabel(field: string): string {
    const column = this.getColumnForField(field);
    if (!column) return field;
    
    // Try to get translation for column field
    const translationKey = `columns.${column.field}`;
    const translated = this.translate.instant(translationKey);
    
    // If translation exists and is different from key, use it
    if (translated && translated !== translationKey) {
      return translated;
    }
    
    // Fallback to column.label or column.text or column.field
    return column.label || column.text || column.field;
  }

  getColumnType(field: string): ColumnType {
    const column = this.getColumnForField(field);
    if (column) {
      // If column has explicit type, use it
      if (column.type) {
        return column.type;
      }
      // If searchable is a type string, use it
      if (typeof column.searchable === 'string') {
        return column.searchable as ColumnType;
      }
    }
    // Fallback to auto-detection based on field name
    const fieldLower = field.toLowerCase();
    if (fieldLower.includes('email')) return 'text';
    if (fieldLower.includes('id') || fieldLower.includes('count') || fieldLower.includes('amount') || fieldLower.includes('price') || fieldLower.includes('total') || fieldLower.includes('quantity')) return 'int';
    if (fieldLower.includes('date') || fieldLower.includes('time')) return 'date';
    return 'text';
  }

  getFieldType(field: string): 'text' | 'number' | 'email' {
    // Check if field name indicates email type
    if (field.toLowerCase().includes('email')) {
      return 'email';
    }
    
    const columnType = this.getColumnType(field);
    // Map ColumnType to input component type
    switch (columnType) {
      case 'int':
      case 'float':
      case 'money':
      case 'currency':
      case 'percent':
        return 'number';
      case 'date':
      case 'time':
      case 'datetime':
      case 'text':
      case 'list':
      case 'enum':
      case 'combo':
      case 'select':
      case 'radio':
      case 'checkbox':
      case 'toggle':
      case 'hex':
      case 'color':
      case 'alphanumeric':
      case 'file':
      default:
        return 'text';
    }
  }

  getOperatorTypeForField(field: string): OperatorType {
    const columnType = this.getColumnType(field);
    return getOperatorTypeForColumnType(columnType);
  }

  getOperatorsForField(field: string): SelectOption[] {
    // Check cache first
    if (this.operatorsCache.has(field)) {
      return this.operatorsCache.get(field)!;
    }
    
    const operatorType = this.getOperatorTypeForField(field);
    const operators = getOperatorsForOperatorType(operatorType);
    
    const options = FILTER_OPERATORS
      .filter(op => op.operatorTypes.includes(operatorType) && operators.includes(op.value))
      .map(op => {
        // Use translate for operator labels
        let label = this.translate.instant(`filter.operators.${op.value}`);
        // If translation doesn't exist (returns the key), use custom label from W2UI_OPERATORS or default label
        if (label === `filter.operators.${op.value}`) {
          label = getOperatorLabel(op.value, operatorType);
          // Try to translate custom labels (before, since)
          if (label === 'before' || label === 'since') {
            const translatedCustom = this.translate.instant(`filter.operators.${label}`);
            if (translatedCustom !== `filter.operators.${label}`) {
              label = translatedCustom;
            }
          }
        }
        return {
          label: label,
          value: op.value
        };
      });
    
    // Cache the result
    this.operatorsCache.set(field, options);
    return options;
  }

  isValidOperatorForField(operator: FilterOperator, field: string): boolean {
    const operatorType = this.getOperatorTypeForField(field);
    const operators = getOperatorsForOperatorType(operatorType);
    return operators.includes(operator);
  }


  onSelectedFieldForAddChange(field: string) {
    this.selectedFieldForAdd = field;
  }

  addCondition() {
    if (!this.selectedFieldForAdd) {
      const searchableColumns = this.columns.filter(col => col.searchable !== false);
      this.selectedFieldForAdd = searchableColumns[0]?.field || this.columns[0]?.field || '';
    }
    
    // Check if selected field is enum or list type and has load configuration
    const column = this.getColumnForField(this.selectedFieldForAdd);
    if (column) {
      const columnType = this.getColumnType(this.selectedFieldForAdd);
      const isListOrEnum = columnType === 'list' || columnType === 'enum' || columnType === 'select';
      
      if (isListOrEnum && column.load && column.load.url) {
        // Load options for this column
        this.loadColumnOption(column);
      }
    }
    
    const operatorType = this.getOperatorTypeForField(this.selectedFieldForAdd);
    const defaultOperator = getDefaultOperatorForType(operatorType);
    
    // Determine initial value based on field type
    // For enum types, use empty array for multi-select
    let initialValue: any = '';
    if (this.isEnumType(this.selectedFieldForAdd)) {
      initialValue = []; // Empty array for multi-select enum
    }
    
    // Create new array reference for OnPush change detection
    this.currentFilter = {
      ...this.currentFilter,
      conditions: [
        ...this.currentFilter.conditions,
        {
          field: this.selectedFieldForAdd,
          type: this.getColumnType(this.selectedFieldForAdd),
          operator: defaultOperator,
          value: initialValue
        }
      ]
    };
  }

  removeCondition(index: number) {
    if (this.currentFilter.conditions.length > 1) {
      // Create new array reference for OnPush change detection
      this.currentFilter = {
        ...this.currentFilter,
        conditions: this.currentFilter.conditions.filter((_, i) => i !== index)
      };
    }
  }

  onLogicChange(logic: FilterLogic) {
    this.currentFilter.logic = logic;
  }

  onFieldChange(index: number, field: string) {
    this.currentFilter.conditions[index].field = field;
    this.currentFilter.conditions[index].type = this.getColumnType(field);
    
    // Reset operator to default for the new field type (w2ui compatible)
    const operatorType = this.getOperatorTypeForField(field);
    const defaultOperator = getDefaultOperatorForType(operatorType);
    
    // If current operator is not valid for this field, reset it
    if (!this.isValidOperatorForField(this.currentFilter.conditions[index].operator, field)) {
      this.currentFilter.conditions[index].operator = defaultOperator;
    }
    
    // Check if field is enum or list type and has load configuration
    const column = this.getColumnForField(field);
    if (column) {
      const columnType = this.getColumnType(field);
      const isListOrEnum = columnType === 'list' || columnType === 'enum' || columnType === 'select';
      
      if (isListOrEnum && column.load && column.load.url) {
        // Load options for this column
        this.loadColumnOption(column);
      }
    }
    
    // Clear value when field changes
    // For enum types, use empty array for multi-select
    if (this.isEnumType(field)) {
      this.currentFilter.conditions[index].value = [];
    } else {
      this.currentFilter.conditions[index].value = '';
    }
  }

  onOperatorChange(index: number, operator: FilterOperator) {
    const field = this.currentFilter.conditions[index].field;
    
    // Validate operator for the field
    if (!this.isValidOperatorForField(operator, field)) {
      const operatorType = this.getOperatorTypeForField(field);
      const defaultOperator = getDefaultOperatorForType(operatorType);
      operator = defaultOperator;
    }
    
    this.currentFilter.conditions[index].operator = operator;
    if (!this.requiresValue(operator)) {
      // For enum types, use empty array for multi-select
      if (this.isEnumType(field)) {
        this.currentFilter.conditions[index].value = [];
      } else {
        this.currentFilter.conditions[index].value = '';
      }
    }
  }

  onValueChange(index: number, value: any) {
    this.currentFilter.conditions[index].value = value;
  }

  isCheckboxValueChecked(value: any, optionValue: any): boolean {
    if (value == null) return false;
    // Handle boolean comparisons
    if (value === optionValue) return true;
    // Handle string/number conversions
    if (String(value) === String(optionValue)) return true;
    // Handle boolean to number conversions (true = 1, false = 0)
    if (value === true && optionValue === 1) return true;
    if (value === false && optionValue === 0) return true;
    if (value === 1 && optionValue === true) return true;
    if (value === 0 && optionValue === false) return true;
    return false;
  }

  onCheckboxChange(index: number, optionValue: any, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    // For checkbox type, store the boolean/number value (0 or 1, false or true)
    // If unchecked, set to null to clear the filter
    this.currentFilter.conditions[index].value = checked ? optionValue : null;
    
    // Create new array reference for OnPush change detection
    this.currentFilter = {
      ...this.currentFilter,
      conditions: this.currentFilter.conditions.map((cond, i) => 
        i === index ? { ...cond, value: checked ? optionValue : null } : cond
      )
    };
    
    this.cdr.markForCheck();
  }

  getBetweenMin(value: any): string {
    if (typeof value === 'string' && value.includes(',')) {
      return value.split(',')[0].trim();
    }
    return '';
  }

  getBetweenMax(value: any): string {
    if (typeof value === 'string' && value.includes(',')) {
      return value.split(',')[1].trim();
    }
    return '';
  }

  onBetweenMinChange(index: number, minValue: string | number) {
    const minValueStr = String(minValue);
    const currentValue = this.currentFilter.conditions[index].value || '';
    const maxValue = typeof currentValue === 'string' && currentValue.includes(',') 
      ? currentValue.split(',')[1].trim() 
      : '';
    this.currentFilter.conditions[index].value = `${minValueStr},${maxValue}`;
  }

  onBetweenMaxChange(index: number, maxValue: string | number) {
    const maxValueStr = String(maxValue);
    const currentValue = this.currentFilter.conditions[index].value || '';
    const minValue = typeof currentValue === 'string' && currentValue.includes(',') 
      ? currentValue.split(',')[0].trim() 
      : '';
    this.currentFilter.conditions[index].value = `${minValue},${maxValueStr}`;
  }

  isCheckboxType(field: string): boolean {
    const columnType = this.getColumnType(field);
    return columnType === 'checkbox' || columnType === 'toggle';
  }

  isListType(field: string): boolean {
    const columnType = this.getColumnType(field);
    return columnType === 'list' || columnType === 'select' || columnType === 'radio';
  }

  isEnumType(field: string): boolean {
    const columnType = this.getColumnType(field);
    return columnType === 'enum' || columnType === 'combo';
  }

  isDateType(field: string): boolean {
    const columnType = this.getColumnType(field);
    return columnType === 'date' || columnType === 'time' || columnType === 'datetime';
  }

  getDateInputType(field: string): 'date' | 'time' | 'datetime-local' {
    const columnType = this.getColumnType(field);
    switch (columnType) {
      case 'time':
        return 'time';
      case 'datetime':
        return 'datetime-local';
      case 'date':
      default:
        return 'date';
    }
  }

  getListOptions(field: string): SelectOption[] {
    // Check cache first
    const cacheKey = `list_${field}`;
    if (this.optionsCache.has(cacheKey)) {
      return this.optionsCache.get(cacheKey)!;
    }
    
    const column = this.getColumnForField(field);
    
    let options: SelectOption[] = [];
    
    // First, check if column has load configuration
    if (column?.load && column.load.url) {
      const loadCacheKey = `${field}_${column.load.url}`;
      if (this.columnOptionsCache.has(loadCacheKey)) {
        options = this.columnOptionsCache.get(loadCacheKey)!;
        this.optionsCache.set(cacheKey, options);
        return options;
      }
      // If loading, check if column.options is already populated
      if (this.columnOptionsLoading.get(loadCacheKey)) {
        // If column.options exists, use it
        if (column.options && column.options.length > 0) {
          options = column.options.map(opt => ({
            label: opt.label,
            value: opt.value
          }));
          this.optionsCache.set(cacheKey, options);
          return options;
        }
        return [];
      }
      // Load options
      this.loadColumnOption(column);
      return [];
    }
    
    // Use column.options if provided
    if (column?.options && column.options.length > 0) {
      options = column.options.map(opt => ({
        label: opt.label,
        value: opt.value
      }));
    } else if (this.data && this.data.length > 0) {
      // Fallback: extract unique values from data if available
      const uniqueValues = new Set<any>();
      this.data.forEach(row => {
        const value = row[field];
        if (value != null && value !== '') {
          uniqueValues.add(value);
        }
      });
      
      options = Array.from(uniqueValues)
        .sort()
        .map(value => ({
          label: String(value),
          value: value
        }));
    }
    
    // Cache the result
    this.optionsCache.set(cacheKey, options);
    return options;
  }
  
  /**
   * Load options for all columns with load configuration
   */
  private loadAllColumnOptions(): void {
    if (!this.columns || this.columns.length === 0) return;

    this.columns.forEach(column => {
      if (column.load && column.load.url) {
        this.loadColumnOption(column);
      }
    });
  }

  /**
   * Load options for a column with load configuration
   */
  private loadColumnOption(column: TableColumn): void {
    if (!column.load || !column.load.url) return;

    // Check if URL is a function (dynamic URL)
    // For filter panel, we don't have formData, so we can't use dynamic URLs
    // If URL is a function, skip loading in filter panel context
    if (typeof column.load.url === 'function') {
      console.warn(`[FilterPanel] ${column.field} - Dynamic URL not supported in filter panel, skipping`);
      return;
    }

    const url = column.load.url;
    const cacheKey = `${column.field}_${url}`;
    
    // Check if already loaded or loading
    if (this.columnOptionsCache.has(cacheKey) || this.columnOptionsLoading.get(cacheKey)) {
      return;
    }

    this.columnOptionsLoading.set(cacheKey, true);

    const method = column.load.method || 'GET';
    const data = column.load.data || {};

    let request: Observable<any>;

    if (method === 'GET') {
      request = this.http.get(url);
    } else {
      // For POST, PUT, DELETE, send data in body
      const body: any = { ...data };
      request = this.http.request(method, url, { body });
    }

    request.pipe(
      map(response => {
        // Apply map function if provided
        if (column.load?.map && typeof column.load.map === 'function') {
          const mapped = column.load.map(response);
          return mapped;
        }
        // Default mapping: assume response has records array
        if (response.records && Array.isArray(response.records)) {
          return response.records.map((item: any) => ({
            id: item.id || item.value,
            text: item.text || item.label || item.name || String(item.id || item.value)
          }));
        }
        // If response is already an array
        if (Array.isArray(response)) {
          return response.map((item: any) => ({
            id: item.id || item.value,
            text: item.text || item.label || item.name || String(item.id || item.value)
          }));
        }
        return [];
      }),
      catchError(error => {
        console.error(`Error loading options for column ${column.field}:`, error);
        return of([]);
      })
    ).subscribe(options => {
      const selectOptions: SelectOption[] = options
        .map((opt: any) => {
          // Ensure consistent value type (use id if available, otherwise value)
          const optValue = opt.id !== undefined ? opt.id : (opt.value !== undefined ? opt.value : null);
          // Skip options with null/undefined values
          if (optValue === null || optValue === undefined) {
            return null;
          }
          return {
            label: opt.text || opt.label || String(optValue),
            value: optValue
          };
        })
        .filter((opt: SelectOption | null): opt is SelectOption => opt !== null);
      
      this.columnOptionsCache.set(cacheKey, selectOptions);
      this.columnOptionsLoading.set(cacheKey, false);
      
      // Update cache for getListOptions and getEnumOptions
      const listCacheKey = `list_${column.field}`;
      const enumCacheKey = `enum_${column.field}`;
      this.optionsCache.set(listCacheKey, selectOptions);
      this.optionsCache.set(enumCacheKey, selectOptions);
      
      // Also update column.options for direct access
      if (column) {
        column.options = selectOptions;
      }
      
      // Force change detection to update the select component
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    });
  }

  getEnumOptions(field: string): SelectOption[] {
    // Check cache first
    const cacheKey = `enum_${field}`;
    if (this.optionsCache.has(cacheKey)) {
      return this.optionsCache.get(cacheKey)!;
    }
    
    const column = this.getColumnForField(field);
    
    // First, check if column has load configuration
    if (column?.load && column.load.url) {
      const loadCacheKey = `${field}_${column.load.url}`;
      
      // If already loaded, return from cache
      if (this.columnOptionsCache.has(loadCacheKey)) {
        const options = this.columnOptionsCache.get(loadCacheKey)!;
        this.optionsCache.set(cacheKey, options);
        return options;
      }
      
      // If loading, check if column.options is already populated
      if (this.columnOptionsLoading.get(loadCacheKey)) {
        // If column.options exists, use it
        if (column.options && column.options.length > 0) {
          const options = column.options.map(opt => ({
            label: opt.label,
            value: opt.value
          }));
          this.optionsCache.set(cacheKey, options);
          return options;
        }
        return [];
      }
      
      // Load options if not already loading
      this.loadColumnOption(column);
      return [];
    }
    
    // Same as list - can be extended for remote data
    let options = this.getListOptions(field);
    
    // If options is empty but column has options loaded, use them
    if (options.length === 0 && column?.options && column.options.length > 0) {
      options = column.options.map(opt => ({
        label: opt.label,
        value: opt.value
      }));
      this.optionsCache.set(cacheKey, options);
      return options;
    }
    
    // Cache the result
    this.optionsCache.set(cacheKey, options);
    return options;
  }


  onEnumValueChange(index: number, values: any[]) {
    // Ensure values is always an array and filter out null/undefined values
    const newValue = Array.isArray(values) 
      ? values.filter(val => val !== null && val !== undefined)
      : [];
    
    // Create new array reference for OnPush change detection
    this.currentFilter = {
      ...this.currentFilter,
      conditions: this.currentFilter.conditions.map((cond, i) => 
        i === index ? { ...cond, value: newValue } : cond
      )
    };
    
    this.cdr.markForCheck();
  }

  getLimitOptions(): SelectOption[] {
    const options: SelectOption[] = [
      { label: 'All', value: -1 }
    ];
    
    this.limitOptions?.forEach(limit => {
      options.push({ label: String(limit), value: limit });
    });
    
    return options;
  }

  onLimitChange(limit: number | string) {
    const limitValue = typeof limit === 'string' ? parseInt(limit) : limit;
    this.currentLimit = limitValue === -1 ? -1 : limitValue;
    this.limitChange.emit(this.currentLimit);
  }

  applyFilter() {
    // Remove empty conditions
    const validConditions = this.currentFilter.conditions.filter(cond => {
      if (!cond.field || !cond.operator) return false;
      const requiresVal = this.requiresValue(cond.operator);
      return !requiresVal || (cond.value !== null && cond.value !== undefined && cond.value !== '');
    });

    if (validConditions.length === 0) {
      this.clearFilter();
      return;
    }

    // Format datetime values: remove "T" from ISO datetime strings
    const formattedConditions = validConditions.map(cond => {
      if (this.isDateType(cond.field) && cond.value) {
        // Handle between operator (value is a string with format "minValue,maxValue")
        if (cond.operator === 'between' && typeof cond.value === 'string' && cond.value.includes(',')) {
          const [minValue, maxValue] = cond.value.split(',');
          const formattedMin = minValue ? minValue.trim().replace('T', ' ') : '';
          const formattedMax = maxValue ? maxValue.trim().replace('T', ' ') : '';
          return { ...cond, value: `${formattedMin},${formattedMax}` };
        }
        // Handle single datetime value
        else if (typeof cond.value === 'string') {
          return { ...cond, value: cond.value.replace('T', ' ') };
        }
      }
      return cond;
    });

    this.filterChange.emit({
      logic: this.currentFilter.logic,
      conditions: formattedConditions
    });
  }

  clearFilter() {
    const searchableColumns = this.columns.filter(col => col.searchable !== false);
    const defaultField = searchableColumns[0]?.field || this.columns[0]?.field || '';
    const operatorType = this.getOperatorTypeForField(defaultField);
    const defaultOperator = getDefaultOperatorForType(operatorType);
    
    this.currentFilter = {
      logic: 'AND',
      conditions: [{
        field: defaultField,
        type: this.getColumnType(defaultField),
        operator: defaultOperator,
        value: ''
      }]
    };
    this.clear.emit();
  }

  onClose() {
    this.close.emit();
  }

  /**
   * Check if there are valid filter conditions
   */
  get hasValidFilters(): boolean {
    // Check currentFilter conditions directly, not just hasActiveFilter
    // At least one condition with field and operator is required
    if (!this.currentFilter.conditions || this.currentFilter.conditions.length === 0) {
      return false;
    }
    
    const validConditions = this.currentFilter.conditions.filter(cond => {
      if (!cond.field || !cond.operator) return false;
      const requiresVal = this.requiresValue(cond.operator);
      // For operators that require value, check if value is provided
      // For operators that don't require value (like 'is null', 'is not null'), field and operator are enough
      if (!requiresVal) {
        return true; // Operator doesn't require value, so condition is valid
      }
      // Check if value is provided (not null, undefined, or empty string/array)
      if (Array.isArray(cond.value)) {
        return cond.value.length > 0; // For array values (enum), check if at least one item is selected
      }
      return cond.value !== null && cond.value !== undefined && cond.value !== '';
    });
    return validConditions.length > 0;
  }

  requestSaveReport(): void {
    // Build a filter payload with only valid conditions
    const validConditions = this.currentFilter.conditions.filter(cond => {
      if (!cond.field || !cond.operator) return false;
      const requiresVal = this.requiresValue(cond.operator);
      if (!requiresVal) return true;
      if (Array.isArray(cond.value)) return cond.value.length > 0;
      return cond.value !== null && cond.value !== undefined && cond.value !== '';
    });

    if (validConditions.length === 0) return;

    this.saveReportRequested.emit({
      logic: this.currentFilter.logic,
      conditions: validConditions
    });
  }
}

