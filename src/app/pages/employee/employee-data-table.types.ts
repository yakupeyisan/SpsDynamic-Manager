// Type definitions for DataTableComponent
// NOTE: DataTableComponent is not yet available in this project
// These types are defined based on old/app.component.ts usage

export type ColumnType = 'text' | 'int' | 'float' | 'date' | 'datetime' | 'time' | 'list' | 'enum' | 'checkbox' | 'color' | 'html' | 'currency' | 'picture' | 'textarea';

export interface TableColumn {
  field: string;
  label: string;
  text: string;
  type: ColumnType;
  sortable?: boolean;
  searchable?: boolean | 'text' | 'int' | 'float' | 'date' | 'datetime' | 'list' | 'enum' | 'checkbox';
  resizable?: boolean;
  width?: string;
  size?: string;
  align?: 'left' | 'center' | 'right';
  tooltip?: string;
  hidden?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  currencyPrefix?: string;
  currencySuffix?: string;
  currencyPrecision?: number;
  prependUrl?: string;
  searchField?: string;
  joinTable?: string | string[];
  options?: Array<{ label: string; value: any; disabled?: boolean }>;
  load?: {
    url: string;
    injectAuth?: boolean;
    method: 'GET' | 'POST';
    data?: any | ((formData?: any) => any);
    map: (data: any) => Array<{ id: any; text: string }>;
  };
  render?: (record: any) => string;
}

export interface JoinOption {
  key: string;
  label: string;
  nested: boolean;
  default?: boolean;
}

export interface FormTab {
  label: string;
  fields?: string[];
  grids?: FormTabGrid[];
}

export interface FormTabGrid {
  id: string;
  selectable?: boolean;
  formFullscreen?: boolean;
  formWidth?: string;
  formHeight?: string;
  recid: string;
  formFields?: TableColumn[];
  formLoadUrl?: string;
  formLoadRequest?: (recid: any, parentFormData?: any) => any;
  onSave?: (data: any, isEdit: boolean, http?: any) => any;
  toolbar?: ToolbarConfig;
  data?: (formData: any) => any;
  joinOptions?: JoinOption[];
}

export interface ToolbarConfig {
  items?: Array<{
    id: string;
    type: 'button' | 'menu' | 'break';
    text?: string;
    tooltip?: string;
    onClick?: (event: MouseEvent, item: any) => void;
    items?: Array<{
      id: string;
      text: string;
      onClick: (event: MouseEvent, item: any) => void;
    }>;
  }>;
  show?: {
    reload?: boolean;
    add?: boolean;
    edit?: boolean;
    delete?: boolean;
    save?: boolean;
  };
}

export interface GridResponse {
  status: 'success' | 'error';
  total: number;
  records: any[];
}

export interface AdvancedFilter {
  field: string;
  type: string;
  value: any;
  operator?: string;
}
