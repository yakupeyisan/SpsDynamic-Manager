import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, TemplateRef, AfterViewInit, DoCheck, OnChanges, OnDestroy, SimpleChanges, HostListener, ViewChild, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Observable, of, Subscription } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../../services/data.service';
import { InputComponent } from '../input/input.component';
import { FilterPanelComponent } from './filter-panel.component';
import { ModalComponent } from '../modal/modal.component';
import { FormComponent } from '../form/form.component';
import { FormFieldComponent } from '../form/form-field.component';
import { SelectComponent } from '../select/select.component';
import { ToggleComponent } from '../toggle/toggle.component';
import { TabsComponent } from '../tabs/tabs.component';
import { TabItemComponent } from '../tabs/tab-item.component';
import { AdvancedFilter, FilterCondition, FilterOperator, FILTER_OPERATORS } from './filter.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// PLACEHOLDERS constant (replacement for @customizer/ui)
const PLACEHOLDERS = {
  SEARCH: 'Search...',
  SELECT_OPTION: 'Select an option...',
  FILTER_OPERATOR: 'Operator',
  FILTER_MIN: 'Min',
  FILTER_MAX: 'Max',
  FILTER_SELECT_VALUE: 'Select value',
  FILTER_SELECT_VALUES: 'Select values',
  FILTER_SELECT_DATE: 'Select date',
  FILTER_VALUE: 'Value',
  FILTER_SELECT_FIELD: 'Select field'
};

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

export interface TableColumnOption {
  label: string;
  value: any;
}

export interface TableColumnLoad {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any | ((formData?: any) => any); // Can be static object or function that receives formData
  injectAuth?: boolean;
  map?: (data: any) => TableColumnOption[];
}

export interface TableColumnGroup {
  span: number; // Number of columns this group spans
  text: string; // Group header text
  main?: boolean; // Main group
  style?: string; // Additional CSS style
}

export interface JoinOption {
  key: string;
  label: string;
  nested: boolean;
  parent?: string;
  default?: boolean; // If true, this join option will be selected by default on first use
}

export interface FormTabGrid {
  id: string; // Grid identifier
  columns?: TableColumn[]; // Grid columns
  dataSource?: (params: {
    page?: number;
    limit?: number;
    search?: AdvancedFilter | null;
    searchLogic?: 'AND' | 'OR';
    sort?: { field: string; direction: 'asc' | 'desc' };
    join?: { [key: string]: boolean | { [key: string]: boolean } };
    showDeleted?: boolean;
    [key: string]: any; // Additional parameters (e.g., EmployeeID)
  }) => Observable<GridResponse>; // Data source function
  data?: (formData: any) => any; // Function to get additional data from form (e.g., EmployeeID from formData)
  toolbar?: ToolbarConfig; // Custom toolbar for grid
  height?: string; // Grid height
  pageSize?: number; // Page size for grid
  selectable?: boolean; // Allow row selection
  formFullscreen?: boolean; // Whether form should open in fullscreen mode for this grid
  formWidth?: string; // Form width when not fullscreen
  formHeight?: string; // Form height when not fullscreen
  formFields?: TableColumn[]; // Custom form fields for this grid
  formLoadUrl?: string; // URL to load form data for edit mode
  formLoadRequest?: (recid: any, parentFormData?: any) => any; // Function to build request body for form load (parentFormData is available for nested grids)
  formDataMapper?: (apiRecord: any) => any; // Function to map API response to form data
  onSave?: (data: any, isEdit: boolean, http?: any) => Observable<any>; // Callback function to save form data (http is optional for nested grids)
  recid?: string; // Record ID field name for this grid
  joinOptions?: JoinOption[]; // Join options for this grid
}

export interface FormTab {
  label: string;
  fields?: string[]; // Form fields for this tab
  grids?: FormTabGrid[]; // Nested grids for this tab
  showInAdd?: boolean; // If false, hide this tab in add mode (default: true)
}

export interface TableColumn {
  field: string;
  label: string;
  text?: string; // Alias for label (w2ui compatible)
  type?: ColumnType; // Column data type (w2ui compatible)
  sortable?: boolean;
  sortMode?: 'default' | 'natural' | 'i18n' | ((a: any, b: any) => number); // Sort mode
  width?: string;
  size?: string | number; // Alias for width (w2ui compatible)
  min?: number; // Minimum width in px
  max?: number; // Maximum width in px
  gridMinWidth?: number; // Minimum width of grid when column is visible
  align?: 'left' | 'center' | 'right';
  template?: TemplateRef<any>;
  render?: string | ((record: TableRow, index: number, column: TableColumn) => string); // Render function or template string
  searchable?: boolean | ColumnType; // Can be boolean or type for advanced search
  options?: TableColumnOption[]; // Options for list, enum, select, combo types
  url?: string; // URL for remote options (enum, combo)
  hidden?: boolean; // Hide column
  resizable?: boolean; // Allow column resizing
  hideable?: boolean; // Allow column to be hidden/shown
  frozen?: boolean; // Fixed column (left side)
  tooltip?: string; // Column header tooltip
  title?: string | ((record: TableRow) => string); // Cell title attribute
  editable?: any; // Inline editing configuration
  attr?: string; // Additional HTML attributes for <td>
  style?: string; // Additional CSS style for <td>
  info?: boolean | object; // Info bubble
  clipboardCopy?: boolean | string | ((record: TableRow) => string); // Clipboard copy functionality
  prependUrl?: string; // URL prefix for picture columns (use {0} as placeholder for pictureId)
  searchField?: string; // Field name to use in search filter (if different from field property, e.g., nested fields)
  joinTable?: string | string[]; // Join table name(s) - column will be shown when this join is selected
  load?: TableColumnLoad; // Load options from remote URL for list/enum/select types
  fullWidth?: boolean; // Make field take full width in form (spans all columns in grid layout)
  disabled?: boolean; // Disable field in form
  currencyPrefix?: string; // Currency prefix (e.g., '$', '€', '₺') - overrides global setting
  currencySuffix?: string; // Currency suffix (e.g., ' TL', ' USD') - overrides global setting
  currencyPrecision?: number; // Number of decimal places for currency (default: 2) - overrides global setting
  showInAdd?: boolean; // Show field in add mode (default: true)
  showInUpdate?: boolean; // Show field in update/edit mode (default: true)
}

export interface TableRow {
  [key: string]: any;
}

export interface GridResponse {
  status: 'success' | 'error';
  total: number; // Total number of records (-1 if unknown)
  records: TableRow[]; // Array of records
  summary?: TableRow[]; // Optional summary records
}

export type ToolbarItemType = 'button' | 'check' | 'radio' | 'drop' | 'menu' | 'menu-radio' | 'menu-check' | 'break' | 'html' | 'spacer';

export interface ToolbarMenuItem {
  id: string;
  text: string;
  icon?: string;
  checked?: boolean;
  disabled?: boolean;
  onClick?: (event: MouseEvent, item: ToolbarMenuItem) => void;
}

export interface ToolbarItem {
  id: string;
  type: ToolbarItemType;
  text?: string;
  html?: string;
  tooltip?: string;
  icon?: string;
  disabled?: boolean;
  hidden?: boolean;
  checked?: boolean; // for radio/check types
  group?: string; // for radio buttons
  items?: ToolbarMenuItem[]; // for menu types
  selected?: string | string[]; // for menu-radio/menu-check
  onClick?: (event: MouseEvent, item: ToolbarItem) => void;
  onRefresh?: (item: ToolbarItem) => void; // called when toolbar refreshes
  name?: string; // w2ui style: if specified, merges with default button (add, edit, delete, save, reload)
}

export interface ToolbarConfig {
  items: ToolbarItem[];
  right?: string; // HTML text on the right of toolbar
  show?: {
    reload?: boolean;
    columns?: boolean;
    search?: boolean;
    add?: boolean;
    edit?: boolean;
    delete?: boolean;
    save?: boolean;
  };
}

@Component({
  selector: 'ui-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, InputComponent, FilterPanelComponent, ModalComponent, FormComponent, FormFieldComponent, SelectComponent, ToggleComponent, TabsComponent, TabItemComponent],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableComponent implements AfterViewInit, DoCheck, OnChanges, OnDestroy {
  @Input() columns: TableColumn[] = [];
  private internalColumns: TableColumn[] = [];
  @Input() data: TableRow[] = [];
  @Input() dataSource?: (params: {
    page?: number;
    limit?: number;
    search?: AdvancedFilter | null;
    searchLogic?: 'AND' | 'OR';
    sort?: { field: string; direction: 'asc' | 'desc' };
    join?: { [key: string]: boolean | { [key: string]: boolean } };
    showDeleted?: boolean;
  }) => Observable<GridResponse>; // Data source function (w2ui compatible)
  @Input() selectable: boolean = false;
  @Input() striped: boolean = true;
  @Input() hover: boolean = true;
  @Input() pagination: boolean = false;
  @Input() pageSize: number = 10;
  @Input() emptyMessage?: string; // Will use translation if not provided
  @Input() searchable: boolean = true;
  @Input() searchPlaceholder: string = PLACEHOLDERS.SEARCH;
  @Input() searchFields: string[] = []; // Empty means search all columns
  @Input() searchField?: string; // If specified, only search this field (uses searchField property from column if available)
  @Input() advancedFilter: boolean = true;
  @Input() limit: number = 100; // Record limit
  @Input() limitOptions: number[] = [25, 50, 100, 250, 500, 1000]; // Available limit options
  @Input() height?: string; // Fixed height for table body (e.g., '400px', '50vh')
  @Input() recordHeight: number = 40; // Height of each row in pixels (default: 40px)
  @Input() showEmptyRows: boolean = true; // Show empty rows when height is set (Excel-like)
  @Input() fixedBody: boolean = true; // If true, table body has fixed height
  @Input() showFooter: boolean = false; // Show footer with status information (w2ui style)
  @Input() total: number = 0; // Total number of records (for pagination)
  @Input() page: number = 1; // Current page number (for pagination)
  @Input() recid?: string; // Field name to use as record ID (default: 'id')
  @Input() columnGroups?: TableColumnGroup[]; // Column groups (w2ui compatible)
  @Input() selectType: 'row' | 'cell' = 'row'; // Selection type (w2ui compatible)
  @Input() multiSelect: boolean = true; // Allow multiple selection (w2ui compatible)
  @Input() multiSort: boolean = true; // Allow multiple column sorting (w2ui compatible)
  @Input() keyboard: boolean = true; // Enable keyboard navigation (w2ui compatible)
  @Input() liveSearch: boolean = false; // Auto-search as user types (w2ui compatible)
  @Input() reorderColumns: boolean = false; // Allow column reordering (w2ui compatible)
  @Input() reorderRows: boolean = false; // Allow row reordering (w2ui compatible)
  @Input() lineNumbers: boolean = false; // Show line numbers (w2ui compatible)
  @Input() expandColumn: boolean = false; // Show expand/collapse column (w2ui compatible)
  @Input() lineNumberWidth: number = 34; // Width of line number column (w2ui compatible)
  @Input() nestedFields: boolean = true; // Support nested field names (e.g., 'user.name') (w2ui compatible)
  @Input() columnTooltip?: 'top' | 'bottom' | 'left' | 'right' | string; // Column tooltip position (w2ui compatible)
  @Input() tabIndex?: number | null = null; // Tab index for keyboard navigation (w2ui compatible)
  @Input() joinOptions: JoinOption[] = []; // Join options from parent component
  @Input() id?: string; // Grid ID for localStorage persistence
  @Input() canViewDeleted?: boolean = false; // Permission to view deleted records
  @Input() formFields?: TableColumn[]; // Custom form fields - if provided, only these fields will be shown in form
  @Input() formTabs?: FormTab[]; // Tab structure for form - if provided, form will be organized into tabs
  @Input() getGridColumns?: (gridId: string) => TableColumn[]; // Function to get columns for a grid by ID
  @Input() getGridDataSource?: (gridId: string, formData: any) => ((params: any) => Observable<GridResponse>) | undefined; // Function to get dataSource for a grid by ID
  @Input() formLoadUrl?: string; // URL to load form data for edit mode
  @Input() formLoadRequest?: (recid: any, parentFormData?: any) => any; // Function to build request body for form load (parentFormData is available for nested grids)
  @Input() formDataMapper?: (apiRecord: any) => any; // Function to map API response to form data
  @Input() imageUploadUrl?: string; // URL for image upload
  @Input() imageField?: string; // Field name for image
  @Input() imagePreviewUrl?: (filename: string) => string; // Function to generate image preview URL
  @Input() onSave?: (data: any, isEdit: boolean, http?: any) => Observable<any>; // Callback function to save form data (http is optional for nested grids)
  @Input() onFormChange?: (formData: any) => void; // Callback function for form data changes
  @Input() formFullscreen?: boolean = true; // Whether form should open in fullscreen mode (default: true)
  @Input() formWidth?: string = '800px'; // Form width when not fullscreen
  @Input() formHeight?: string = '600px'; // Form height when not fullscreen
  @Input() currencyPrefix?: string = '$'; // Global currency prefix (default: '$')
  @Input() currencySuffix?: string = ''; // Global currency suffix (default: '')
  @Input() currencyPrecision?: number = 2; // Global currency precision/decimal places (default: 2)
  
  @Output() rowClick = new EventEmitter<{ row: TableRow; columnIndex?: number }>();
  @Output() rowDblClick = new EventEmitter<TableRow>();
  @Output() rowSelect = new EventEmitter<TableRow[]>();
  @Output() sortChange = new EventEmitter<{ field: string; direction: 'asc' | 'desc' }>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() advancedFilterChange = new EventEmitter<AdvancedFilter | null>();
  @Output() limitChange = new EventEmitter<number>();
  @Output() refresh = new EventEmitter<void>();
  @Output() delete = new EventEmitter<TableRow[]>();
  @Output() add = new EventEmitter<void>();
  @Output() edit = new EventEmitter<TableRow>();
  @Output() update = new EventEmitter<void>();
  @Output() formChange = new EventEmitter<any>(); // Form data change event
  @Output() contextMenu = new EventEmitter<{ row: TableRow; event: MouseEvent }>(); // Context menu event (w2ui compatible)
  @Output() columnClick = new EventEmitter<{ column: TableColumn; event: MouseEvent }>(); // Column header click (w2ui compatible)
  @Output() columnDblClick = new EventEmitter<{ column: TableColumn; event: MouseEvent }>(); // Column header double click (w2ui compatible)
  @Output() pictureClick = new EventEmitter<{ row: TableRow; column: TableColumn; rowIndex: number; columnIndex: number; pictureId: string; event: MouseEvent }>(); // Picture column click event
  @Output() columnContextMenu = new EventEmitter<{ column: TableColumn; event: MouseEvent }>(); // Column header context menu (w2ui compatible)
  @Output() columnResize = new EventEmitter<{ column: TableColumn; width: number }>(); // Column resize event (w2ui compatible)
  @Output() columnAutoResize = new EventEmitter<{ column: TableColumn; width: number }>(); // Column auto-resize event (w2ui compatible)
  @Output() mouseEnter = new EventEmitter<TableRow>(); // Mouse enter row event (w2ui compatible)
  @Output() mouseLeave = new EventEmitter<TableRow>(); // Mouse leave row event (w2ui compatible)
  @Output() focus = new EventEmitter<void>(); // Grid focus event (w2ui compatible)
  @Output() blur = new EventEmitter<void>(); // Grid blur event (w2ui compatible)
  @Output() copy = new EventEmitter<{ text: string; event: ClipboardEvent }>(); // Copy event (w2ui compatible)
  @Output() paste = new EventEmitter<{ text: string; event: ClipboardEvent }>(); // Paste event (w2ui compatible)
  
  @Input() showRefresh: boolean = true;
  @Input() toolbar?: ToolbarConfig; // Custom toolbar configuration (w2ui style)
  
  @Output() toolbarClick = new EventEmitter<{ item: ToolbarItem; event: MouseEvent }>();

  @ViewChild('tableWrapper', { static: false }) tableWrapperRef?: ElementRef<HTMLDivElement>;
  @ViewChildren(DataTableComponent) nestedGrids?: QueryList<DataTableComponent>;

  selectedRows: Set<any> = new Set();
  currentPage: number = 1;
  
  // Range selection state
  private isRangeSelecting: boolean = false;
  private rangeSelectStartRow: TableRow | null = null;
  private hasMouseMoved: boolean = false;
  sortField: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';
  searchTerm: string = '';
  private lastPerformedSearch: string = ''; // Track last performed search to prevent duplicate reloads
  activeFilter: AdvancedFilter | null = null;
  showFilterPanel: boolean = false;
  currentLimit: number = 100;
  showOptionsMenu: boolean = false;
  showJoinOptionsPanel: boolean = false;
  selectedJoins: { [key: string]: boolean | { [key: string]: boolean } } = {};
  showDeleted: boolean = false; // Toggle for showing deleted records
  isLoading: boolean = false; // Loading state for data source
  internalData: TableRow[] = []; // Internal data storage (from dataSource)
  internalTotal: number = 0; // Internal total count (from dataSource)
  private dataSourceSubscription?: Subscription; // Subscription for dataSource
  private formLoadSubscription?: Subscription; // Subscription for form load
  private imageUploadSubscription?: Subscription; // Subscription for image upload
  private formSaveSubscription?: Subscription; // Subscription for form save
  
  // Form modal state
  showFormModal: boolean = false;
  showFormPage: boolean = false; // Full page form
  formData: { [key: string]: any } = {};
  isEditMode: boolean = false;
  editingRecordId: any = null;
  selectedImageFile: File | null = null;
  imagePreview: string | null = null;
  activeFormTab: number = 0; // Active tab index for form
  
  // Column resizing state
  private isResizing: boolean = false;
  private resizingColumn: TableColumn | null = null;
  private resizingColumnIndex: number = -1;
  private resizeStartX: number = 0;
  private resizeStartWidth: number = 0;
  private resizeTimer: any = null;
  private resizeTds: HTMLElement[] = [];
  
  // Picture overlay state
  showPictureOverlay = false;
  pictureOverlayUrl = '';
  
  // Search debounce state
  private searchDebounceTimer: any = null;
  private lastSearchText: string = '';

  // Cache for loaded column options
  private columnOptionsCache: Map<string, TableColumnOption[]> = new Map();
  private columnOptionsLoading: Map<string, boolean> = new Map();

  // Toolbar menu state
  openMenuId: string | null = null;
  private menuClickHandler: ((e: MouseEvent) => void) | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private dataService: DataService,
    public translate: TranslateService
  ) {
    this.currentLimit = this.limit;
    
    // Bind methods for event listeners
    this.onGridFocus = this.onGridFocus.bind(this);
    this.onGridBlur = this.onGridBlur.bind(this);
    this.onGridCopy = this.onGridCopy.bind(this);
    this.onGridPaste = this.onGridPaste.bind(this);
    this.onColumnResizeMove = this.onColumnResizeMove.bind(this);
    this.onColumnResizeEnd = this.onColumnResizeEnd.bind(this);
  }

  ngOnChanges(changes: SimpleChanges) {
    // Update currentPage when page input changes
    if (changes['page'] && changes['page'].currentValue) {
      this.currentPage = changes['page'].currentValue;
    }
    
    if (changes['columns'] && changes['columns'].currentValue) {
      // Merge parent columns with internal columns (preserve resize state)
      const newColumns: TableColumn[] = changes['columns'].currentValue;
      if (this.internalColumns.length > 0 && this.internalColumns.length === newColumns.length) {
        // Preserve width/size from internal columns if field matches
        this.internalColumns = newColumns.map((newCol: TableColumn, index: number) => {
          const existingCol = this.internalColumns[index];
          if (existingCol && existingCol.field === newCol.field) {
            // Keep width/size from existing (resized) column
            return {
              ...newCol,
              width: existingCol.width,
              size: existingCol.size
            };
          }
          return { ...newCol };
        });
      } else {
        // Create a deep copy of columns for internal use
        this.internalColumns = newColumns.map((col: TableColumn) => ({ ...col }));
      }
      
      // Update column visibility based on joins after columns are updated
      this.updateColumnVisibilityForJoins();
    }
  }

  onGridFocus(event: FocusEvent) {
    this.focus.emit();
  }

  onGridBlur(event: FocusEvent) {
    this.blur.emit();
  }

  onGridCopy(event: ClipboardEvent) {
    const selectedText = window.getSelection()?.toString() || '';
    if (selectedText) {
      this.copy.emit({ text: selectedText, event });
    }
  }

  onGridPaste(event: ClipboardEvent) {
    const pastedText = event.clipboardData?.getData('text') || '';
    if (pastedText) {
      this.paste.emit({ text: pastedText, event });
    }
  }

  ngAfterViewInit(): void {
    // Load saved join options from localStorage if grid has ID
    if (this.id) {
      this.loadJoinOptionsFromStorage();
      this.loadShowDeletedFromStorage();
    }
    
    // Update column visibility based on joins on initialization
    this.updateColumnVisibilityForJoins();
    
    // Load data if dataSource is provided
    if (this.dataSource) {
      // If join options were loaded from storage, reload data with those joins
      this.loadDataSource();
    } else {
      // Use static data
      this.internalData = this.data || [];
      this.internalTotal = this.total || this.internalData.length;
    }
  }
  
  /**
   * Load data from dataSource function (w2ui compatible)
   * Calls dataSource function with current pagination/search/sorting parameters
   */
  private loadDataSource() {
    if (!this.dataSource) return;
    
    
    // Unsubscribe from previous subscription if exists
    if (this.dataSourceSubscription) {
      this.dataSourceSubscription.unsubscribe();
    }
    
    this.isLoading = true;
    this.cdr.markForCheck();
    
    // Call dataSource function with current parameters (w2ui compatible format)
    const params = {
      page: this.currentPage,
      limit: this.currentLimit,
      search: this.activeFilter || null, // Use AdvancedFilter instead of simple search string
      searchLogic: this.activeFilter?.logic || 'AND',
      sort: this.sortField ? {
        field: this.sortField,
        direction: this.sortDirection
      } : undefined,
      join: Object.keys(this.selectedJoins).length > 0 ? this.selectedJoins : undefined,
      showDeleted: this.showDeleted, // Include showDeleted flag
      columns: this.columns // Pass columns for type mapping in search
    };
    
    // Debug: Log params to verify filter is included
    if (this.activeFilter) {
      // Filter is included in params
    }
    
    
    // Subscribe to the Observable returned by dataSource function
    this.dataSourceSubscription = this.dataSource(params).pipe(
      tap(response => {
        this.handleDataSourceResponse(response);
      }),
      catchError(error => {
        this.isLoading = false;
        this.internalData = [];
        this.internalTotal = 0;
        this.cdr.markForCheck();
        return of({ status: 'error', total: 0, records: [] } as GridResponse);
      })
    ).subscribe();
  }
  
  /**
   * Handle response from dataSource (w2ui compatible)
   */
  private handleDataSourceResponse(response: GridResponse) {
    if (response.status === 'success') {
      this.internalData = response.records || [];
      this.internalTotal = response.total !== undefined ? response.total : this.internalData.length;
      
      // Handle summary if provided
      // (Summary can be handled separately if needed)
      
      // Scroll to top when new data is loaded
      this.scrollToTop();
      
      // Force change detection to update the view
      this.cdr.detectChanges();
      
      // Close spinner after view is updated (wait for DOM to render)
      // Use requestAnimationFrame to ensure DOM is updated before closing spinner
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        });
      });
    } else {
      this.internalData = [];
      this.internalTotal = 0;
      this.cdr.detectChanges();
      
      // Close spinner after view is updated
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        });
      });
    }
  }

  /**
   * Scroll table wrapper to top
   */
  private scrollToTop(): void {
    // Use setTimeout to ensure DOM is updated after change detection
    setTimeout(() => {
      if (this.tableWrapperRef?.nativeElement) {
        this.tableWrapperRef.nativeElement.scrollTop = 0;
      }
    }, 0);
  }
  
  /**
   * Reload data from dataSource (w2ui compatible)
   */
  reload() {
    if (this.dataSource) {
      this.loadDataSource();
    }
    this.refresh.emit();
  }

  ngDoCheck(): void {
    // Lifecycle hook for custom change detection
    // Currently no custom change detection needed
  }

  ngOnDestroy(): void {
    // Clean up menu click handler
    if (this.menuClickHandler) {
      document.removeEventListener('click', this.menuClickHandler);
      this.menuClickHandler = null;
    }
    
    // Clean up global event listeners (always remove, not just if isRangeSelecting)
    document.removeEventListener('mousemove', this.onDocumentMouseMove);
    document.removeEventListener('mouseup', this.onDocumentMouseUp);
    
    // Clean up column resize event listeners
    if (this.isResizing) {
      document.removeEventListener('mousemove', this.onColumnResizeMove);
      document.removeEventListener('mouseup', this.onColumnResizeEnd);
      this.isResizing = false;
    }
    
    // Unsubscribe from all subscriptions
    if (this.dataSourceSubscription) {
      this.dataSourceSubscription.unsubscribe();
      this.dataSourceSubscription = undefined;
    }
    
    if (this.formLoadSubscription) {
      this.formLoadSubscription.unsubscribe();
      this.formLoadSubscription = undefined;
    }
    
    if (this.imageUploadSubscription) {
      this.imageUploadSubscription.unsubscribe();
      this.imageUploadSubscription = undefined;
    }
    
    if (this.formSaveSubscription) {
      this.formSaveSubscription.unsubscribe();
      this.formSaveSubscription = undefined;
    }
    
    // Clear all timers
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = null;
    }
    
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = null;
    }
    
    // Clear caches
    this.columnOptionsCache.clear();
    this.columnOptionsLoading.clear();
    this.gridDataSourceCache.clear();
    this.gridDataSourceFormDataCache.clear();
  }

  get totalPages(): number {
    if (!this.pagination) {
      return 1;
    }
    // Use internalTotal if dataSource is used, otherwise use total input or filtered data length
    let totalRecords: number;
    if (this.dataSource) {
      totalRecords = this.internalTotal > 0 ? this.internalTotal : this.internalData.length;
    } else {
      totalRecords = this.total > 0 ? this.total : this.allFilteredData.length;
    }
    // Always use currentLimit as pageSize for pagination
    const effectivePageSize = this.currentLimit > 0 ? this.currentLimit : this.pageSize;
    return Math.ceil(totalRecords / effectivePageSize);
  }

  get emptyRowsCount(): number {
    if (!this.fixedBody || !this.height || !this.showEmptyRows) {
      return 0;
    }
    
    // Calculate how many rows fit in the given height
    const heightValue = parseInt(this.height);
    if (isNaN(heightValue)) {
      return 0;
    }
    
    // Subtract header height (approximately 50px for search + 50px for table header)
    const availableHeight = heightValue - 100;
    const rowsThatFit = Math.floor(availableHeight / this.recordHeight);
    const actualRows = this.filteredData.length;
    
    // Return number of empty rows needed to fill the space
    return Math.max(0, rowsThatFit - actualRows);
  }

  get emptyRows(): any[] {
    return Array(this.emptyRowsCount).fill(null);
  }

  onSearchChange(value: string | number) {
    const searchValue = String(value);
    // Only update searchTerm, don't perform search
    // Search will be performed only on Enter key press
    this.searchTerm = searchValue;
  }
  
  /**
   * Perform search operation (w2ui.js style)
   */
  private performSearch(searchValue: string) {
    
    // Normalize search value (trim) for comparison
    const normalizedValue = (searchValue || '').trim();
    const normalizedLastSearch = (this.lastPerformedSearch || '').trim();
    
    
    // Only perform search if value actually changed (prevent duplicate reloads)
    if (normalizedLastSearch === normalizedValue) {
      return;
    }
    
    // Update searchTerm to ensure filter value is not empty
    this.searchTerm = normalizedValue;
    this.lastPerformedSearch = normalizedValue;
    this.currentPage = 1; // Reset to first page on search
    
    
    // Convert searchTerm to AdvancedFilter for remote data source
    if (this.dataSource) {
      if (normalizedValue) {
        this.buildSearchFilter(normalizedValue);
      } else {
        // Clear filter if search is empty
        this.activeFilter = null;
      }
    }
    
    // w2ui.js style: reload only for remote data (dataSource), local search for static data
    if (this.dataSource) {
      // Remote data source: reload from server
      this.loadDataSource();
    } else {
      // Local data source: no reload, just trigger change detection
      // filteredData getter already handles the filtering based on searchTerm
      this.cdr.markForCheck();
    }
    
    this.searchChange.emit(normalizedValue);
  }
  
  /**
   * Build AdvancedFilter from searchTerm for remote data source
   */
  private buildSearchFilter(searchValue: string) {
    
    // Check if search value is numeric
    const isNumeric = !isNaN(Number(searchValue)) && searchValue !== '';
    
    // Number type columns
    const numberTypes: ColumnType[] = ['int', 'float', 'money', 'currency', 'percent'];
    // Text type columns
    const textTypes: ColumnType[] = ['text', 'alphanumeric'];
    
    
    // If searchField is specified, only search that field
    if (this.searchField) {
      
      // Find the column that matches the searchField
      const targetColumn = this.displayColumns.find(col => {
        // Check if the searchField matches either the column field or searchField property
        return col.field === this.searchField || col.searchField === this.searchField;
      });
      
      if (targetColumn) {
        // Use searchField property if available, otherwise use field
        const filterField = targetColumn.searchField || targetColumn.field!;
        const isNumberType = targetColumn.type && numberTypes.includes(targetColumn.type);
        
        const condition = {
          field: filterField,
          operator: isNumberType ? 'equals' as FilterOperator : 'startsWith' as FilterOperator,
          value: searchValue
        };
        
        
        this.activeFilter = {
          logic: 'OR',
          conditions: [condition]
        };
        return;
      } else {
        // Fall through to default behavior
      }
    }
    
    // Get searchable columns based on search type (default behavior)
    const searchableColumns = this.displayColumns.filter(col => {
      // Check if column is searchable
      // searchable can be: true, false, undefined, or a ColumnType string (e.g., "text", "int", "enum")
      // Only false means not searchable, everything else means searchable
      const isSearchable = col.searchable !== false;
      
      if (!isSearchable) {
        return false;
      }
      
      // If numeric search, include columns with number OR text type
      if (isNumeric) {
        if (!col.type) {
          return true; // If no type specified, allow search (backward compatibility)
        }
        const matches = numberTypes.includes(col.type) || textTypes.includes(col.type);
        return matches;
      } else {
        // Text search, only include columns with text type
        if (!col.type) {
          return true; // If no type specified, allow search (backward compatibility)
        }
        const matches = textTypes.includes(col.type);
        return matches;
      }
    });
    
    
    // Build filter conditions
    // For text columns: use 'startsWith' (maps to 'begins' in w2ui)
    // For number columns: use 'equals' (maps to '=' in w2ui) - but we'll search in text columns for "contains" behavior
    const conditions = searchableColumns.map(col => {
      const isNumberType = col.type && numberTypes.includes(col.type);
      // Use searchField if provided, otherwise use field
      const filterField = col.searchField || col.field!;
      // For number type columns, use 'equals' (exact match)
      // For text type columns, use 'startsWith' (begins with)
      const condition = {
        field: filterField,
        operator: isNumberType ? 'equals' as FilterOperator : 'startsWith' as FilterOperator,
        value: searchValue
      };
      return condition;
    });
    
    // Create AdvancedFilter with OR logic (search in any of the columns)
    if (conditions.length > 0) {
      this.activeFilter = {
        logic: 'OR',
        conditions: conditions
      };
    } else {
      // No searchable columns found, clear filter
      this.activeFilter = null;
    }
  }
  
  /**
   * Handle search input keyup event - only search on Enter key press
   */
  onSearchKeyUp(event: KeyboardEvent) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    
    // Only perform search when Enter key is pressed
    if (event.key === 'Enter') {
      // Clear any pending debounce timer
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer);
        this.searchDebounceTimer = null;
      }
      
      // Perform search immediately on Enter
      this.performSearch(value);
    }
  }
  
  /**
   * Handle search input blur event (w2ui.js style)
   */
  onSearchBlur() {
    // Clear last search text on blur (w2ui.js style)
    this.lastSearchText = '';
  }

  onLimitChange(limit: number) {
    this.currentLimit = limit;
    this.currentPage = 1; // Reset to first page on limit change
    
    // If limit is set and pagination is enabled, update pageSize to match limit
    if (limit > 0 && this.pagination) {
      // Note: We don't change the pageSize input, but use limit as effective pageSize
      // This ensures each page shows exactly 'limit' number of records
    }
    
    // Reload data if using dataSource
    if (this.dataSource) {
      this.loadDataSource();
    }
    
    this.limitChange.emit(limit);
  }

  get displayColumns(): TableColumn[] {
    // Use internal columns if available (for resize state), otherwise use input columns
    const cols = this.internalColumns.length > 0 ? this.internalColumns : this.columns;
    // Filter out hidden columns
    return cols.filter(col => !col.hidden);
  }

  get filteredData(): TableRow[] {
    // Use internalData if dataSource is used, otherwise use data input
    const sourceData = this.dataSource ? this.internalData : this.data;
    let result = [...sourceData];
    
    // Advanced Filter - only apply client-side if NOT using dataSource
    // If using dataSource, filter is already applied server-side
    if (!this.dataSource && this.activeFilter && this.activeFilter.conditions.length > 0) {
      result = this.applyAdvancedFilter(result);
    }
    
    // Simple Search/Filter - only search on Enter key press
    if (this.searchTerm && this.searchTerm.trim()) {
      const searchValue = this.searchTerm.trim();
      
      // Check if search value is numeric
      const isNumeric = !isNaN(Number(searchValue)) && searchValue !== '';
      const searchNumber = isNumeric ? Number(searchValue) : null;
      const searchLower = searchValue.toLowerCase();
      
      // Number type columns
      const numberTypes: ColumnType[] = ['int', 'float', 'money', 'currency', 'percent'];
      // Text type columns
      const textTypes: ColumnType[] = ['text', 'alphanumeric'];
      
      result = result.filter((row, index) => {
        const fieldsToSearch = this.searchFields.length > 0 
          ? this.searchFields 
          : this.displayColumns.map((col: TableColumn) => col.field);
        
        return fieldsToSearch.some(field => {
          // Find the column to check its type and searchable property
          const column = this.displayColumns.find(col => col.field === field);
          
          // Check if column is searchable
          // searchable can be: true, false, undefined, or a ColumnType string (e.g., "text", "int", "enum")
          // Only false means not searchable, everything else means searchable
          const isSearchable = column ? (column.searchable !== false) : true;
          if (!isSearchable) {
            return false; // Skip non-searchable columns
          }
          
          // If numeric search, only search in searchable columns with number OR text type
          if (isNumeric && searchNumber !== null) {
            // For numeric search: searchable AND (number type OR text type)
            if (!column || !column.type) {
              // If no type specified, allow search (backward compatibility)
            } else if (!numberTypes.includes(column.type) && !textTypes.includes(column.type)) {
              return false; // Skip columns that are neither number nor text type
            }
          } else {
            // Text search, only search in searchable columns with text type
            if (!column || !column.type) {
              // If no type specified, allow search (backward compatibility)
            } else if (!textTypes.includes(column.type)) {
              return false; // Skip non-text columns for text search
            }
          }
          
          let value: any;
          
          if (column && column.render && typeof column.render === 'function') {
            // Use render function to get the value
            value = column.render(row, index, column);
          } else if (this.nestedFields && field.includes('.')) {
            // Support nested field access
            const fields = field.split('.');
            value = row;
            for (const f of fields) {
              if (value && typeof value === 'object') {
                value = value[f];
              } else {
                value = null;
                break;
              }
            }
          } else {
            // Direct field access
            value = row[field];
          }
          
          if (value == null) return false;
          
          // Perform search based on type
          if (isNumeric && searchNumber !== null) {
            // Numeric search: search for number in the value (contains)
            const valueStr = String(value);
            return valueStr.includes(searchValue);
          } else {
            // Text search: case-insensitive contains
            return String(value).toLowerCase().includes(searchLower);
          }
        });
      });
    }
    
    // Sorting
    if (this.sortField) {
      result.sort((a, b) => {
        const aVal = a[this.sortField!];
        const bVal = b[this.sortField!];
        
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return this.sortDirection === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        
        return this.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }
    
    // Pagination - Only apply client-side pagination if NOT using dataSource
    // When using dataSource, the API already returns paginated data
    if (this.pagination && result.length > 0 && !this.dataSource) {
      // Always use currentLimit as pageSize for pagination
      const effectivePageSize = this.currentLimit > 0 ? this.currentLimit : this.pageSize;
      const startIndex = (this.currentPage - 1) * effectivePageSize;
      const endIndex = startIndex + effectivePageSize;
      result = result.slice(startIndex, endIndex);
    }
    
    return result;
  }

  get allFilteredData(): TableRow[] {
    let result = [...this.data];
    
    // Advanced Filter
    if (this.activeFilter && this.activeFilter.conditions.length > 0) {
      result = this.applyAdvancedFilter(result);
    }
    
    // Simple Search/Filter (without pagination) - same logic as filteredData
    if (this.searchTerm && this.searchTerm.trim()) {
      const searchValue = this.searchTerm.trim();
      
      // Check if search value is numeric
      const isNumeric = !isNaN(Number(searchValue)) && searchValue !== '';
      const searchNumber = isNumeric ? Number(searchValue) : null;
      const searchLower = searchValue.toLowerCase();
      
      // Number type columns
      const numberTypes: ColumnType[] = ['int', 'float', 'money', 'currency', 'percent'];
      // Text type columns
      const textTypes: ColumnType[] = ['text', 'alphanumeric'];
      
      result = result.filter((row, index) => {
        const fieldsToSearch = this.searchFields.length > 0 
          ? this.searchFields 
          : this.columns.map(col => col.field);
        
        return fieldsToSearch.some(field => {
          // Find the column to check its type and searchable property
          const column = this.columns.find(col => col.field === field);
          
          // Check if column is searchable
          // searchable can be: true, false, undefined, or a ColumnType string (e.g., "text", "int", "enum")
          // Only false means not searchable, everything else means searchable
          const isSearchable = column ? (column.searchable !== false) : true;
          if (!isSearchable) {
            return false; // Skip non-searchable columns
          }
          
          // If numeric search, only search in searchable columns with number OR text type
          if (isNumeric && searchNumber !== null) {
            // For numeric search: searchable AND (number type OR text type)
            if (!column || !column.type) {
              // If no type specified, allow search (backward compatibility)
            } else if (!numberTypes.includes(column.type) && !textTypes.includes(column.type)) {
              return false; // Skip columns that are neither number nor text type
            }
          } else {
            // Text search, only search in searchable columns with text type
            if (!column || !column.type) {
              // If no type specified, allow search (backward compatibility)
            } else if (!textTypes.includes(column.type)) {
              return false; // Skip non-text columns for text search
            }
          }
          
          let value: any;
          
          if (column && column.render && typeof column.render === 'function') {
            // Use render function to get the value
            value = column.render(row, index, column);
          } else if (this.nestedFields && field.includes('.')) {
            // Support nested field access
            const fields = field.split('.');
            value = row;
            for (const f of fields) {
              if (value && typeof value === 'object') {
                value = value[f];
              } else {
                value = null;
                break;
              }
            }
          } else {
            // Direct field access
            value = row[field];
          }
          
          if (value == null) return false;
          
          // Perform search based on type
          if (isNumeric && searchNumber !== null) {
            // Numeric search: search for number in the value (contains)
            const valueStr = String(value);
            return valueStr.includes(searchValue);
          } else {
            // Text search: case-insensitive contains
            return String(value).toLowerCase().includes(searchLower);
          }
        });
      });
    }
    
    // Sorting
    if (this.sortField) {
      result.sort((a, b) => {
        const aVal = a[this.sortField!];
        const bVal = b[this.sortField!];
        
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return this.sortDirection === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        
        return this.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }
    
    // Limit (w2ui compatible) - applied before pagination for selection
    if (this.currentLimit > 0) {
      result = result.slice(0, this.currentLimit);
    }
    
    return result;
  }

  onSort(column: TableColumn, event?: MouseEvent) {
    if (!column.sortable) return;
    
    if (event) {
      event.stopPropagation();
      this.columnClick.emit({ column, event });
    }

    if (this.sortField === column.field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = column.field;
      this.sortDirection = 'asc';
    }
    
    // Reload data if using dataSource
    if (this.dataSource) {
      this.loadDataSource();
    }
    
    this.sortChange.emit({ field: column.field, direction: this.sortDirection });
  }

  onColumnDblClick(column: TableColumn, event: MouseEvent) {
    event.stopPropagation();
    this.columnDblClick.emit({ column, event });
  }

  onColumnContextMenu(column: TableColumn, event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.columnContextMenu.emit({ column, event });
  }

  onColumnResizeStart(event: MouseEvent, column: TableColumn, columnIndex: number) {
    if (column.resizable === false) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    // Initialize internal columns if not already done
    if (this.internalColumns.length === 0) {
      this.internalColumns = this.columns.map(col => ({ ...col }));
    }
    
    this.isResizing = true;
    this.resizingColumn = column;
    this.resizingColumnIndex = columnIndex;
    this.resizeStartX = event.screenX;
    
    // Get current width
    const currentWidth = column.width || column.size || '100px';
    this.resizeStartWidth = this.parseWidth(currentWidth);
    
    // Find all tds for this column for quick resize (w2ui approach)
    const tableElement = event.currentTarget as HTMLElement;
    const table = tableElement.closest('table');
    if (table) {
      const rows = table.querySelectorAll('tbody tr');
      this.resizeTds = Array.from(rows).map(row => {
        const cells = row.querySelectorAll('td');
        // Skip select column if exists
        const actualColIndex = this.selectable ? columnIndex + 1 : columnIndex;
        return cells[actualColIndex] as HTMLElement;
      }).filter(td => td != null);
    }
    
    // Add global event listeners
    document.addEventListener('mousemove', this.onColumnResizeMove);
    document.addEventListener('mouseup', this.onColumnResizeEnd);
    
    // Prevent text selection during resize
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ew-resize';
  }

  private onColumnResizeMove(event: MouseEvent) {
    if (!this.isResizing || !this.resizingColumn || this.resizingColumnIndex === -1) return;
    
    event.preventDefault();
    
    const deltaX = event.screenX - this.resizeStartX;
    const newWidth = Math.max(20, this.resizeStartWidth + deltaX); // Minimum 20px
    const newWidthStr = newWidth + 'px';
    
    // Update column in the internal array first (for state management)
    if (this.internalColumns.length === 0) {
      this.internalColumns = this.columns.map(col => ({ ...col }));
    }
    
    if (this.resizingColumnIndex < this.internalColumns.length) {
      // Create a new array with updated column
      this.internalColumns = this.internalColumns.map((col, index) => {
        if (index === this.resizingColumnIndex) {
          return {
            ...col,
            width: newWidthStr,
            size: newWidthStr
          };
        }
        return col;
      });
      
      // Update the resizingColumn reference
      this.resizingColumn = this.internalColumns[this.resizingColumnIndex];
    }
    
    // Quick resize: directly update DOM for immediate visual feedback (w2ui approach)
    // Update all tds for this column
    this.resizeTds.forEach(td => {
      if (td) {
        td.style.width = newWidthStr;
      }
    });
    
    // Also update header th
    const resizerElement = event.target as HTMLElement;
    const table = resizerElement.closest('table');
    if (table) {
      const headerRow = table.querySelector('thead tr');
      if (headerRow) {
        const headerCells = headerRow.querySelectorAll('th');
        const actualColIndex = this.selectable ? this.resizingColumnIndex + 1 : this.resizingColumnIndex;
        const headerCell = headerCells[actualColIndex] as HTMLElement;
        if (headerCell) {
          headerCell.style.width = newWidthStr;
        }
      }
    }
    
    // Debounced full resize (w2ui approach: setTimeout 100ms)
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }
    this.resizeTimer = setTimeout(() => {
      this.cdr.markForCheck();
    }, 100);
    
    // Emit resize event
    if (this.resizingColumn) {
      this.columnResize.emit({ column: this.resizingColumn, width: newWidth });
    }
  }

  private onColumnResizeEnd(event: MouseEvent) {
    if (!this.isResizing) return;
    
    event.preventDefault();
    
    // Clear debounce timer
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = null;
    }
    
    // Remove global event listeners
    document.removeEventListener('mousemove', this.onColumnResizeMove);
    document.removeEventListener('mouseup', this.onColumnResizeEnd);
    
    // Restore cursor and selection
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    
    // Finalize resize - trigger full change detection (w2ui approach: resizeRecords())
    this.cdr.markForCheck();
    
    // Finalize resize
    if (this.resizingColumn && this.resizingColumnIndex !== -1) {
      const finalWidth = this.resizingColumn.width ? this.parseWidth(this.resizingColumn.width) : this.resizeStartWidth;
      this.columnResize.emit({ column: this.resizingColumn, width: finalWidth });
    }
    
    // Reset state
    this.isResizing = false;
    this.resizingColumn = null;
    this.resizingColumnIndex = -1;
    this.resizeTds = [];
  }

  private parseWidth(width: string | number): number {
    if (typeof width === 'number') {
      return width;
    }
    if (typeof width === 'string') {
      const match = width.match(/^(\d+(?:\.\d+)?)px$/);
      if (match) {
        return parseFloat(match[1]);
      }
      // Try to parse as number
      const num = parseFloat(width);
      if (!isNaN(num)) {
        return num;
      }
    }
    return 100; // Default width
  }

  onRowClick(row: TableRow, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    
    // Get column index from event target (w2ui.js style)
    let columnIndex: number | undefined = undefined;
    if (event && event.target) {
      const target = event.target as HTMLElement;
      // Find closest TD element
      let td: HTMLElement | null = target;
      if (td.tagName !== 'TD') {
        td = target.closest('td');
      }
      
      if (td) {
        // Get column index from col attribute
        const colAttr = td.getAttribute('col');
        if (colAttr !== null) {
          columnIndex = parseInt(colAttr, 10);
        }
      }
    }
    
    // Toggle row selection if selectable is enabled
    if (this.selectable && !this.isRangeSelecting) {
      const rowId = this.getRowId(row);
      if (this.selectedRows.has(rowId)) {
        this.selectedRows.delete(rowId);
      } else {
        this.selectedRows.add(rowId);
      }
      this.emitSelection();
    }
    
    this.rowClick.emit({ row, columnIndex });
  }

  onRowMouseDown(row: TableRow, event: MouseEvent) {
    if (!this.selectable || event.button !== 0) { // Only handle left mouse button
      return;
    }
    
    // Check if clicking on checkbox, if so let the checkbox handle it
    const target = event.target as HTMLElement;
    if (target.closest('input[type="checkbox"]') || target.closest('.ui-table-select-cell')) {
      return;
    }
    
    // Check if clicking on picture cell (img or inside a cell with picture type)
    // If it's a picture cell, don't prevent default and don't start row selection - let click event fire
    const td = target.closest('td');
    let isPictureCell = false;
    if (td) {
      const colAttr = td.getAttribute('col');
      if (colAttr !== null) {
        const colIndex = parseInt(colAttr, 10);
        const column = this.displayColumns[colIndex];
        if (column && column.type === 'picture') {
          // Check if clicked element is an img or inside a span containing an img
          const img = target.tagName === 'IMG' ? target : target.querySelector('img') || target.closest('img');
          if (img) {
            isPictureCell = true;
            // Set up range selecting state so onDocumentMouseUp can handle the picture click
            // But don't start row selection - let onDocumentMouseUp handle it
            this.isRangeSelecting = true;
            this.rangeSelectStartRow = row;
            this.hasMouseMoved = false;
            
            // Add global mouse move and mouse up listeners
            document.addEventListener('mousemove', this.onDocumentMouseMove);
            document.addEventListener('mouseup', this.onDocumentMouseUp);
            
            // Don't call preventDefault or stopPropagation - let the click event bubble up
            return;
          }
        }
      }
    }
    
    // Only prevent default if it's NOT a picture cell (to allow click event to fire)
    if (!isPictureCell) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Start range selection (only if not a picture cell)
    this.isRangeSelecting = true;
    this.rangeSelectStartRow = row;
    this.hasMouseMoved = false;
    
    // Store initial selection state
    const rowId = this.getRowId(row);
    const wasSelected = this.selectedRows.has(rowId);
    
    // Clear previous selection and select the starting row
    this.selectedRows.clear();
    this.selectedRows.add(rowId);
    this.emitSelection();
    
    // Add global mouse move and mouse up listeners
    document.addEventListener('mousemove', this.onDocumentMouseMove);
    document.addEventListener('mouseup', this.onDocumentMouseUp);
  }

  private onDocumentMouseMove = (event: MouseEvent) => {
    if (!this.isRangeSelecting || !this.rangeSelectStartRow) {
      return;
    }
    
    // Find the row element under the mouse cursor
    const target = event.target as HTMLElement;
    const rowElement = target.closest('tr[class*="ui-table-row"]') as HTMLElement;
    
    if (!rowElement) {
      return;
    }
    
    // Find the row data from the row index
    const rowIndex = Array.from(rowElement.parentElement?.children || []).indexOf(rowElement);
    if (rowIndex === -1) {
      return;
    }
    
    const endRow = this.filteredData[rowIndex];
    if (!endRow) {
      return;
    }
    
    // Select all rows between start and end
    this.selectRange(this.rangeSelectStartRow, endRow);
  };

  private onDocumentMouseUp = (event: MouseEvent) => {
    if (this.isRangeSelecting && this.rangeSelectStartRow) {
      // Check if clicking on picture cell (img or inside a cell with picture type)
      const target = event.target as HTMLElement;
      const td = target.closest('td');
      let isPictureClick = false;
      let pictureColumn: TableColumn | null = null;
      let pictureRow: TableRow | null = null;
      let pictureRowIndex = -1;
      let pictureColumnIndex = -1;
      
      if (td) {
        const colAttr = td.getAttribute('col');
        if (colAttr !== null) {
          const colIndex = parseInt(colAttr, 10);
          const column = this.displayColumns[colIndex];
          if (column && column.type === 'picture') {
            // Check if clicked element is an img or inside a span containing an img
            const img = target.tagName === 'IMG' ? target : target.querySelector('img') || target.closest('img');
            if (img) {
              isPictureClick = true;
              pictureColumn = column;
              pictureColumnIndex = colIndex;
              
              // Get row index from TR element's index attribute
              const tr = td.closest('tr');
              if (tr) {
                const indexAttr = tr.getAttribute('index');
                if (indexAttr !== null) {
                  pictureRowIndex = parseInt(indexAttr, 10);
                  // Get the actual row data from filteredData
                  if (this.filteredData[pictureRowIndex]) {
                    pictureRow = this.filteredData[pictureRowIndex];
                  }
                }
              }
            }
          }
        }
      }
      
      // If it's a picture click, handle it here
      if (isPictureClick && pictureColumn && pictureRow && pictureRowIndex >= 0 && pictureColumnIndex >= 0) {
        const pictureId = pictureRow[pictureColumn.field] || '';
        
        // Open picture overlay
        this.openPictureOverlay(pictureId, pictureColumn);
        
        this.pictureClick.emit({
          row: pictureRow,
          column: pictureColumn,
          rowIndex: pictureRowIndex,
          columnIndex: pictureColumnIndex,
          pictureId: pictureId,
          event: event
        });
        
        this.isRangeSelecting = false;
        this.rangeSelectStartRow = null;
        this.hasMouseMoved = false;
        
        // Remove global listeners
        document.removeEventListener('mousemove', this.onDocumentMouseMove);
        document.removeEventListener('mouseup', this.onDocumentMouseUp);
        
        // Emit selection to ensure parent components are notified
        this.emitSelection();
        return;
      }
      
      // If mouse didn't move, it was a single click (but not on picture)
      if (!this.hasMouseMoved && !isPictureClick) {
        // Get column index from event target (w2ui.js style)
        let columnIndex: number | undefined = undefined;
        if (event && event.target) {
          // Find closest TD element
          let td: HTMLElement | null = target;
          if (td.tagName !== 'TD') {
            td = target.closest('td');
          }
          
          if (td) {
            // Get column index from col attribute
            const colAttr = td.getAttribute('col');
            if (colAttr !== null) {
              columnIndex = parseInt(colAttr, 10);
            }
          }
        }
        // For single click, emit rowClick event
        this.rowClick.emit({ row: this.rangeSelectStartRow, columnIndex });
      }
      
      this.isRangeSelecting = false;
      this.rangeSelectStartRow = null;
      this.hasMouseMoved = false;
      
      // Remove global listeners
      document.removeEventListener('mousemove', this.onDocumentMouseMove);
      document.removeEventListener('mouseup', this.onDocumentMouseUp);
      
      // Emit selection to ensure parent components are notified
      this.emitSelection();
    }
  };

  private selectRange(startRow: TableRow, endRow: TableRow) {
    const startIndex = this.filteredData.findIndex(row => this.getRowId(row) === this.getRowId(startRow));
    const endIndex = this.filteredData.findIndex(row => this.getRowId(row) === this.getRowId(endRow));
    
    if (startIndex === -1 || endIndex === -1) {
      return;
    }
    
    // Determine the range (can be up or down)
    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);
    
    // Clear previous selection
    this.selectedRows.clear();
    
    // Select all rows in the range
    for (let i = minIndex; i <= maxIndex; i++) {
      const row = this.filteredData[i];
      if (row) {
        const rowId = this.getRowId(row);
        this.selectedRows.add(rowId);
      }
    }
    
    // Trigger change detection
    this.cdr.markForCheck();
  }

  onCellClick(event: MouseEvent, row: TableRow, column: TableColumn, rowIndex: number, colIndex: number) {
    const target = event.target as HTMLElement;
    
    // Check if clicked element is an img (picture) - handle this first
    const isImg = target.tagName === 'IMG';
    const img = isImg ? target : (target.closest('img') || target.querySelector('img'));
    
    // w2ui.js style: Get column from TD element's col attribute if not provided
    let clickedColumnIndex = colIndex;
    let clickedRowIndex = rowIndex;
    
    if (event.target) {
      // Find closest TD element (like w2ui.js does)
      let td: HTMLElement | null = target;
      if (td.tagName !== 'TD') {
        td = target.closest('td');
      }
      
      if (td) {
        // Get column index from col attribute (w2ui.js style)
        const colAttr = td.getAttribute('col');
        if (colAttr !== null) {
          clickedColumnIndex = parseInt(colAttr, 10);
        }
        
        // Get row index from TR element's index attribute
        const tr = td.closest('tr');
        if (tr) {
          const indexAttr = tr.getAttribute('index');
          if (indexAttr !== null) {
            clickedRowIndex = parseInt(indexAttr, 10);
            // Get the actual row data from filteredData
            if (this.filteredData[clickedRowIndex]) {
              row = this.filteredData[clickedRowIndex];
            }
          }
        }
        
        // Get column from displayColumns using column index
        if (this.displayColumns[clickedColumnIndex]) {
          column = this.displayColumns[clickedColumnIndex];
        }
      }
    }
    
    // Check if this is a picture column and the click target is an image
    // If clicked element is an img, check if the column is a picture column
    if (img && this.displayColumns[clickedColumnIndex]?.type === 'picture') {
      const actualColumn = this.displayColumns[clickedColumnIndex];
      const pictureId = row[actualColumn.field] || '';
      
      // Open picture overlay
      this.openPictureOverlay(pictureId, actualColumn);
      
      // Emit pictureClick event
      this.pictureClick.emit({
        row: row,
        column: actualColumn,
        rowIndex: clickedRowIndex,
        columnIndex: clickedColumnIndex,
        pictureId: pictureId,
        event: event
      });
      event.preventDefault(); // Prevent default behavior
      event.stopPropagation(); // Prevent row click
      return; // Exit early to prevent further processing
    }
    
    // Also check if column type is picture (for clicks on the cell, not just the img)
    if (column.type === 'picture' && img) {
      const pictureId = row[column.field] || '';
      
      // Open picture overlay
      this.openPictureOverlay(pictureId, column);
      
      // Emit pictureClick event
      this.pictureClick.emit({
        row: row,
        column: column,
        rowIndex: clickedRowIndex,
        columnIndex: clickedColumnIndex,
        pictureId: pictureId,
        event: event
      });
      event.preventDefault(); // Prevent default behavior
      event.stopPropagation(); // Prevent row click
      return; // Exit early to prevent further processing
    }
  }

  onCellDblClick(event: MouseEvent, row: TableRow, column: TableColumn) {
    // Stop event propagation to prevent row double click
    event.stopPropagation();
  }

  onRowDblClick(row: TableRow, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.rowDblClick.emit(row);
  }

  onRowContextMenu(row: TableRow, event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.contextMenu.emit({ row, event });
  }

  onRowMouseEnter(row: TableRow) {
    this.mouseEnter.emit(row);
  }

  onRowMouseLeave(row: TableRow) {
    this.mouseLeave.emit(row);
  }

  onSelectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    
    if (checked) {
      this.allFilteredData.forEach(row => {
        this.selectedRows.add(this.getRowId(row));
      });
    } else {
      this.allFilteredData.forEach(row => {
        this.selectedRows.delete(this.getRowId(row));
      });
    }
    
    this.emitSelection();
  }

  onSelectRow(event: Event, row: TableRow) {
    const checked = (event.target as HTMLInputElement).checked;
    const rowId = this.getRowId(row);
    
    if (checked) {
      this.selectedRows.add(rowId);
    } else {
      this.selectedRows.delete(rowId);
    }
    
    this.emitSelection();
  }

  isSelected(row: TableRow): boolean {
    return this.selectedRows.has(this.getRowId(row));
  }

  isAllSelected(): boolean {
    return this.allFilteredData.length > 0 && 
           this.allFilteredData.every(row => this.selectedRows.has(this.getRowId(row)));
  }

  isIndeterminate(): boolean {
    const selectedCount = this.allFilteredData.filter(row => this.selectedRows.has(this.getRowId(row))).length;
    return selectedCount > 0 && selectedCount < this.allFilteredData.length;
  }

  private getRowId(row: TableRow): any {
    const recidField = this.recid || 'id';
    return row['recid'] ?? row[recidField] ?? row['id'] ?? row['_id'] ?? JSON.stringify(row);
  }

  private emitSelection() {
    // Use filteredData or internalData depending on dataSource
    const dataSource = this.dataSource ? this.filteredData : this.data;
    const selected = dataSource.filter(row => this.selectedRows.has(this.getRowId(row)));
    this.rowSelect.emit(selected);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      // Reload data if using dataSource
      if (this.dataSource) {
        this.loadDataSource();
      }
    }
  }

  goToFirstPage() {
    if (this.currentPage > 1) {
      this.currentPage = 1;
      // Reload data if using dataSource
      if (this.dataSource) {
        this.loadDataSource();
      }
    }
  }

  goToLastPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage = this.totalPages;
      // Reload data if using dataSource
      if (this.dataSource) {
        this.loadDataSource();
      }
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      // Reload data if using dataSource
      if (this.dataSource) {
        this.loadDataSource();
      }
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      // Reload data if using dataSource
      if (this.dataSource) {
        this.loadDataSource();
      }
    }
  }

  onPageInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const pageNumber = parseInt(input.value, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      // Reload data if using dataSource
      if (this.dataSource) {
        this.loadDataSource();
      }
    } else {
      // Reset to current page if invalid
      input.value = this.currentPage.toString();
    }
  }

  onPageInputKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      const input = event.target as HTMLInputElement;
      const pageNumber = parseInt(input.value, 10);
      if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= this.totalPages) {
        this.currentPage = pageNumber;
        // Reload data if using dataSource
        if (this.dataSource) {
          this.loadDataSource();
        }
      } else {
        input.value = this.currentPage.toString();
      }
    }
  }

  getAlignmentClass(align?: string): string {
    return align ? `ui-table-align-${align}` : '';
  }

  /**
   * Format number with locale support (w2ui compatible)
   */
  private formatNumber(val: number | string | null | undefined, fraction?: number, useGrouping: boolean = true): string {
    if (val == null || val === '' || typeof val === 'object') return '';
    const numValue = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(numValue)) return '';
    
    const options: Intl.NumberFormatOptions = {
      useGrouping: useGrouping
    };
    
    if (fraction != null && fraction >= 0) {
      options.minimumFractionDigits = fraction;
      options.maximumFractionDigits = fraction;
    } else {
      options.minimumFractionDigits = 0;
      options.maximumFractionDigits = 20;
    }
    
    return numValue.toLocaleString('en-US', options);
  }

  /**
   * Format currency value (w2ui compatible)
   * Supports column-specific overrides and global settings
   */
  formatCurrency(value: number | string | null | undefined, column?: TableColumn): string {
    if (value == null || value === '') return '';
    
    // Convert to number
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '';
    
    // Get currency settings: column-specific overrides global settings
    const currencyPrefix = column?.currencyPrefix ?? this.currencyPrefix ?? '$';
    const currencySuffix = column?.currencySuffix ?? this.currencySuffix ?? '';
    const currencyPrecision = column?.currencyPrecision ?? this.currencyPrecision ?? 2;
    
    const formattedNumber = this.formatNumber(numValue, currencyPrecision, true);
    return currencyPrefix + formattedNumber + currencySuffix;
  }

  /**
   * Get formatted value for form field display
   */
  getFormattedFormValue(column: TableColumn): string {
    const value = this.formData[column.field];
    
    // Handle null, undefined, or empty string
    if (value == null || value === '') {
      return '';
    }
    
    // Handle 0 value - should still be formatted
    if (column.type === 'currency' || column.type === 'money') {
      // Format even if value is 0
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue)) {
        return '';
      }
      const formatted = this.formatCurrency(numValue, column);
      return formatted;
    }
    
    if (column.type === 'percent') {
      const formattedNumber = this.formatNumber(value, 1, true);
      return formattedNumber + '%';
    }
    
    return String(value);
  }

  /**
   * Get cell value for a column, supporting render functions and nested fields
   */
  getCellValue(row: TableRow, column: TableColumn, index: number): any {
    // If render function is provided, use it
    if (column.render && typeof column.render === 'function') {
      return column.render(row, index, column);
    }
    
    // Default render for picture type columns
    if (column.type === 'picture') {
      return this.renderPictureColumn(row, column);
    }
    
    // Get raw value
    let value: any;
    
    // Support nested field access (e.g., "user.name" or "CustomField.CustomField01")
    if (this.nestedFields && column.field.includes('.')) {
      const fields = column.field.split('.');
      value = row;
      for (const field of fields) {
        if (value && typeof value === 'object') {
          value = value[field];
        } else {
          value = '';
          break;
        }
      }
    } else {
      // Direct field access
      value = row[column.field];
    }
    
    // Format value based on column type
    if (value == null || value === '') return '';
    
    // Format currency and money types
    if (column.type === 'currency' || column.type === 'money') {
      return this.formatCurrency(value, column);
    }
    
    // Format percent type
    if (column.type === 'percent') {
      const formattedNumber = this.formatNumber(value, 1, true);
      return formattedNumber + '%';
    }
    
    return value;
  }
  
  /**
   * Default render function for picture columns
   */
  private renderPictureColumn(row: TableRow, column: TableColumn): string {
    const pictureId = row[column.field];
    if (!pictureId) {
      return '';
    }
    // Construct picture URL
    const pictureUrl = this.buildPictureUrl(pictureId, column);
    // Escape HTML to prevent XSS
    const div = document.createElement('div');
    div.textContent = pictureUrl;
    const escapedUrl = div.innerHTML;
    // Return small image HTML
    return `<img src="${escapedUrl}" alt="Picture" style="width: 15px; height: 15px; object-fit: cover; border-radius: 4px;" />`;
  }
  
  /**
   * Build picture URL from pictureId and column prependUrl
   */
  private buildPictureUrl(pictureId: string, column: TableColumn): string {
    // If pictureId is already a full URL, return it
    if (pictureId.startsWith('http://') || pictureId.startsWith('https://')) {
      return pictureId;
    }
    
    // If prependUrl is provided, use it
    if (column.prependUrl) {
      return column.prependUrl.replace('{0}', pictureId);
    }
    
    // Default fallback
    return `http://localhost/images/${pictureId}`;
  }

  /**
   * Check if cell value is HTML string (for innerHTML rendering)
   */
  isHtmlValue(column: TableColumn, row: TableRow, index: number): boolean {
    // Picture type columns always return HTML
    if (column.type === 'picture') {
      return true;
    }
    
    // If render function is provided, check its output
    if (column.render && typeof column.render === 'function') {
      const value = column.render(row, index, column);
      return typeof value === 'string' && (value.includes('<') || value.includes('&lt;'));
    }
    
    return false;
  }

  /**
   * Sanitize HTML string for safe rendering
   */
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  applyAdvancedFilter(data: TableRow[]): TableRow[] {
    if (!this.activeFilter || this.activeFilter.conditions.length === 0) {
      return data;
    }

    return data.filter(row => {
      const results = this.activeFilter!.conditions.map(condition => {
        return this.evaluateCondition(row, condition);
      });

      if (this.activeFilter!.logic === 'AND') {
        return results.every(r => r === true);
      } else {
        return results.some(r => r === true);
      }
    });
  }

  private evaluateCondition(row: TableRow, condition: FilterCondition): boolean {
    const fieldValue = row[condition.field];
    const operatorValue = condition.value;

    switch (condition.operator) {
      case 'equals':
        return String(fieldValue).toLowerCase() === String(operatorValue).toLowerCase();
      
      case 'notEquals':
        return String(fieldValue).toLowerCase() !== String(operatorValue).toLowerCase();
      
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(operatorValue).toLowerCase());
      
      case 'notContains':
        return !String(fieldValue).toLowerCase().includes(String(operatorValue).toLowerCase());
      
      case 'startsWith':
        return String(fieldValue).toLowerCase().startsWith(String(operatorValue).toLowerCase());
      
      case 'endsWith':
        return String(fieldValue).toLowerCase().endsWith(String(operatorValue).toLowerCase());
      
      case 'greaterThan':
        return Number(fieldValue) > Number(operatorValue);
      
      case 'greaterThanOrEqual':
        return Number(fieldValue) >= Number(operatorValue);
      
      case 'lessThan':
        return Number(fieldValue) < Number(operatorValue);
      
      case 'lessThanOrEqual':
        return Number(fieldValue) <= Number(operatorValue);
      
      case 'between':
        // For between, value should be "min,max" format
        if (typeof operatorValue === 'string' && operatorValue.includes(',')) {
          const parts = operatorValue.split(',').map(v => v.trim());
          if (parts.length === 2) {
            const min = Number(parts[0]);
            const max = Number(parts[1]);
            const numValue = Number(fieldValue);
            if (!isNaN(min) && !isNaN(max) && !isNaN(numValue)) {
              return numValue >= min && numValue <= max;
            }
          }
        }
        return false;
      
      case 'in':
        const inValues = String(operatorValue).split(',').map(v => v.trim().toLowerCase());
        return inValues.includes(String(fieldValue).toLowerCase());
      
      case 'notIn':
        const notInValues = String(operatorValue).split(',').map(v => v.trim().toLowerCase());
        return !notInValues.includes(String(fieldValue).toLowerCase());
      
      case 'isEmpty':
        return fieldValue == null || fieldValue === '' || String(fieldValue).trim() === '';
      
      case 'isNotEmpty':
        return fieldValue != null && fieldValue !== '' && String(fieldValue).trim() !== '';
      
      default:
        return true;
    }
  }

  openFilterPanel() {
    this.showFilterPanel = true;
    this.showJoinOptionsPanel = false; // Close join options when filter opens
    this.cdr.markForCheck();
  }

  closeFilterPanel() {
    this.showFilterPanel = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target) return;
    
    // Handle options menu
    if (!target.closest('.ui-options-menu-wrapper')) {
      this.showOptionsMenu = false;
    }
    
    // Handle filter panel
    if (!this.showFilterPanel && !this.advancedFilter) {
      return; // Filter panel açık değilse, işlem yapma
    }
    
    // Filter button veya filter panel içindeki herhangi bir elemente tıklandıysa, kapatma
    const filterButton = target.closest('.ui-filter-icon-outer');
    const filterOverlay = target.closest('.ui-filter-overlay');
    const filterPanel = target.closest('.ui-filter-panel');
    
    // Eğer filter button veya filter panel içindeyse, kapatma
    if (filterButton || filterOverlay || filterPanel) {
      return; // Filter button veya panel içindeyse, kapatma
    }
    
    // Aksi halde kapat
    this.closeFilterPanel();
  }

  onRefresh() {
    this.reload();
  }

  onDelete() {
    // Use filteredData or internalData depending on dataSource
    const dataSource = this.dataSource ? this.filteredData : this.data;
    const selectedRowsArray = dataSource.filter(row => this.selectedRows.has(this.getRowId(row)));
    this.delete.emit(selectedRowsArray);
    // Clear selection after delete
    this.selectedRows.clear();
    this.emitSelection();
  }

  onFilterChange(filter: AdvancedFilter) {
    this.activeFilter = filter;
    this.currentPage = 1; // Reset to first page
    
    // Reload data if using dataSource
    if (this.dataSource) {
      // Force change detection before loading to ensure activeFilter is set
      this.cdr.markForCheck();
      this.loadDataSource();
    }
    
    this.advancedFilterChange.emit(filter);
    // Close filter panel after applying filter
    this.closeFilterPanel();
  }

  onFilterClear() {
    this.activeFilter = null;
    this.currentPage = 1;
    
    // Reload data if using dataSource
    if (this.dataSource) {
      this.loadDataSource();
    }
    
    this.advancedFilterChange.emit(null);
    this.closeFilterPanel();
  }

  get hasActiveFilter(): boolean {
    return this.activeFilter !== null && this.activeFilter.conditions.length > 0;
  }

  get columnOptions(): TableColumn[] {
    return this.columns.filter(col => col.searchable !== false);
  }

  // Toolbar methods (w2ui style)
  get toolbarItems(): ToolbarItem[] {
    if (!this.toolbar) {
      return this.getDefaultToolbarItems();
    }

    const items: ToolbarItem[] = [];
    const show = this.toolbar.show || {};
    const tb_items = this.toolbar.items || [];

    // Default button definitions (w2ui style)
    const defaultButtons = {
      reload: {
        id: 'reload',
        type: 'button' as ToolbarItemType,
        icon: 'reload',
        tooltip: this.translate.instant('toolbar.reloadTooltip'),
        onClick: (event: MouseEvent) => this.onRefresh()
      },
      add: {
        id: 'add',
        type: 'button' as ToolbarItemType,
        text: this.translate.instant('toolbar.addNew'),
        icon: 'plus',
        tooltip: this.translate.instant('toolbar.addNewTooltip'),
        onClick: (event: MouseEvent) => this.onAdd()
      },
      edit: {
        id: 'edit',
        type: 'button' as ToolbarItemType,
        text: this.translate.instant('toolbar.edit'),
        icon: 'pencil',
        tooltip: this.translate.instant('toolbar.editTooltip'),
        disabled: !this.hasSingleSelection(),
        onClick: (event: MouseEvent) => this.onEdit()
      },
      delete: {
        id: 'delete',
        type: 'button' as ToolbarItemType,
        text: this.translate.instant('toolbar.delete'),
        icon: 'delete',
        tooltip: this.translate.instant('toolbar.deleteTooltip'),
        disabled: this.selectedRows.size === 0,
        onClick: (event: MouseEvent) => this.onDelete()
      },
      save: {
        id: 'save',
        type: 'button' as ToolbarItemType,
        text: this.translate.instant('toolbar.save'),
        icon: 'check',
        tooltip: this.translate.instant('toolbar.saveTooltip'),
        onClick: (event: MouseEvent) => this.onUpdate()
      }
    };

    // Add reload button if enabled
    if (show.reload !== false && this.showRefresh) {
      items.push(defaultButtons.reload);
    }

    // Process custom toolbar items (w2ui style logic)
    if (Array.isArray(tb_items)) {
      // Get IDs from custom items
      const customIds = tb_items.map(item => item.id).filter(id => id != null);
      
      // Add default buttons if show flag is true and not in custom items (w2ui style)
      if (show.add !== false && !customIds.includes(defaultButtons.add.id)) {
        items.push(defaultButtons.add);
      }
      if (show.edit !== false && !customIds.includes(defaultButtons.edit.id)) {
        items.push(defaultButtons.edit);
      }
      if (show.delete !== false && !customIds.includes(defaultButtons.delete.id)) {
        items.push(defaultButtons.delete);
      }
      if (show.save !== false && !customIds.includes(defaultButtons.save.id)) {
        // Add break before save if there are other action buttons
        if (show.add !== false || show.delete !== false || show.edit !== false) {
          items.push({ type: 'break', id: 'w2ui-break2' });
        }
        items.push(defaultButtons.save);
      }

      // Map and merge custom items with default buttons (w2ui style)
      // If custom item has 'name' property matching a default button, merge them
      const mappedItems = tb_items.map(item => {
        const mappedItem: ToolbarItem = { ...item };
        
        // Map icon names (ui-icon-plus -> plus, etc.)
        if (mappedItem.icon) {
          if (mappedItem.icon === 'ui-icon-plus') mappedItem.icon = 'plus';
          else if (mappedItem.icon === 'ui-icon-pencil') mappedItem.icon = 'pencil';
          else if (mappedItem.icon === 'ui-icon-cross') mappedItem.icon = 'delete';
          else if (mappedItem.icon === 'ui-icon-check') mappedItem.icon = 'check';
          else if (mappedItem.icon === 'ui-icon-reload') mappedItem.icon = 'reload';
        }
        
        // Merge with default button if 'name' property matches (w2ui style)
        const buttonName = (mappedItem as any).name;
        if (buttonName && defaultButtons[buttonName as keyof typeof defaultButtons]) {
          const defaultButton = defaultButtons[buttonName as keyof typeof defaultButtons];
          mappedItem.id = mappedItem.id || defaultButton.id;
          mappedItem.type = mappedItem.type || defaultButton.type;
          if ('text' in defaultButton) {
            mappedItem.text = mappedItem.text || defaultButton.text;
          }
          mappedItem.icon = mappedItem.icon || defaultButton.icon;
          mappedItem.tooltip = mappedItem.tooltip || defaultButton.tooltip;
          // Merge onClick - use custom if provided, otherwise use default
          if (!mappedItem.onClick && defaultButton.onClick) {
            mappedItem.onClick = defaultButton.onClick;
          }
          // Merge disabled state for edit/delete
          if (buttonName === 'edit') {
            mappedItem.disabled = mappedItem.disabled !== undefined ? mappedItem.disabled : !this.hasSingleSelection();
          } else if (buttonName === 'delete') {
            mappedItem.disabled = mappedItem.disabled !== undefined ? mappedItem.disabled : this.selectedRows.size === 0;
          }
        } else {
          // Add onClick handlers based on id if not provided
          if (!mappedItem.onClick) {
            if (mappedItem.id === 'reload') {
              mappedItem.onClick = (event) => this.onRefresh();
            } else if (mappedItem.id === 'add') {
              mappedItem.onClick = (event) => this.onAdd();
            } else if (mappedItem.id === 'edit') {
              mappedItem.onClick = (event) => this.onEdit();
              mappedItem.disabled = mappedItem.disabled !== undefined ? mappedItem.disabled : !this.hasSingleSelection();
            } else if (mappedItem.id === 'delete') {
              mappedItem.onClick = (event) => this.onDelete();
              mappedItem.disabled = mappedItem.disabled !== undefined ? mappedItem.disabled : this.selectedRows.size === 0;
            } else if (mappedItem.id === 'save') {
              mappedItem.onClick = (event) => this.onUpdate();
            }
          }
        }
        
        return mappedItem;
      });

      // Add custom items after default buttons (w2ui style)
      items.push(...mappedItems);
    } else {
      // No custom items - add all default buttons based on show flags
      if (show.add !== false) {
        items.push(defaultButtons.add);
      }

      // Add break before action buttons
      if (items.length > 0 && (show.edit !== false || show.delete !== false)) {
        items.push({ id: 'break-actions', type: 'break' });
      }

      if (show.edit !== false) {
        items.push(defaultButtons.edit);
      }

      if (show.delete !== false) {
        items.push(defaultButtons.delete);
      }

      if (show.save !== false) {
        if (items.length > 0) {
          items.push({ id: 'break-save', type: 'break' });
        }
        items.push(defaultButtons.save);
      }
    }

    return items;
  }

  getDefaultToolbarItems(): ToolbarItem[] {
    const items: ToolbarItem[] = [];
    
    // Add reload button if showRefresh is true
    if (this.showRefresh) {
      items.push({
        id: 'reload',
        type: 'button',
        icon: 'reload',
        tooltip: 'Reload data',
        onClick: (event) => this.onRefresh()
      });
    }

    // Add button
    items.push({
      id: 'add',
      type: 'button',
      text: 'Add New',
      icon: 'plus',
      tooltip: 'Add new record',
      onClick: (event) => this.onAdd()
    });

    // Edit button (disabled if no single selection)
    items.push({
      id: 'edit',
      type: 'button',
      text: 'Edit',
      icon: 'pencil',
      tooltip: 'Edit selected record',
      disabled: !this.hasSingleSelection(),
      onClick: (event) => this.onEdit()
    });

    // Delete button (disabled if no selection)
    items.push({
      id: 'delete',
      type: 'button',
      text: 'Delete',
      icon: 'delete',
      tooltip: 'Delete selected records',
      disabled: this.selectedRows.size === 0,
      onClick: (event) => this.onDelete()
    });

    return items;
  }

  hasSingleSelection(): boolean {
    return this.selectedRows.size === 1;
  }

  onAdd() {
    this.isEditMode = false;
    this.editingRecordId = null;
    this.formData = {};
    this.initializeFormData();
    this.selectedImageFile = null;
    this.imagePreview = null;
    this.showFormPage = true; // Show full page form instead of modal
    this.cdr.markForCheck();
    this.add.emit();
  }
  
  /**
   * Normalize checkbox values to boolean
   */
  private normalizeCheckboxValues() {
    // Get editable columns (use formFields if provided, otherwise use all columns)
    const editableColumns = this.getEditableColumns();
    
    editableColumns.forEach(col => {
      // Normalize checkbox/toggle values to boolean
      if (col.type === 'checkbox' || col.type === 'toggle') {
        const value = this.formData[col.field];
        if (value !== undefined && value !== null) {
          // Convert to boolean: true for 1, "1", true, "true", etc.
          const boolValue = value === true || value === 1 || value === '1' || value === 'true' || value === 'True';
          this.formData[col.field] = boolValue;
        } else {
          // Default to false if undefined or null
          this.formData[col.field] = false;
        }
      }
    });
    
    // Also normalize all formData keys that might be checkboxes (for nested grids)
    Object.keys(this.formData).forEach(key => {
      const value = this.formData[key];
      // If value looks like a boolean/checkbox value but isn't boolean, normalize it
      if (value !== undefined && value !== null && typeof value !== 'boolean') {
        // Check if this field is a checkbox in any formFields
        const isCheckbox = editableColumns.some(col => 
          col.field === key && (col.type === 'checkbox' || col.type === 'toggle')
        );
        if (isCheckbox) {
          const boolValue = value === true || value === 1 || value === '1' || value === 'true' || value === 'True';
          this.formData[key] = boolValue;
        }
      }
    });
  }
  
  /**
   * Initialize form data with empty values for all editable columns
   */
  private initializeFormData() {
    // Get editable columns (use formFields if provided, otherwise use all columns)
    const editableColumns = this.getEditableColumns();
    
    editableColumns.forEach(col => {
      // Set default values based on column type
      switch (col.type) {
        case 'checkbox':
        case 'toggle':
          this.formData[col.field] = false;
          break;
        case 'int':
        case 'float':
        case 'money':
        case 'currency':
        case 'percent':
          this.formData[col.field] = null;
          break;
        case 'enum':
        case 'list':
        case 'select':
        case 'combo':
          this.formData[col.field] = null;
          break;
        default:
          this.formData[col.field] = '';
      }
    });
  }
  
  /**
   * Open form in add mode
   */
  openAddForm() {
    this.isEditMode = false;
    this.editingRecordId = null;
    this.formData = {};
    this.initializeFormData();
    this.selectedImageFile = null;
    this.imagePreview = null;
    this.showFormPage = true; // Show full page form instead of modal
    
    // Load options for all columns with load configuration
    setTimeout(() => {
      this.loadFormFieldOptions();
    }, 0);
    
    this.cdr.markForCheck();
    this.add.emit();
  }

  /**
   * Open form modal in edit mode
   */
  openEditForm(record: TableRow) {
    this.isEditMode = true;
    this.editingRecordId = record[this.recid || 'recid'];
    this.showFormPage = true; // Show full page form instead of modal
    this.isLoading = true;
    this.cdr.markForCheck();
    
    // If formLoadUrl is provided, load form data from API
    if (this.formLoadUrl) {
      // Check if recid is valid
      if (!this.editingRecordId) {
        console.error('Cannot load form: editingRecordId is null or undefined');
        this.isLoading = false;
        this.cdr.markForCheck();
        return;
      }
      
      let requestBody = this.formLoadRequest 
        ? this.formLoadRequest(this.editingRecordId)
        : { recid: this.editingRecordId };
      
      // Ensure requestBody has action property for form endpoints
      if (requestBody && !requestBody.action) {
        requestBody.action = 'get';
      }
      
      // If requestBody has 'action' property, wrap it in 'request' object (for form endpoints)
      if (requestBody && requestBody.action) {
        requestBody = { request: requestBody };
      }
      
      console.log('Form load request:', { url: this.formLoadUrl, body: requestBody, recid: this.editingRecordId });
      
      // Unsubscribe from previous subscription if exists
      if (this.formLoadSubscription) {
        this.formLoadSubscription.unsubscribe();
      }
      
      this.formLoadSubscription = this.http.post(this.formLoadUrl, requestBody).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          
          // Use formDataMapper if provided, otherwise use default mapping
          if (response && !response.error && response.record) {
            const apiRecord = response.record;
            
            if (this.formDataMapper) {
              this.formData = this.formDataMapper(apiRecord);
            } else {
              // Default: use record as-is
              this.formData = { ...apiRecord };
            }
          } else {
            // Fallback to record data if API doesn't return record or has error
            this.formData = { ...record };
          }
          
          // Ensure EmployeeID is set if recid exists (for dynamic field options)
          if (this.formData['recid'] && !this.formData['EmployeeID']) {
            this.formData['EmployeeID'] = this.formData['recid'];
          }
          
          // Normalize checkbox values to boolean
          this.normalizeCheckboxValues();
          
          // Load options for all form fields with load configuration
          setTimeout(() => {
            this.loadFormFieldOptions();
            // Load dynamic field options that depend on formData (e.g., SubscriptionCard)
            this.loadDynamicFieldOptions();
          }, 0);
          
          this.cdr.markForCheck();
          
          // Set image preview if imageField exists
          if (this.imageField && this.formData[this.imageField]) {
            const prependUrl = this.columns.find(col => col.field === this.imageField)?.prependUrl;
            if (prependUrl) {
              this.imagePreview = prependUrl.replace('{0}', this.formData[this.imageField]);
            } else if (this.imagePreviewUrl) {
              this.imagePreview = this.imagePreviewUrl(this.formData[this.imageField]);
            } else {
              this.imagePreview = `http://localhost/images/${this.formData[this.imageField]}`;
            }
          } else {
            this.imagePreview = null;
          }
          
          this.selectedImageFile = null;
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error loading form data:', error);
          
          // Fallback to record data on error
          this.formData = { ...record };
          
          // Normalize checkbox values to boolean
          this.normalizeCheckboxValues();
          
          // Load dynamic field options that depend on formData (e.g., SubscriptionCard)
          this.loadDynamicFieldOptions();
          
          this.cdr.markForCheck();
          
          // Set image preview if imageField exists
          if (this.imageField && record[this.imageField]) {
            const prependUrl = this.columns.find(col => col.field === this.imageField)?.prependUrl;
            if (prependUrl) {
              this.imagePreview = prependUrl.replace('{0}', record[this.imageField]);
            } else if (this.imagePreviewUrl) {
              this.imagePreview = this.imagePreviewUrl(record[this.imageField]);
            } else {
              this.imagePreview = `http://localhost/images/${record[this.imageField]}`;
            }
          } else {
            this.imagePreview = null;
          }
          
          this.selectedImageFile = null;
          this.cdr.markForCheck();
        }
      });
    } else {
      // No formLoadUrl provided, use record data directly
      this.isLoading = false;
      this.formData = { ...record };
      
      // Normalize checkbox values to boolean
      this.normalizeCheckboxValues();
      
      // Load dynamic field options that depend on formData (e.g., SubscriptionCard)
      this.loadDynamicFieldOptions();
      
      this.cdr.markForCheck();
      
      // Set image preview if imageField exists
      if (this.imageField && record[this.imageField]) {
        const prependUrl = this.columns.find(col => col.field === this.imageField)?.prependUrl;
        if (prependUrl) {
          this.imagePreview = prependUrl.replace('{0}', record[this.imageField]);
        } else if (this.imagePreviewUrl) {
          this.imagePreview = this.imagePreviewUrl(record[this.imageField]);
        } else {
          this.imagePreview = `http://localhost/images/${record[this.imageField]}`;
        }
      } else {
        this.imagePreview = null;
      }
      
      this.selectedImageFile = null;
      this.cdr.markForCheck();
    }
  }
  
  /**
   * Close form modal
   */
  closeFormModal() {
    // First set showFormPage to false to prevent form from reopening
    this.showFormPage = false;
    this.showFormModal = false;
    
    // Then clear form data and reset flags
    this.formData = {};
    this.isEditMode = false;
    this.editingRecordId = null;
    this.selectedImageFile = null;
    this.imagePreview = null;
    this.activeFormTab = 0; // Reset to first tab
    
    // Mark for change detection
    this.cdr.markForCheck();
  }
  
  // Track last active tab to prevent unnecessary reloads
  private lastActiveFormTab: number = -1;

  /**
   * Handle form tab change - reload nested grids when switching to a tab with grids
   */
  onFormTabChange(tabIndex: number) {
    // Only reload if tab actually changed
    if (this.lastActiveFormTab === tabIndex) {
      this.cdr.markForCheck();
      return;
    }
    
    this.lastActiveFormTab = tabIndex;
    this.activeFormTab = tabIndex;
    
    // Check if the new tab has grids
    if (this.formTabs && this.formTabs[tabIndex] && this.formTabs[tabIndex].grids && this.formTabs[tabIndex].grids!.length > 0) {
      // Wait for view to update, then reload nested grids only once
      setTimeout(() => {
        if (this.nestedGrids) {
          this.nestedGrids.forEach((grid: DataTableComponent) => {
            // Only reload if grid has dataSource and is not already loading
            if (grid.dataSource && typeof grid.dataSource === 'function' && !grid.isLoading) {
              grid.loadDataSource();
            }
          });
        }
      }, 100); // Slightly longer delay to ensure view is updated
    }
    
    this.cdr.markForCheck();
  }
  
  /**
   * Handle image file selection
   */
  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImageFile = input.files[0];
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(this.selectedImageFile);
    }
  }
  
  /**
   * Remove selected image
   */
  removeImage() {
    this.selectedImageFile = null;
    this.imagePreview = null;
    if (this.imageField && this.formData[this.imageField]) {
      this.formData[this.imageField] = null;
    }
    this.cdr.markForCheck();
  }
  
  /**
   * Get editable columns for form
   */
  getEditableColumns(): TableColumn[] {
    // If custom formFields are provided, use them
    if (this.formFields && this.formFields.length > 0) {
      return this.formFields.filter(col => 
        col.type !== 'picture' && 
        col.field !== 'recid' &&
        // Include ID field only in edit mode
        ((!this.isEditMode && col.showInAdd !== false) || (this.isEditMode && col.showInUpdate !== false) || col.field === this.recid)
      );
    }
    
    // Otherwise, use all columns (default behavior)
    const recidField = this.recid || 'recid';
    return this.columns.filter(col => 
      !col.hidden && 
      col.type !== 'picture' && 
      col.field !== 'recid' &&
      // Include ID field only in edit mode
      (col.field !== recidField || this.isEditMode)
    );
  }
  
  /**
   * Get visible form tabs based on add/edit mode
   */
  getVisibleFormTabs(): FormTab[] {
    if (!this.formTabs || this.formTabs.length === 0) {
      return [];
    }
    
    // In add mode, filter out tabs with showInAdd === false
    if (!this.isEditMode) {
      return this.formTabs.filter(tab => tab.showInAdd !== false);
    }
    
    // In edit mode, show all tabs
    return this.formTabs;
  }
  
  /**
   * Get columns for specific tab
   */
  getColumnsForTab(tabIndex: number): TableColumn[] {
    const allColumns = this.getEditableColumns();
    
    // Get visible tabs first
    const visibleTabs = this.getVisibleFormTabs();
    if (visibleTabs.length > 0 && tabIndex < visibleTabs.length) {
      const tab = visibleTabs[tabIndex];
      // If tab has fields, return columns for those fields
      if (tab.fields && tab.fields.length > 0) {
        return allColumns.filter(col => tab.fields?.includes(col.field));
      }
      // If tab has grids but no fields, return empty array (grids will be rendered separately)
      if (tab.grids && tab.grids.length > 0) {
        return [];
      }
    }
    
    // Fallback: return all columns if no tabs are defined
    return allColumns;
  }
  
  /**
   * Check if tab has grids
   */
  tabHasGrids(tabIndex: number): boolean {
    const visibleTabs = this.getVisibleFormTabs();
    if (visibleTabs.length > 0 && tabIndex < visibleTabs.length) {
      const tab = visibleTabs[tabIndex];
      return !!(tab.grids && tab.grids.length > 0);
    }
    return false;
  }
  
  /**
   * Get grids for specific tab
   */
  getGridsForTab(tabIndex: number): FormTabGrid[] {
    const visibleTabs = this.getVisibleFormTabs();
    if (visibleTabs.length > 0 && tabIndex < visibleTabs.length) {
      const tab = visibleTabs[tabIndex];
      return tab.grids || [];
    }
    return [];
  }
  
  /**
   * Get data source for a grid
   */
  getGridDataSourceForGrid(grid: FormTabGrid): ((params: any) => Observable<GridResponse>) | undefined {
    // First check if grid has its own dataSource
    if (grid.dataSource) {
      return grid.dataSource;
    }
    
    // Then check if getGridDataSource function is provided
    if (this.getGridDataSource) {
      return this.getGridDataSource(grid.id, this.formData);
    }
    
    return undefined;
  }
  
  /**
   * Get columns for a grid
   */
  getGridColumnsForGrid(grid: FormTabGrid): TableColumn[] {
    let columns: TableColumn[] = [];
    
    // First check if grid has its own columns
    if (grid.columns && grid.columns.length > 0) {
      columns = grid.columns;
    } else if (this.getGridColumns) {
      // Then check if getGridColumns function is provided
      columns = this.getGridColumns(grid.id) || [];
    }
    
    return columns;
  }
  
  // Cache for grid dataSource functions to prevent unnecessary reloads
  private gridDataSourceCache = new Map<string, (params: any) => Observable<GridResponse>>();
  private gridDataSourceFormDataCache = new Map<string, any>();

  /**
   * Get grid dataSource with form data injected
   * Memoized to prevent unnecessary reloads when formData hasn't changed
   */
  getGridDataSourceWithFormData(grid: FormTabGrid): ((params: any) => Observable<GridResponse>) | undefined {
    const baseDataSource = this.getGridDataSourceForGrid(grid);
    if (!baseDataSource) {
      return undefined;
    }
    
    // Create cache key based on grid ID
    const cacheKey = grid.id || 'default';
    
    // Check if formData has changed for this grid
    const cachedFormData = this.gridDataSourceFormDataCache.get(cacheKey);
    const formDataKey = JSON.stringify(this.formData);
    const formDataChanged = cachedFormData !== formDataKey;
    
    // If formData hasn't changed and we have a cached function, return it
    if (!formDataChanged && this.gridDataSourceCache.has(cacheKey)) {
      return this.gridDataSourceCache.get(cacheKey);
    }
    
    // Create new wrapper function that injects form data into params
    const wrapperFunction = (params: any) => {
      // Build params with form data
      const enrichedParams = this.buildGridDataSourceParams(grid, params);
      return baseDataSource(enrichedParams);
    };
    
    // Cache the function and formData key
    this.gridDataSourceCache.set(cacheKey, wrapperFunction);
    this.gridDataSourceFormDataCache.set(cacheKey, formDataKey);
    
    return wrapperFunction;
  }
  
  /**
   * Build grid data source params with form data
   */
  buildGridDataSourceParams(grid: FormTabGrid, baseParams: any = {}): any {
    const params: any = {
      ...baseParams,
    };
    
    // If grid has data function, call it with formData to get additional params
    if (grid.data && typeof grid.data === 'function') {
      const additionalData = grid.data(this.formData);
      // Merge additionalData into params, ensuring EmployeeID is included
      Object.assign(params, additionalData);
    } else if (grid.data && typeof grid.data === 'object') {
      // If grid.data is an object, merge it with params
      Object.assign(params, grid.data);
      // Replace dynamic values from formData (e.g., "EmployeeID" string -> actual EmployeeID value)
      Object.keys(params).forEach(key => {
        if (typeof params[key] === 'string' && params[key].startsWith('formData.')) {
          const formField = params[key].replace('formData.', '');
          params[key] = this.formData[formField];
        } else if (typeof params[key] === 'string' && this.formData[params[key]] !== undefined) {
          // If the value is a string that matches a formData key, use the formData value
          params[key] = this.formData[params[key]];
        }
      });
    }
    
    // Ensure EmployeeID is always included if formData has it
    if (this.formData && (this.formData['recid'])) {
      params.EmployeeID = this.formData['EmployeeID'] || this.formData['recid'];
    }
    
    return params;
  }
  
  /**
   * Get formLoadRequest with parent formData for nested grids
   */
  getFormLoadRequestWithParentData(grid: FormTabGrid): ((recid: any, parentFormData?: any) => any) | undefined {
    if (!grid.formLoadRequest) {
      return undefined;
    }
    
    // Wrap the original formLoadRequest to pass parent formData
    return (recid: any, parentFormData?: any) => {
      // Pass parent formData (this.formData) to the nested grid's formLoadRequest
      return grid.formLoadRequest!(recid, this.formData);
    };
  }
  
  /**
   * Get onSave callback with http client for nested grids
   */
  getOnSaveWithHttp(grid: FormTabGrid): ((data: any, isEdit: boolean, http?: any) => Observable<any>) | undefined {
    console.log('getOnSaveWithHttp called:', { gridId: grid.id, hasOnSave: !!grid.onSave, grid });
    
    if (!grid.onSave) {
      console.warn('getOnSaveWithHttp: grid.onSave is undefined for grid:', grid.id);
      return undefined;
    }
    
    // Wrap the original onSave to pass http client and add EmployeeID from parent formData
    return (data: any, isEdit: boolean, http?: any) => {
      console.log('Wrapped onSave called:', { data, isEdit, hasHttp: !!this.http, gridId: grid.id });
      
      // For EmployeeCardGrid, add EmployeeID from parent formData if not present
      if (grid.id === 'EmployeeCardGrid' && this.formData) {
        const employeeId = this.formData['EmployeeID'] || this.formData['recid'];
        if (employeeId && !data.EmployeeID) {
          data.EmployeeID = employeeId;
          console.log('Added EmployeeID to submitData:', employeeId);
        }
      }
      
      // Pass http client to the nested grid's onSave
      return grid.onSave!(data, isEdit, this.http);
    };
  }
  
  /**
   * Handle form submit
   */
  onFormSubmit(formValues: any) {
    console.log('onFormSubmit called:', { formValues, isEditMode: this.isEditMode, editingRecordId: this.editingRecordId, recid: this.recid, hasOnSave: !!this.onSave, id: this.id });
    
    // Prepare data for API
    const submitData = { ...formValues };
    
    // If editing, include the ID
    // Store recid value before it gets cleared
    const currentRecid = this.editingRecordId;
    if (this.isEditMode && currentRecid && this.recid) {
      submitData[this.recid] = currentRecid;
      // Also ensure recid is in submitData for API
      submitData.recid = currentRecid;
    }
    
    // For nested grids (EmployeeCardGrid), add EmployeeID from parent formData if not present
    // This ensures EmployeeID is always included in both add and edit modes
    if (this.id === 'EmployeeCardGrid' && this.formData) {
      const employeeId = this.formData['EmployeeID'] || this.formData['recid'];
      if (employeeId && !submitData.EmployeeID) {
        submitData.EmployeeID = employeeId;
        console.log('Added EmployeeID to submitData from parent formData:', employeeId);
      }
    }
    
    // Show loading state
    this.isLoading = true;
    this.cdr.markForCheck();
    
    // If image file is selected, upload it first
    if (this.selectedImageFile) {
      // Unsubscribe from previous subscription if exists
      if (this.imageUploadSubscription) {
        this.imageUploadSubscription.unsubscribe();
      }
      
      this.imageUploadSubscription = this.uploadImageFile(this.selectedImageFile).subscribe({
        next: (imageResponse) => {
          // Add image field to submit data
          if (this.imageField && imageResponse && imageResponse.filename) {
            submitData[this.imageField] = imageResponse.filename;
          }
          
          // Save form data
          this.saveFormData(submitData);
        },
        error: (error) => {
          this.isLoading = false;
          this.cdr.markForCheck();
          console.error('Error uploading image:', error);
          // Still try to save form data without image
          this.saveFormData(submitData);
        }
      });
    } else {
      // Save form data without image upload
      this.saveFormData(submitData);
    }
  }
  
  /**
   * Upload image file
   */
  private uploadImageFile(file: File): Observable<any> {
    if (!this.imageUploadUrl) {
      // If no imageUploadUrl provided, return null
      return of(null);
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(this.imageUploadUrl, formData).pipe(
      catchError(error => {
        console.error('Error uploading image:', error);
        return of(null);
      })
    );
  }
  
  /**
   * Save form data
   */
  private saveFormData(submitData: any) {
    console.log('saveFormData called:', { hasOnSave: !!this.onSave, submitData, isEditMode: this.isEditMode });
    
    if (this.onSave) {
      // Unsubscribe from previous subscription if exists
      if (this.formSaveSubscription) {
        this.formSaveSubscription.unsubscribe();
      }
      
      // Use custom save callback if provided
      // Store isEditMode before save (since closeFormModal resets it)
      const wasEditMode = this.isEditMode;
      const savedRecordId = this.editingRecordId;
      
      try {
        // Pass http client to onSave callback if it accepts 3 parameters
        const saveObservable = this.onSave(submitData, this.isEditMode, this.http);
        
        if (!saveObservable) {
          console.error('onSave callback did not return an Observable');
          this.isLoading = false;
          this.cdr.markForCheck();
          return;
        }
        
        console.log('Calling onSave with:', { submitData, isEditMode: this.isEditMode, hasHttp: !!this.http });
        
        this.formSaveSubscription = saveObservable.subscribe({
        next: (response) => {
          this.isLoading = false;
          this.cdr.markForCheck();
          
          // Check if save was successful
          // Response should have error: false for success, or error: true for failure
          const isSuccess = response && (response.error === false || response.error === undefined || response.status === 'success');
          
          if (isSuccess) {
            // Close form FIRST to prevent it from reopening
            this.closeFormModal();
            
            // Reload data
            if (this.dataSource) {
              this.loadDataSource();
            }
            
            // Emit event for parent component to handle AFTER closing form
            // Use setTimeout to ensure form is closed before emitting
            setTimeout(() => {
              if (wasEditMode) {
                this.edit.emit(submitData as TableRow);
              } else {
                this.add.emit();
              }
            }, 0);
          } else {
            // Keep form open on error so user can fix and retry
            // Error message is already shown by onSave callback
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.cdr.markForCheck();
          console.error('Error saving data:', error);
          console.error('Error details:', { 
            message: error?.message, 
            error: error?.error, 
            status: error?.status,
            url: error?.url 
          });
          // Keep form open on error so user can fix and retry
        }
      });
      } catch (error) {
        console.error('Error calling onSave callback:', error);
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    } else {
      // No save callback provided
      console.warn('No onSave callback provided. Cannot save data.');
      this.isLoading = false;
      this.cdr.markForCheck();
      
      // Close form
      this.closeFormModal();
      
      // Emit event for parent component to handle
      if (this.isEditMode) {
        this.edit.emit(submitData as TableRow);
      } else {
        this.add.emit();
      }
    }
  }

  onEdit() {
    if (this.hasSingleSelection()) {
      const selectedId = Array.from(this.selectedRows)[0];
      // Use filteredData or internalData depending on dataSource
      const dataSource = this.dataSource ? this.filteredData : this.data;
      const selectedRow = dataSource.find(row => this.getRowId(row) === selectedId);
      if (selectedRow) {
        this.openEditForm(selectedRow);
        this.edit.emit(selectedRow);
      }
    }
  }

  onUpdate() {
    this.update.emit();
  }

  toggleToolbarMenu(menuId: string, event: MouseEvent) {
    event.stopPropagation();
    
    // Remove previous click handler if exists
    if (this.menuClickHandler) {
      document.removeEventListener('click', this.menuClickHandler);
      this.menuClickHandler = null;
    }
    
    if (this.openMenuId === menuId) {
      // Close current menu
      this.openMenuId = null;
    } else {
      // Open new menu (closes previous one if open)
      this.openMenuId = menuId;
      // Close menu when clicking outside
      setTimeout(() => {
        this.menuClickHandler = (e: MouseEvent) => {
          if (!(e.target as HTMLElement).closest('.ui-toolbar-menu-wrapper')) {
            this.openMenuId = null;
            this.cdr.detectChanges();
            if (this.menuClickHandler) {
              document.removeEventListener('click', this.menuClickHandler);
              this.menuClickHandler = null;
            }
          }
        };
        document.addEventListener('click', this.menuClickHandler);
      }, 0);
    }
    this.cdr.detectChanges();
  }

  onToolbarMenuItemClick(menuItem: ToolbarItem, subItem: ToolbarMenuItem, event: MouseEvent) {
    event.stopPropagation();
    
    // Don't process if disabled
    if (subItem.disabled) {
      return;
    }
    
    // Close menu
    this.openMenuId = null;
    
    // Clean up click handler
    if (this.menuClickHandler) {
      document.removeEventListener('click', this.menuClickHandler);
      this.menuClickHandler = null;
    }
    
    this.cdr.detectChanges();
    
    // Call onClick handlers
    if (subItem.onClick) {
      subItem.onClick(event, subItem);
    } else if (menuItem.onClick) {
      menuItem.onClick(event, menuItem);
    }
  }

  onToolbarItemClick(item: ToolbarItem, event: MouseEvent) {
    if (item.disabled) return;
    
    // Call item's onClick if provided
    if (item.onClick) {
      item.onClick(event, item);
    }
    
    // Emit toolbarClick event
    this.toolbarClick.emit({ item, event });
  }

  getToolbarItemClasses(item: ToolbarItem): string {
    const classes = ['ui-toolbar-item'];
    
    if (item.type) classes.push(`ui-toolbar-item-${item.type}`);
    if (item.disabled) classes.push('ui-toolbar-item-disabled');
    if (item.hidden) classes.push('ui-toolbar-item-hidden');
    if (item.checked) classes.push('ui-toolbar-item-checked');
    
    return classes.join(' ');
  }

  shouldShowToolbar(): boolean {
    return this.toolbar !== undefined || this.searchable || this.advancedFilter || this.selectable || this.showRefresh;
  }

  /**
   * Get translated column label
   */
  getColumnLabel(column: TableColumn): string {
    if (!column) return '';
    
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

  // Footer methods (w2ui style)
  get footerLeftMessage(): string {
    if (this.selectedRows.size === 0) {
      return '';
    }
    
    if (this.selectedRows.size === 1) {
      const selectedId = Array.from(this.selectedRows)[0];
      const dataSource = this.dataSource ? this.filteredData : this.data;
      const selectedRow = dataSource.find(row => this.getRowId(row) === selectedId);
      if (selectedRow) {
        const rowId = this.getRowId(selectedRow);
        return `${this.translate.instant('table.recordId')}: ${rowId}`;
      }
    } else {
      return `${this.selectedRows.size} ${this.translate.instant('table.selected')}`;
    }
    
    return '';
  }

  get footerCenterMessage(): string {
    // Use internalTotal if dataSource is used, otherwise use total input or filtered data length
    let totalRecords: number;
    if (this.dataSource) {
      totalRecords = this.internalTotal > 0 ? this.internalTotal : this.internalData.length;
    } else {
      const allFiltered = this.allFilteredData;
      totalRecords = this.total > 0 ? this.total : allFiltered.length;
    }
    
    if (this.pagination && totalRecords > 0) {
      // Always use currentLimit as pageSize for pagination
      const effectivePageSize = this.currentLimit > 0 ? this.currentLimit : this.pageSize;
      const start = (this.currentPage - 1) * effectivePageSize + 1;
      const end = Math.min(this.currentPage * effectivePageSize, totalRecords);
      return `${start}-${end} ${this.translate.instant('table.of')} ${totalRecords}`;
    }
    
    return `${totalRecords} ${this.translate.instant('table.records')}`;
  }


  // ============================================================================
  // Public Methods (w2ui compatible)
  // ============================================================================

  /**
   * Add record(s) to the table (w2ui compatible method - renamed to avoid conflict with @Output add event)
   * @param record Record or array of records to add
   * @param first If true, add at the beginning, otherwise at the end
   * @returns Number of records added
   */
  addRecord(record: TableRow | TableRow[], first?: boolean): number {
    const records = Array.isArray(record) ? record : [record];
    const recidField = this.recid || 'id';
    let added = 0;

    for (const rec of records) {
      // Use recid field if specified, otherwise use id
      if (!rec['recid'] && rec[recidField] != null) {
        rec['recid'] = rec[recidField];
      }
      if (!rec['recid'] && !rec['id']) {
        console.warn('Warning: Record without recid/id field. Adding anyway.');
      }
    }

    // In Angular, we need to create a new array reference for change detection
    if (first) {
      this.data = [...records, ...this.data];
    } else {
      this.data = [...this.data, ...records];
    }
    added = records.length;

    return added;
  }

  /**
   * Remove record(s) by recid (w2ui compatible)
   * @param recids Record ID(s) to remove
   * @returns Number of records removed
   */
  remove(...recids: any[]): number {
    const recidField = this.recid || 'id';
    let removed = 0;
    const idsToRemove = new Set(recids.flat());

    this.data = this.data.filter(record => {
      const id = record['recid'] || record[recidField] || record['id'];
      if (idsToRemove.has(id)) {
        removed++;
        return false;
      }
      return true;
    });

    // Also remove from selected rows
    idsToRemove.forEach(id => {
      this.selectedRows.delete(id);
    });

    return removed;
  }

  /**
   * Get record by recid (w2ui compatible)
   * @param recid Record ID
   * @returns Record if found, null otherwise
   */
  get(recid: any): TableRow | null {
    const recidField = this.recid || 'id';
    
    if (Array.isArray(recid)) {
      // Return array of records
      return recid.map(id => this.get(id)).filter(r => r !== null) as TableRow[];
    }

    return this.data.find(record => {
      const id = record['recid'] || record[recidField] || record['id'];
      return id === recid;
    }) || null;
  }

  /**
   * Find records matching criteria (w2ui compatible)
   * @param criteria Object with field:value pairs to match
   * @param returnIndex If true, return indexes instead of recids
   * @returns Array of recids or indexes
   */
  find(criteria: { [field: string]: any }, returnIndex?: boolean): any[] {
    const results: any[] = [];
    const recidField = this.recid || 'id';

    for (let i = 0; i < this.data.length; i++) {
      const record = this.data[i];
      let match = true;

      for (const field in criteria) {
        let value = this.parseField(record, field);
        if (criteria[field] !== value) {
          match = false;
          break;
        }
      }

      if (match) {
        if (returnIndex) {
          results.push(i);
        } else {
          const id = record['recid'] || record[recidField] || record['id'];
          results.push(id);
        }
      }
    }

    return results;
  }

  /**
   * Update record(s) (w2ui compatible)
   * @param recid Record ID or null to update all records
   * @param updates Object with fields to update
   * @returns true if successful
   */
  set(recid: any, updates: Partial<TableRow>): boolean {
    if (recid == null) {
      // Update all records
      this.data = this.data.map(record => ({ ...record, ...updates }));
      return true;
    }

    const recidField = this.recid || 'id';
    const index = this.data.findIndex(record => {
      const id = record['recid'] || record[recidField] || record['id'];
      return id === recid;
    });

    if (index === -1) {
      return false;
    }

    this.data = [
      ...this.data.slice(0, index),
      { ...this.data[index], ...updates },
      ...this.data.slice(index + 1)
    ];

    return true;
  }

  /**
   * Parse nested field (e.g., 'user.name') (w2ui compatible)
   * @param record Record object
   * @param field Field name (can be nested)
   * @returns Field value
   */
  parseField(record: TableRow, field: string): any {
    if (!this.nestedFields || field.indexOf('.') === -1) {
      return record[field];
    }

    const parts = field.split('.');
    let value: any = record;
    for (const part of parts) {
      if (value == null) return null;
      value = value[part];
    }
    return value;
  }

  /**
   * Add column(s) (w2ui compatible)
   * @param before Column field name or index to insert before, or columns array
   * @param columns Column(s) to add (if before is provided)
   * @returns Number of columns added
   */
  addColumn(before: string | number | TableColumn | TableColumn[], columns?: TableColumn | TableColumn[]): number {
    // Initialize internal columns if needed
    if (this.internalColumns.length === 0) {
      this.internalColumns = this.columns.map(col => ({ ...col }));
    }
    
    let insertIndex: number;
    let colsToAdd: TableColumn[];

    if (columns === undefined) {
      // Single argument: columns to add at the end
      colsToAdd = Array.isArray(before) ? before : [before as TableColumn];
      insertIndex = this.internalColumns.length;
    } else {
      // Two arguments: before position and columns to add
      if (typeof before === 'string') {
        insertIndex = this.internalColumns.findIndex(col => col.field === before);
        if (insertIndex === -1) insertIndex = this.internalColumns.length;
      } else if (typeof before === 'number') {
        insertIndex = before;
      } else {
        insertIndex = this.internalColumns.length;
      }
      colsToAdd = Array.isArray(columns) ? columns : [columns];
    }

    // Insert columns into internal array
    this.internalColumns = [
      ...this.internalColumns.slice(0, insertIndex),
      ...colsToAdd.map(col => ({ ...col })),
      ...this.internalColumns.slice(insertIndex)
    ];

    // Also update input columns (for parent component)
    const originalInsertIndex = typeof before === 'string' 
      ? this.columns.findIndex(col => col.field === before)
      : (typeof before === 'number' ? before : this.columns.length);
    if (originalInsertIndex === -1) {
      this.columns = [...this.columns, ...colsToAdd.map(col => ({ ...col }))];
    } else {
      this.columns = [
        ...this.columns.slice(0, originalInsertIndex),
        ...colsToAdd.map(col => ({ ...col })),
        ...this.columns.slice(originalInsertIndex)
      ];
    }

    this.cdr.markForCheck();
    return colsToAdd.length;
  }

  /**
   * Remove column(s) by field name (w2ui compatible)
   * @param fields Column field name(s) to remove
   * @returns Number of columns removed
   */
  removeColumn(...fields: string[]): number {
    // Initialize internal columns if needed
    if (this.internalColumns.length === 0) {
      this.internalColumns = this.columns.map(col => ({ ...col }));
    }
    
    let removed = 0;
    const fieldsToRemove = new Set(fields);

    this.internalColumns = this.internalColumns.filter(col => {
      if (fieldsToRemove.has(col.field)) {
        removed++;
        return false;
      }
      return true;
    });

    this.columns = this.columns.filter(col => {
      return !fieldsToRemove.has(col.field);
    });

    this.cdr.markForCheck();
    return removed;
  }

  /**
   * Get column by field name (w2ui compatible)
   * @param field Column field name (optional - if not provided, returns all field names)
   * @param returnIndex If true, return column index instead of column object
   * @returns Column object, index, array of field names, or null
   */
  getColumn(field?: string, returnIndex?: boolean): TableColumn | number | string[] | null {
    const cols = this.displayColumns;
    if (field === undefined) {
      // Return all field names
      return cols.map(col => col.field);
    }

    const index = cols.findIndex(col => col.field === field);
    if (index === -1) return null;

    return returnIndex ? index : cols[index];
  }

  /**
   * Update column(s) (w2ui compatible)
   * @param fields Column field name(s) to update
   * @param updates Properties to update (can be functions for dynamic values)
   * @returns Number of columns updated
   */
  updateColumn(fields: string | string[], updates: Partial<TableColumn> | ((col: TableColumn) => Partial<TableColumn>)): number {
    // Initialize internal columns if needed
    if (this.internalColumns.length === 0) {
      this.internalColumns = this.columns.map(col => ({ ...col })); 
    }
    
    const fieldArray = Array.isArray(fields) ? fields : [fields];
    let updated = 0;

    this.internalColumns = this.internalColumns.map(col => {
      if (fieldArray.includes(col.field)) {
        updated++;
        if (typeof updates === 'function') {
          const newProps = updates(col);
          return { ...col, ...newProps };
        }
        return { ...col, ...updates };
      }
      return col;
    });

    this.columns = this.columns.map(col => {
      if (fieldArray.includes(col.field)) {
        if (typeof updates === 'function') {
          const newProps = updates(col);
          return { ...col, ...newProps };
        }
        return { ...col, ...updates };
      }
      return col;
    });

    this.cdr.markForCheck();
    return updated;
  }

  /**
   * Toggle column visibility (w2ui compatible)
   * @param fields Column field name(s)
   * @returns Number of columns toggled
   */
  toggleColumn(...fields: string[]): number {
    return this.updateColumn(fields, (col: TableColumn) => ({ hidden: !col.hidden }));
  }

  /**
   * Show column(s) (w2ui compatible)
   * @param fields Column field name(s)
   * @returns Number of columns shown
   */
  showColumn(...fields: string[]): number {
    return this.updateColumn(fields, { hidden: false });
  }

  /**
   * Hide column(s) (w2ui compatible)
   * @param fields Column field name(s)
   * @returns Number of columns hidden
   */
  hideColumn(...fields: string[]): number {
    return this.updateColumn(fields, { hidden: true });
  }

  /**
   * Get first record (w2ui compatible)
   * @param offset Offset from first record
   * @returns First record or null
   */
  getFirst(offset?: number): TableRow | null {
    const idx = offset || 0;
    if (idx >= this.filteredData.length) return null;
    return this.filteredData[idx] || null;
  }
  
  /**
   * Open picture overlay with the given picture ID
   */
  openPictureOverlay(pictureId: string, column?: TableColumn) {
    if (!pictureId) {
      return;
    }
    
    // Find column if not provided
    let pictureColumn = column;
    if (!pictureColumn) {
      pictureColumn = this.displayColumns.find(col => col.type === 'picture' && col.field);
    }
    
    // Construct picture URL using buildPictureUrl method
    const pictureUrl = pictureColumn ? this.buildPictureUrl(pictureId, pictureColumn) : this.buildPictureUrl(pictureId, {} as TableColumn);
    
    this.pictureOverlayUrl = pictureUrl;
    this.showPictureOverlay = true;
    this.cdr.markForCheck();
  }
  
  /**
   * Close picture overlay
   */
  closePictureOverlay() {
    this.showPictureOverlay = false;
    this.pictureOverlayUrl = '';
    this.cdr.markForCheck();
  }

  // Join Options Methods

  toggleOptionsMenu(event: MouseEvent) {
    event.stopPropagation();
    this.showOptionsMenu = !this.showOptionsMenu;
    this.cdr.markForCheck();
  }

  openJoinOptionsPanel() {
    this.showOptionsMenu = false;
    this.showJoinOptionsPanel = true;
    this.showFilterPanel = false; // Close filter panel when join options opens
    this.cdr.markForCheck();
  }

  closeJoinOptionsPanel() {
    this.showJoinOptionsPanel = false;
    this.restoreBodyScroll();
    this.cdr.markForCheck();
  }

  toggleShowDeleted() {
    this.showDeleted = !this.showDeleted;
    this.showOptionsMenu = false; // Close options menu
    
    // Save to localStorage if grid has ID
    if (this.id) {
      try {
        const storageKey = `grid_${this.id}_showDeleted`;
        localStorage.setItem(storageKey, JSON.stringify(this.showDeleted));
      } catch (error) {
        console.error('Error saving showDeleted to localStorage:', error);
      }
    }
    
    // Reload data with deleted filter
    if (this.dataSource) {
      this.loadDataSource();
    }
    
    this.cdr.markForCheck();
  }

  private preventBodyScroll() {
    document.body.style.overflow = 'hidden';
  }

  private restoreBodyScroll() {
    document.body.style.overflow = '';
  }

  isJoinSelected(key: string): boolean {
    const option = this.joinOptions.find(opt => opt.key === key);
    if (!option) return false;
    
    // Check if option has a parent - if so, check under parent
    if (option.parent) {
      const parent = this.selectedJoins[option.parent];
      if (parent && typeof parent === 'object' && (parent as { [key: string]: boolean })[key] === true) {
        return true;
      }
      return false;
    }
    
    // Check nested joins (for backward compatibility)
    if (option.nested && option.parent) {
      const parent = this.selectedJoins[option.parent];
      if (parent && typeof parent === 'object' && (parent as { [key: string]: boolean })[key] === true) {
        return true;
      }
    } else {
      // Check direct joins - can be true or object (if it has nested children)
      const joinValue = this.selectedJoins[key];
      if (joinValue === true || (typeof joinValue === 'object' && Object.keys(joinValue).length > 0)) {
        return true;
      }
    }
    return false;
  }

  toggleJoinOption(key: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const option = this.joinOptions.find(opt => opt.key === key);
    
    if (!option) return;
    
    // Handle options with parent property (regardless of nested flag)
    if (option.parent) {
      if (!this.selectedJoins[option.parent]) {
        this.selectedJoins[option.parent] = {};
      }
      
      // If parent was set as boolean, convert it to object
      if (this.selectedJoins[option.parent] === true) {
        this.selectedJoins[option.parent] = {};
      }
      
      if (typeof this.selectedJoins[option.parent] === 'object') {
        (this.selectedJoins[option.parent] as { [key: string]: boolean })[key] = checked;
        
        // If unchecking and no nested joins remain, remove parent
        if (!checked) {
          const parentObj = this.selectedJoins[option.parent] as { [key: string]: boolean };
          const hasOtherNested = Object.keys(parentObj).some(k => k !== key && parentObj[k] === true);
          if (!hasOtherNested) {
            delete this.selectedJoins[option.parent];
          }
        }
      }
    }
    // Handle nested joins (for backward compatibility)
    else if (option.nested && option.parent) {
      // Check if parent is currently a direct join (true)
      // If so, convert it to an object to support nested joins
      if (this.selectedJoins[option.parent] === true) {
        this.selectedJoins[option.parent] = {};
      }
      
      if (!this.selectedJoins[option.parent]) {
        this.selectedJoins[option.parent] = {};
      }
      
      if (typeof this.selectedJoins[option.parent] === 'object') {
        (this.selectedJoins[option.parent] as { [key: string]: boolean })[key] = checked;
        
        // If unchecking nested join and no nested joins remain, remove parent
        if (!checked) {
          const parentObj = this.selectedJoins[option.parent] as { [key: string]: boolean };
          const hasOtherNested = Object.keys(parentObj).some(k => k !== key && parentObj[k] === true);
          if (!hasOtherNested) {
            delete this.selectedJoins[option.parent];
          }
        }
      }
    } else {
      // Direct join
      if (checked) {
        // Check if this join has nested children that are already selected
        const nestedChildren = this.joinOptions.filter(opt => 
          opt.nested && opt.parent === key
        );
        const selectedNested: { [key: string]: boolean } = {};
        let hasSelectedNested = false;
        
        nestedChildren.forEach(opt => {
          if (opt.parent) {
            const parent = this.selectedJoins[opt.parent];
            if (parent && typeof parent === 'object' && (parent as { [key: string]: boolean })[opt.key] === true) {
              selectedNested[opt.key] = true;
              hasSelectedNested = true;
            }
          }
        });
        
        if (hasSelectedNested) {
          // If nested children are selected, convert to object and include them
          // Also remove nested children from their current parent structure
          nestedChildren.forEach(opt => {
            if (opt.parent && this.selectedJoins[opt.parent] && typeof this.selectedJoins[opt.parent] === 'object') {
              delete (this.selectedJoins[opt.parent] as { [key: string]: boolean })[opt.key];
              const parentObj = this.selectedJoins[opt.parent] as { [key: string]: boolean };
              if (Object.keys(parentObj).length === 0) {
                delete this.selectedJoins[opt.parent];
              }
            }
          });
          this.selectedJoins[key] = selectedNested;
        } else {
          // No nested children selected, set as direct join
          this.selectedJoins[key] = true;
        }
      } else {
        // If unchecking parent, also remove nested joins
        if (typeof this.selectedJoins[key] === 'object') {
          // Nested joins are already in the object, just remove the parent
          delete this.selectedJoins[key];
        } else {
          // Direct join, just remove it
          delete this.selectedJoins[key];
        }
      }
    }
    
    // Save join options to localStorage if grid has ID
    if (this.id) {
      this.saveJoinOptionsToStorage();
    }
    
    // Update column visibility based on join selection
    this.updateColumnVisibilityForJoins();
    
    this.cdr.markForCheck();
  }

  applyJoinOptions() {
    // Clean up selectedJoins before applying
    this.cleanupSelectedJoins();
    
    // Update column visibility based on join selection
    this.updateColumnVisibilityForJoins();
    
    // Save join options to localStorage if grid has ID
    if (this.id) {
      this.saveJoinOptionsToStorage();
    }
    
    // Reload data with new join options
    if (this.dataSource) {
      this.loadDataSource();
    }
    this.closeJoinOptionsPanel();
  }

  /**
   * Save selected join options to localStorage
   */
  private saveJoinOptionsToStorage(): void {
    if (!this.id) return;
    
    try {
      const storageKey = `grid_${this.id}_joins`;
      localStorage.setItem(storageKey, JSON.stringify(this.selectedJoins));
    } catch (error) {
      console.error('Error saving join options to localStorage:', error);
    }
  }

  /**
   * Load selected join options from localStorage
   * If no saved options exist, load default join options (where default: true)
   */
  private loadJoinOptionsFromStorage(): void {
    if (!this.id) return;
    
    try {
      const storageKey = `grid_${this.id}_joins`;
      const saved = localStorage.getItem(storageKey);
      
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          this.selectedJoins = parsed;
          // Clean up: remove top-level entries for keys that have a parent and move them under parent
          this.cleanupSelectedJoins();
          
          // Ensure all default options with parent are present
          // If a default option with parent is missing, add it
          if (this.joinOptions) {
            for (const option of this.joinOptions) {
              if (option.default === true && option.parent) {
                // Check if parent exists
                const parent = this.selectedJoins[option.parent];
                if (!parent || typeof parent !== 'object') {
                  // Parent doesn't exist or is not an object, create it
                  if (!this.selectedJoins[option.parent]) {
                    this.selectedJoins[option.parent] = {};
                  }
                  if (this.selectedJoins[option.parent] === true) {
                    this.selectedJoins[option.parent] = {};
                  }
                }
                // Check if the key exists under parent
                if (typeof this.selectedJoins[option.parent] === 'object') {
                  const parentObj = this.selectedJoins[option.parent] as { [key: string]: boolean };
                  if (!parentObj[option.key]) {
                    parentObj[option.key] = true;
                  }
                }
              }
            }
          }
          
          return; // User has custom settings, use them
        }
      }
      
      // No saved options found, load default join options
      this.loadDefaultJoinOptions();
    } catch (error) {
      console.error('Error loading join options from localStorage:', error);
      // On error, try to load defaults
      this.loadDefaultJoinOptions();
    }
  }

  /**
   * Clean up selectedJoins by removing top-level entries for keys that have a parent
   * This ensures that options with a parent property only exist under their parent
   * If a key with a parent exists at top level, move it under its parent
   */
  private cleanupSelectedJoins(): void {
    if (!this.joinOptions) return;
    
    // Find all keys that have a parent and create a map
    const keysWithParent = new Map<string, string>(); // key -> parent
    for (const option of this.joinOptions) {
      if (option.parent) {
        keysWithParent.set(option.key, option.parent);
      }
    }
    
    // Process each key that has a parent
    for (const [key, parent] of keysWithParent.entries()) {
      if (this.selectedJoins[key] === true) {
        // Key exists at top level, move it under parent
        // Remove from top level
        delete this.selectedJoins[key];
        
        // Ensure parent exists as an object
        if (!this.selectedJoins[parent]) {
          this.selectedJoins[parent] = {};
        }
        
        // If parent was set as boolean, convert it to object
        if (this.selectedJoins[parent] === true) {
          this.selectedJoins[parent] = {};
        }
        
        // Add key under parent
        if (typeof this.selectedJoins[parent] === 'object') {
          (this.selectedJoins[parent] as { [key: string]: boolean })[key] = true;
        }
      }
    }
  }

  /**
   * Load default join options (where default: true)
   */
  private loadDefaultJoinOptions(): void {
    if (!this.joinOptions || this.joinOptions.length === 0) return;
    
    const defaultJoins: { [key: string]: boolean | { [key: string]: boolean } } = {};
    
    // First pass: handle options with parent property (they need parent to be an object)
    for (const option of this.joinOptions) {
      if (option.default === true && option.parent) {
        // Option with parent - need to set parent as object first
        if (!defaultJoins[option.parent]) {
          defaultJoins[option.parent] = {};
        }
        // If parent was set as boolean, convert it to object
        if (defaultJoins[option.parent] === true) {
          defaultJoins[option.parent] = {};
        }
        if (typeof defaultJoins[option.parent] === 'object') {
          (defaultJoins[option.parent] as { [key: string]: boolean })[option.key] = true;
        }
      }
    }
    
    // Second pass: handle top-level options (without parent)
    for (const option of this.joinOptions) {
      if (option.default === true && !option.parent) {
        // Top-level option - only set if not already set as object (by nested children)
        if (!defaultJoins[option.key] || defaultJoins[option.key] === true) {
          // If it's already an object (from nested children), keep it as object
          // Otherwise set it to true
          if (typeof defaultJoins[option.key] !== 'object') {
            defaultJoins[option.key] = true;
          }
        }
      }
    }
    
    // Only set if we have default joins
    if (Object.keys(defaultJoins).length > 0) {
      this.selectedJoins = defaultJoins;
      // Clean up to ensure consistency
      this.cleanupSelectedJoins();
    }
  }

  /**
   * Load showDeleted state from localStorage
   */
  private loadShowDeletedFromStorage(): void {
    if (!this.id) return;
    
    try {
      const storageKey = `grid_${this.id}_showDeleted`;
      const saved = localStorage.getItem(storageKey);
      
      if (saved) {
        this.showDeleted = JSON.parse(saved) === true;
      }
    } catch (error) {
      console.error('Error loading showDeleted from localStorage:', error);
    }
  }

  /**
   * Update column visibility based on selected joins
   * Columns with joinTable property will be shown/hidden based on join selection
   */
  private updateColumnVisibilityForJoins() {
    // Get all active join keys (including nested ones)
    const activeJoinKeys = new Set<string>();
    
    // Add direct joins
    for (const [key, value] of Object.entries(this.selectedJoins)) {
      if (value === true) {
        activeJoinKeys.add(key);
      } else if (typeof value === 'object') {
        // Check if this key is just an intermediate container (parent for nested joins)
        // If there's no joinOption with this key, it's just an intermediate container
        const isIntermediateContainer = !this.joinOptions.find(opt => opt.key === key);
        
        // Add parent join (but not intermediate containers like EmployeeDepartments, EmployeeAccessGroups)
        if (!isIntermediateContainer) {
          activeJoinKeys.add(key);
        }
        // Add nested joins
        for (const nestedKey of Object.keys(value)) {
          if ((value as { [key: string]: boolean })[nestedKey] === true) {
            activeJoinKeys.add(nestedKey);
          }
        }
      }
    }
    
    // Helper function to check if a join is active (handles nested joins)
    const isJoinActive = (joinTable: string): boolean => {
      // Check direct join
      if (activeJoinKeys.has(joinTable)) {
        return true;
      }
      
      // Check if this joinTable has a parent property
      const optionWithParent = this.joinOptions.find(opt => opt.key === joinTable && opt.parent);
      if (optionWithParent && optionWithParent.parent) {
        const parent = this.selectedJoins[optionWithParent.parent];
        if (parent && typeof parent === 'object' && (parent as { [key: string]: boolean })[joinTable] === true) {
          return true;
        }
        return false;
      }
      
      // Check nested joins - find if this joinTable is nested under any parent (for backward compatibility)
      const nestedOption = this.joinOptions.find(opt => opt.key === joinTable && opt.nested && opt.parent);
      if (nestedOption && nestedOption.parent) {
        const parent = this.selectedJoins[nestedOption.parent];
        if (parent && typeof parent === 'object' && (parent as { [key: string]: boolean })[joinTable] === true) {
          return true;
        }
      }
      
      return false;
    };
    
    // Update column visibility
    this.internalColumns.forEach(col => {
      if (col.joinTable) {
        const joinTables = Array.isArray(col.joinTable) ? col.joinTable : [col.joinTable];
        // Show column if any of its join tables are active
        const shouldShow = joinTables.some(joinTable => isJoinActive(joinTable));
        
        // Update visibility (hidden should be opposite of shouldShow)
        col.hidden = !shouldShow;
      }
    });
    
    // Also update input columns to keep them in sync
    this.columns.forEach(col => {
      if (col.joinTable) {
        const joinTables = Array.isArray(col.joinTable) ? col.joinTable : [col.joinTable];
        const shouldShow = joinTables.some(joinTable => isJoinActive(joinTable));
        
        col.hidden = !shouldShow;
      }
    });
  }


  getJoinJsonString(): string {
    // Build join object in the correct format
    const joinObject: any = {};
    
    for (const [key, value] of Object.entries(this.selectedJoins)) {
      if (value === true) {
        joinObject[key] = true;
      } else if (typeof value === 'object') {
        joinObject[key] = value;
      }
    }
    
    // Return formatted JSON string
    return JSON.stringify(joinObject, null, 2);
  }

  /**
   * Load options for columns that have load configuration
   */
  private loadColumnOptions(): void {
    if (!this.columns || this.columns.length === 0) return;

    this.columns.forEach(column => {
      if (column.load && column.load.url) {
        this.loadColumnOption(column);
      }
    });
  }

  /**
   * Load options for form fields that have load configuration
   * Called when form is opened (add or edit mode)
   */
  private loadFormFieldOptions(): void {
    if (!this.formFields || this.formFields.length === 0) return;

    // Load all static options in parallel
    const loadPromises: Promise<void>[] = [];
    
    this.formFields.forEach(column => {
      if (column.load && column.load.url) {
        // Skip if data is a function (dynamic) - will be loaded by loadDynamicFieldOptions
        if (typeof column.load.data === 'function') {
          return;
        }
        // Clear cache for this column to ensure fresh data when form opens
        const cacheKey = `${column.field}_${column.load.url}`;
        this.columnOptionsCache.delete(cacheKey);
        this.columnOptionsLoading.delete(cacheKey);
        
        // Clear column.options to force reload
        column.options = undefined;
        
        // Load static options immediately
        this.loadColumnOption(column);
      }
    });
  }

  /**
   * Load options for a specific column
   */
  private loadColumnOption(column: TableColumn): void {
    if (!column.load || !column.load.url) return;

    // Try to get the original form field definition that might have the map function
    // This is important for nested grids where form fields might be copied without preserving functions
    const originalFormField = this.formFields?.find(f => f.field === column.field);
    
    // If the original form field has a map function but the column doesn't, restore it
    if (originalFormField?.load?.map && typeof originalFormField.load.map === 'function' && !column.load.map) {
      console.log(`[loadColumnOption] ${column.field} - Restoring map function from original form field`);
      column.load = { ...column.load, map: originalFormField.load.map };
    }
    
    // Use the load config (which now has the map function if it was restored)
    const load = column.load;

    let cacheKey: string;
    let data: any;
    let method: string;
    let url: string;

    // If data is a function, check if required formData values are available
    if (typeof load.data === 'function') {
      // Get dynamic data to check if required values exist
      // Pass formData to the function - it should return the request payload
      const dynamicData = load.data(this.formData);
      
      console.log(`[loadColumnOption] ${column.field} - formData:`, this.formData);
      console.log(`[loadColumnOption] ${column.field} - dynamicData:`, dynamicData);
      
      // Check if EmployeeID is in the returned data (for GetCardsByEmployeeID, etc.)
      const employeeId = dynamicData?.EmployeeID;
      
      // If EmployeeID is required but not available, skip loading
      if (employeeId == null || employeeId === undefined) {
        console.warn(`[loadColumnOption] ${column.field} - EmployeeID not found in dynamicData, skipping`);
        return;
      }
      
      // Include relevant formData values in cache key for dynamic data
      cacheKey = `${column.field}_${load.url}_${employeeId}`;
      data = dynamicData;
    } else {
      // Static data - use existing logic
      cacheKey = `${column.field}_${load.url}`;
      data = load.data || {};
      console.log(`[loadColumnOption] ${column.field} - Static data:`, data);
    }

    // Check if already loaded (has cached options, even if empty)
    // We cache empty arrays too to prevent duplicate requests
    if (this.columnOptionsCache.has(cacheKey)) {
      return;
    }
    
    // Check if currently loading
    if (this.columnOptionsLoading.get(cacheKey)) {
      return;
    }

    this.columnOptionsLoading.set(cacheKey, true);

    method = load.method || 'GET';
    url = load.url;

    let request: Observable<any>;

    if (method === 'GET') {
      request = this.http.get(url);
    } else {
      // For POST, PUT, DELETE, send data in body
      // Use the data returned from the function (or static data)
      const body: any = { ...data };
      
      //console.log(`loadColumnOption for ${column.field} - sending request body:`, body);
      
      // Add bypass_token if injectAuth is true (will be handled by interceptor)
      request = this.http.request(method, url, { body });
    }

    request.pipe(
      map(response => {
        // Apply map function if provided (use load which might have the map function from original form field)
        if (load?.map && typeof load.map === 'function') {
          const mapped = load.map(response);
          return mapped;
        } else {
          
          // Default mapping: handle different API response formats
          let records: any[] = [];
          
          if (response && response.records && Array.isArray(response.records)) {
            records = response.records;
          } else if (response && Array.isArray(response)) {
            records = response;
          } else if (response && response.data && Array.isArray(response.data)) {
            records = response.data;
          }
          
          if (records.length > 0) {
            // Try to extract id and text from various field name patterns
            return records.map((item: any) => {
              // Try different ID field names
              const id = item.id || item.value || item.ID || item.Id || 
                        item.CafeteriaGroupID || item.CardTypeID || 
                        item.CardCodeTypeID || item.CardStatusId ||
                        item.recid || null;
              
              // Try different text field names
              const text = item.text || item.label || item.name || item.Name ||
                          item.CafeteriaGroupName || item.CardType || 
                          item.CardTypeName || item.CardCodeType ||
                          (id !== null ? String(id) : '');
              
              return {
                id: id,
                text: text
              };
            });
          }
          
          console.warn(`[loadColumnOption] ${column.field} - Unexpected response format:`, response);
          return [];
        }
      }),
      catchError(error => {
        console.error(`Error loading options for column ${column.field}:`, error);
        return of([]);
      })
    ).subscribe(options => {
      // Filter out null/undefined values and convert to TableColumnOption format
      const validOptions = options
        .map((opt: any): TableColumnOption | null => {
          const optValue = opt.id !== undefined ? opt.id : (opt.value !== undefined ? opt.value : null);
          if (optValue === null || optValue === undefined) {
            return null;
          }
          return {
            label: opt.text || opt.label || String(optValue),
            value: optValue
          };
        })
        .filter((opt: TableColumnOption | null): opt is TableColumnOption => opt !== null);
      
      // Always cache the result (even if empty) to prevent duplicate requests
      // This prevents infinite loops when API returns empty arrays
      this.columnOptionsCache.set(cacheKey, validOptions);
      
      // Update column options - find the actual column reference in formFields
      if (column && column.field) {
        // Find the actual column reference in formFields to update
        const formFieldColumn = this.formFields?.find(f => f.field === column.field);
        if (formFieldColumn) {
          // Create new array reference to trigger change detection
          formFieldColumn.options = [...validOptions];
          console.log(`Updated options for ${column.field} in formFields:`, validOptions.length, 'options');
        }
        // Also update the column directly (in case it's not in formFields)
        column.options = [...validOptions]; // Create new array reference
      }
      
      this.columnOptionsLoading.set(cacheKey, false);
      
      // Force change detection to update UI - use markForCheck for better performance
      this.cdr.markForCheck();
      
      // Also trigger detectChanges in next tick to ensure immediate update
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 0);
    });
  }

  /**
   * Get options for a column (from cache or load if needed)
   */
  getColumnOptions(column: TableColumn): TableColumnOption[] {
    if (!column || !column.field) return [];

    // Always use the actual column from formFields to ensure we're working with the correct reference
    const formFieldColumn = this.formFields?.find(f => f.field === column.field);
    const actualColumn = formFieldColumn || column;

    // If column has load configuration, check cache first
    if (actualColumn.load && actualColumn.load.url) {
      // Build cache key same way as loadColumnOption
      let cacheKey = `${actualColumn.field}_${actualColumn.load.url}`;
      if (typeof actualColumn.load.data === 'function') {
        const dynamicData = actualColumn.load.data(this.formData);
        const employeeId = dynamicData?.EmployeeID;
        
        // If EmployeeID is required but not available, return empty array (don't load)
        if (employeeId == null || employeeId === undefined) {
          return [];
        }
        
        cacheKey = `${actualColumn.field}_${actualColumn.load.url}_${employeeId}`;
      }
      
      // First check cache (even if empty, to prevent duplicate requests)
      if (this.columnOptionsCache.has(cacheKey)) {
        const cachedOptions = this.columnOptionsCache.get(cacheKey);
        // Update column.options from cache to ensure consistency
        if (cachedOptions && cachedOptions.length > 0) {
          // Create new array reference to trigger change detection
          actualColumn.options = [...cachedOptions];
          // Also update the passed column reference if different
          if (column !== actualColumn) {
            column.options = [...cachedOptions];
          }
        }
        return cachedOptions || [];
      }
      
      if (actualColumn.options && Array.isArray(actualColumn.options) && actualColumn.options.length > 0) {
        // Also cache it for next time
        this.columnOptionsCache.set(cacheKey, actualColumn.options);
        return actualColumn.options;
      }
      
      // Check if already loading - if yes, return empty array to prevent duplicate requests
      if (this.columnOptionsLoading.get(cacheKey)) {
        return [];
      }
      
      // Load if not cached and not currently loading
      // Use the actual column from formFields if available
      this.loadColumnOption(actualColumn);
      return []; // Return empty array while loading
    }

    // If column has static options, return them
    if (actualColumn.options && Array.isArray(actualColumn.options) && actualColumn.options.length > 0) {
      return actualColumn.options;
    }

    return [];
  }
  
  // Track last formData to prevent unnecessary reloads
  private lastFormDataForDynamicOptions: any = null;

  /**
   * Load dynamic field options that depend on formData (e.g., SubscriptionCard depends on EmployeeID)
   * Called when form is opened and formData is set
   */
  private loadDynamicFieldOptions(): void {
    // Check if formData has actually changed
    const formDataKey = JSON.stringify(this.formData);
    if (this.lastFormDataForDynamicOptions === formDataKey) {
      // FormData hasn't changed, skip loading
      return;
    }
    
    this.lastFormDataForDynamicOptions = formDataKey;
    
    // Use setTimeout to ensure formData is fully set and change detection has run
    setTimeout(() => {
      // Find all columns with load functions that depend on formData
      const allColumns = [
        ...(this.formFields || []),
        ...this.getEditableColumns()
      ];
      
      // Filter columns that have load.data as function
      const dynamicColumns = allColumns.filter(col => 
        col.load && 
        typeof col.load.data === 'function' &&
        col.field
      );
      
      // Load options for each dynamic column
      dynamicColumns.forEach(column => {
        // Check if formData has required values (e.g., EmployeeID for SubscriptionCard)
        const dynamicData = column.load!.data!(this.formData);
        const employeeId = dynamicData?.EmployeeID;
        
        // Only load if required data is available
        if (employeeId != null && employeeId !== undefined) {
          // Build cache key to check if already loaded for this EmployeeID
          const cacheKey = `${column.field}_${column.load!.url}_${employeeId}`;
          
          // Only load if not already cached
          if (!this.columnOptionsCache.has(cacheKey) && !this.columnOptionsLoading.get(cacheKey)) {
            // Clear column.options to force reload
            column.options = undefined;
            // Load options
            this.loadColumnOption(column);
          }
        }
      });
      
      this.cdr.markForCheck();
    }, 100); // Small delay to ensure formData is set
  }

  /**
   * Handle form field change - update formData and trigger onFormDataChange
   */
  onFormFieldChange(fieldName: string, value: any): void {
    // Update formData
    this.formData[fieldName] = value;
    // Trigger onFormDataChange with the changed field
    this.onFormDataChange({ [fieldName]: value });
  }

  /**
   * Handle form data change - emit to parent component and call callback
   */
  onFormDataChange(formData: any): void {
    // Check if EmployeeID changed - if so, reload SubscriptionCard options
    const previousEmployeeId = this.formData?.['EmployeeID'];
    const newEmployeeId = formData?.['EmployeeID'];
    
    // Update internal formData
    this.formData = { ...this.formData, ...formData };
    
    // If EmployeeID changed, reload SubscriptionCard field options
    if (previousEmployeeId !== newEmployeeId && newEmployeeId != null) {
      // Check in formFields first
      let subscriptionCardColumn = this.formFields?.find(col => col.field === 'SubscriptionCard');
      // If not found, check in editable columns
      if (!subscriptionCardColumn) {
        subscriptionCardColumn = this.getEditableColumns().find(col => col.field === 'SubscriptionCard');
      }
      
      if (subscriptionCardColumn && subscriptionCardColumn.load) {
        // Clear cache for SubscriptionCard with old EmployeeID
        const oldCacheKey = `SubscriptionCard_${subscriptionCardColumn.load.url}_${previousEmployeeId || 'null'}`;
        this.columnOptionsCache.delete(oldCacheKey);
        // Clear column.options to force reload
        subscriptionCardColumn.options = undefined;
        // Reload options with new EmployeeID
        this.loadColumnOption(subscriptionCardColumn);
      }
    }
    
    // Trigger change detection for OnPush strategy
    this.cdr.markForCheck();
    // Also trigger detectChanges to ensure immediate update
    this.cdr.detectChanges();
    // Emit form change event to parent component
    this.formChange.emit(formData);
    // Call onFormChange callback if provided
    if (this.onFormChange) {
      this.onFormChange(formData);
    }
  }

  /**
   * Reload a nested grid by ID
   */
  reloadNestedGrid(gridId: string): void {
    // Use setTimeout to ensure ViewChildren is updated
    setTimeout(() => {
      if (this.nestedGrids) {
        const grid = this.nestedGrids.find(g => g.id === gridId);
        if (grid && grid.dataSource) {
          grid.reload();
        }
      }
    }, 0);
  }
}

