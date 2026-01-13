// Employee Component - Adapted from old app.component.ts
// NOTE: This component requires DataTableComponent to be created
// The component structure is ready but DataTableComponent needs to be implemented

import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TablerIconsModule } from 'angular-tabler-icons';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { catchError, map, finalize } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { WebSocketService } from 'src/app/services/websocket.service';
import { Subscription } from 'rxjs';

// Import configurations
import { joinOptions } from './employee-config';
import { tableColumns } from './employee-table-columns';
import { formFields, formTabs, formLoadUrl, formLoadRequest, formDataMapper, imageUploadUrl, imageField, imagePreviewUrl } from './employee-form-config';
import { getGridColumns } from './employee-nested-grids';

// Import types from DataTableComponent
import { 
  DataTableComponent, 
  TableColumn, 
  ToolbarConfig, 
  GridResponse, 
  JoinOption,
  FormTab,
  FormTabGrid,
  ColumnType
} from 'src/app/components/data-table/data-table.component';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [
    MaterialModule, 
    CommonModule,
    FormsModule,
    TablerIconsModule,
    TranslateModule,
    DataTableComponent,
    ModalComponent
  ],
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss']
})
export class EmployeeComponent implements OnInit, OnDestroy {
  // Table configuration
  tableColumns: TableColumn[] = tableColumns;
  joinOptions: JoinOption[] = joinOptions;
  
  // Form configuration
  formFields: TableColumn[] = formFields;
  formTabs: FormTab[] = []; // Will be initialized in constructor
  formLoadUrl = formLoadUrl;
  formLoadRequest = formLoadRequest;
  formDataMapper = formDataMapper;
  imageUploadUrl = imageUploadUrl;
  imageField = imageField;
  imagePreviewUrl = imagePreviewUrl;
  
  // Format modal state
  showFormatModal = false;
  readers: any[] = [];
  isLoadingReaders = false;
  selectedCardIdsForFormat: number[] = [];
  selectedCardsForFormat: any[] = []; // Store selected card details
  
  // WebSocket subscriptions
  private wsMessageSubscription?: Subscription;
  private wsConnectionSubscription?: Subscription;
  
  // Format operation state
  formatStatusMessage: string = '';
  isFormatting: boolean = false;
  selectedReaderForFormat: any = null;
  
  // Close and clone modal state
  showCloseAndCloneModal = false;
  closeAndCloneCardDesc: string = '';
  closeAndCloneCardDescError: boolean = false;
  selectedCardForCloseAndClone: any = null;
  
  // Reader status tracking
  readerStatuses: Map<string, 'connected' | 'disconnected' | 'checking'> = new Map();
  // Reader messages tracking
  readerMessages: Map<string, string> = new Map();
  
  // Data source function for table
  tableDataSource = (params: any) => {
    return this.http.post<GridResponse>(`${environment.apiUrl}/api/Employees`, {
      page: params.page || 1,
      limit: params.limit || 10,
      offset: ((params.page || 1) - 1) * (params.limit || 10),
      search: params.search || undefined,
      searchLogic: params.searchLogic || 'AND',
      sort: params.sort,
      join: params.join,
      showDeleted: params.showDeleted,
      columns: this.tableColumns
    }).pipe(
      map((response: GridResponse) => ({
        status: 'success' as const,
        total: response.total || (response.records ? response.records.length : 0),
        records: response.records || []
      })),
      catchError(error => {
        console.error('Error loading employees:', error);
        return of({
          status: 'error' as const,
          total: 0,
          records: []
        } as GridResponse);
      })
    );
  };

  // Toolbar configuration
  get tableToolbarConfig(): ToolbarConfig {
    return {
      items: [
        {
          type: 'break' as const,
          id: 'break-operations-menu'
        },
        {
          id: 'operations-menu',
          type: 'menu' as const,
          text: this.translate.instant('toolbar.operations'),
          tooltip: this.translate.instant('toolbar.operationsTooltip'),
          items: [
            {
              id: 'bulk-access-permission',
              text: this.translate.instant('operations.bulkAccessPermission'),
              onClick: (event: MouseEvent, item: any) => this.onBulkAccessPermission(event, item)
            },
            {
              id: 'bulk-company',
              text: this.translate.instant('operations.bulkCompany'),
              onClick: (event: MouseEvent, item: any) => this.onBulkCompany(event, item)
            },
            {
              id: 'bulk-position',
              text: this.translate.instant('operations.bulkPosition'),
              onClick: (event: MouseEvent, item: any) => this.onBulkPosition(event, item)
            },
            {
              id: 'bulk-department',
              text: this.translate.instant('operations.bulkDepartment'),
              onClick: (event: MouseEvent, item: any) => this.onBulkDepartment(event, item)
            },
            {
              id: 'bulk-sms',
              text: this.translate.instant('operations.bulkSms'),
              onClick: (event: MouseEvent, item: any) => this.onBulkSms(event, item)
            },
            {
              id: 'bulk-mail',
              text: this.translate.instant('operations.bulkMail'),
              onClick: (event: MouseEvent, item: any) => this.onBulkMail(event, item)
            },
            {
              id: 'import-from-excel',
              text: this.translate.instant('operations.importFromExcel'),
              onClick: (event: MouseEvent, item: any) => this.onImportFromExcel(event, item)
            },
            {
              id: 'bulk-image-upload',
              text: this.translate.instant('operations.bulkImageUpload'),
              onClick: (event: MouseEvent, item: any) => this.onBulkImageUpload(event, item)
            },
            {
              id: 'bulk-web-client',
              text: this.translate.instant('operations.bulkWebClient'),
              onClick: (event: MouseEvent, item: any) => this.onBulkWebClient(event, item)
            },
            {
              id: 'bulk-password-reset',
              text: this.translate.instant('operations.bulkPasswordReset'),
              onClick: (event: MouseEvent, item: any) => this.onBulkPasswordReset(event, item)
            },
            {
              id: 'export-to-excel',
              text: this.translate.instant('operations.exportToExcel'),
              onClick: (event: MouseEvent, item: any) => this.onExportToExcel(event, item)
            }
          ]
        }
      ],
      show: {
        reload: true,
        add: true,
        edit: true,
        delete: true,
        save: false
      }
    };
  }

  // Get grid columns function
  getGridColumns = getGridColumns;

  // Get grid dataSource function
  getGridDataSource = (gridId: string, formData: any): ((params: any) => Observable<GridResponse>) | undefined => {
    switch (gridId) {
      case 'EmployeeCardGrid':
        return (params: any) => {
          const requestBody = params;
          
          return this.http.post<GridResponse>(`${environment.apiUrl}/api/Cards/GetCardsByEmployeeID`, requestBody).pipe(
            map((response: GridResponse) => ({
              status: 'success' as const,
              total: response.total || (response.records ? response.records.length : 0),
              records: response.records || []
            })),
            catchError(error => {
              console.error('Error loading cards:', error);
              return of({
                status: 'error' as const,
                total: 0,
                records: []
              } as GridResponse);
            })
          );
        };
      case 'EmployeeAccessGroupReaders':
        return (params: any) => {
          const requestBody = params;
          
          if (params.AccessGroups && Array.isArray(params.AccessGroups) && params.AccessGroups.length > 0) {
            requestBody.AccessGroups = params.AccessGroups;
          }
          
          //console.log('EmployeeAccessGroupReaders API request:', requestBody);
          
          return this.http.post<GridResponse>(`${environment.apiUrl}/api/AccessGroupReaders/GetReadersByAccessGroups`, requestBody).pipe(
            map((response: GridResponse) => ({
              status: 'success' as const,
              total: response.total || (response.records ? response.records.length : 0),
              records: response.records || []
            })),
            catchError(error => {
              console.error('Error loading access group readers:', error);
              return of({
                status: 'error' as const,
                total: 0,
                records: []
              } as GridResponse);
            })
          );
        };
      case 'EmployeeHistories':
        return (params: any) => {
          const requestBody = params;
          //console.log('EmployeeHistories API request:', requestBody);
          
          return this.http.post<GridResponse>(`${environment.apiUrl}/api/PdksCompanyHistories/EmployeeHistories`, requestBody).pipe(
            map((response: GridResponse) => ({
              status: 'success' as const,
              total: response.total || (response.records ? response.records.length : 0),
              records: response.records || []
            })),
            catchError(error => {
              console.error('Error loading employee histories:', error);
              return of({
                status: 'error' as const,
                total: 0,
                records: []
              } as GridResponse);
            })
          );
        };
      case 'SubscriptionEvents':
        return (params: any) => {
          const requestBody = params;
          
          return this.http.post<GridResponse>(`${environment.apiUrl}/api/SubscriptionEvents/GetAllByCardTagCode`, requestBody).pipe(
            map((response: GridResponse) => ({
              status: 'success' as const,
              total: response.total || (response.records ? response.records.length : 0),
              records: response.records || []
            })),
            catchError(error => {
              console.error('Error loading subscription events:', error);
              return of({
                status: 'error' as const,
                total: 0,
                records: []
              } as GridResponse);
            })
          );
        };
      default:
        return undefined;
    }
  };

  // Save callback
  onSave = (data: any, isEdit: boolean): Observable<any> => {
    const url = `${environment.apiUrl}/api/Employees/form`;
    const recid = data.EmployeeID || data.recid || null;
    const { EmployeeID, recid: _, ...record } = data;
    return this.http.post(url, {
      request: {
        action: 'save',
        recid: recid,
        name: 'EditEmployee',
        record: record
      }
    });
  };

  // Form change handler
  private previousAccessGroup: any = null;
  private previousSubscriptionCard: any = null;
  private previousCafeteriaAccount: any = null;

  @ViewChild(DataTableComponent) dataTableComponent?: DataTableComponent;

  onFormChange = (formData: any) => {
    //console.log('onFormChange called with formData:', formData);
    
    if (formData) {
      const currentAccessGroup = formData['AccessGroup'];
      
      if (formData.hasOwnProperty('AccessGroup')) {
        const previousStr = JSON.stringify(this.previousAccessGroup);
        const currentStr = JSON.stringify(currentAccessGroup);
        
        if (previousStr !== currentStr) {
          console.log('AccessGroup changed:', {
            previous: this.previousAccessGroup,
            current: currentAccessGroup
          });
          this.previousAccessGroup = currentAccessGroup;
          this.reloadNestedGrid('EmployeeAccessGroupReaders');
        }
      }
      
      if (formData.hasOwnProperty('SubscriptionCard')) {
        const currentSubscriptionCard = formData['SubscriptionCard'];
        const previousSubscriptionCard = this.previousSubscriptionCard;
        
        if (previousSubscriptionCard !== currentSubscriptionCard) {
          console.log('SubscriptionCard changed:', {
            previous: previousSubscriptionCard,
            current: currentSubscriptionCard
          });
          this.previousSubscriptionCard = currentSubscriptionCard;
          this.reloadNestedGrid('SubscriptionEvents');
        }
      }

      if (formData.hasOwnProperty('CafeteriaAccount')) {
        const currentCafeteriaAccount = formData['CafeteriaAccount'];
        if (this.previousCafeteriaAccount !== currentCafeteriaAccount && currentCafeteriaAccount != null) {
          console.log('CafeteriaAccount changed:', {
            previous: this.previousCafeteriaAccount,
            current: currentCafeteriaAccount
          });
          this.previousCafeteriaAccount = currentCafeteriaAccount;
          this.loadTotalPrice(currentCafeteriaAccount);
        }
      }
    }
  };

  // Event handlers
  onTableRowClick(event: { row: any; columnIndex?: number }) {
    //console.log('Row clicked:', event.row);
  }

  onPictureClick(event: { row: any; column: any; rowIndex: number; columnIndex: number; pictureId: string; event: MouseEvent }) {
    //console.log('Picture clicked:', event);
  }

  onTableRowSelect(rows: any[]) {
    //console.log('Rows selected:', rows);
  }

  onAdvancedFilterChange(filter: any) {
    //console.log('Advanced filter changed:', filter);
  }

  onTableRefresh() {
    //console.log('Table refresh requested');
  }

  onTableDelete(rows: any[]) {
    //console.log('Delete records requested:', rows);
  }
  
  onTableAdd() {
    //console.log('Add new record requested');
  }
  
  onTableEdit(row: any) {
    //console.log('Edit record requested:', row);
  }
  
  onTableRowDblClick(row: any) {
    //console.log('Row double-clicked:', row);
  }
  
  onTableContextMenu(event: { row: any; event: MouseEvent }) {
    event.event.preventDefault();
  }
  
  onTableColumnClick(event: { column: TableColumn; event: MouseEvent }) {
    //console.log('Column clicked:', event.column.field);
  }
  
  onTableColumnDblClick(event: { column: TableColumn; event: MouseEvent }) {
    //console.log('Column double-clicked:', event.column.field);
  }
  
  onTableColumnContextMenu(event: { column: TableColumn; event: MouseEvent }) {
    event.event.preventDefault();
  }
  
  onTableColumnResize(event: { column: TableColumn; width: number }) {
    //console.log('Column resized:', event.column.field, 'new width:', event.width);
  }
  
  onTableMouseEnter(row: any) {
    // Could show tooltip or highlight
  }
  
  onTableMouseLeave(row: any) {
    // Remove tooltip or highlight
  }
  
  onTableFocus() {
    //console.log('Table focused');
  }
  
  onTableBlur() {
    // Table blurred
  }
  
  onTableCopy(event: { text: string; event: ClipboardEvent }) {
    //console.log('Copy event:', event.text);
  }
  
  onTablePaste(event: { text: string; event: ClipboardEvent }) {
    //console.log('Paste event:', event.text);
  }

  // Bulk operation handlers
  onBulkAccessPermission(event: MouseEvent, item: any) {
    //console.log('Bulk access permission:', event, item);
  }

  onBulkCompany(event: MouseEvent, item: any) {
    //console.log('Bulk company:', event, item);
  }

  onBulkPosition(event: MouseEvent, item: any) {
    //console.log('Bulk position:', event, item);
  }

  onBulkDepartment(event: MouseEvent, item: any) {
    //console.log('Bulk department:', event, item);
  }

  onBulkSms(event: MouseEvent, item: any) {
    //console.log('Bulk SMS:', event, item);
  }

  onBulkMail(event: MouseEvent, item: any) {
    //console.log('Bulk mail:', event, item);
  }

  onImportFromExcel(event: MouseEvent, item: any) {
    //console.log('Import from Excel:', event, item);
  }

  onBulkImageUpload(event: MouseEvent, item: any) {
    //console.log('Bulk image upload:', event, item);
  }

  onBulkWebClient(event: MouseEvent, item: any) {
    //console.log('Bulk web client:', event, item);
  }

  onBulkPasswordReset(event: MouseEvent, item: any) {
    //console.log('Bulk password reset:', event, item);
  }

  onExportToExcel(event: MouseEvent, item: any) {
    //console.log('Export to Excel:', event, item);
  }

  /**
   * Get selected card IDs from EmployeeCardGrid
   */
  private getSelectedCardIds(): number[] {
    if (!this.dataTableComponent) {
      console.warn('DataTableComponent not found');
      return [];
    }

    // Find EmployeeCardGrid in nested grids
    if (!this.dataTableComponent.nestedGrids) {
      console.warn('Nested grids not found');
      return [];
    }

    const cardGrid = this.dataTableComponent.nestedGrids.find(
      (grid: DataTableComponent) => grid.id === 'EmployeeCardGrid'
    );

    if (!cardGrid) {
      console.warn('EmployeeCardGrid not found');
      return [];
    }

    // Get selected row IDs from the grid
    const selectedRowIds = Array.from(cardGrid.selectedRows);
    
    // Get actual CardID values from the data
    const cardIds: number[] = [];
    const recidField = cardGrid.recid || 'CardID';
    
    // Use filteredData or internalData depending on dataSource
    const dataSource = cardGrid.dataSource ? cardGrid.filteredData : cardGrid.data;
    
    selectedRowIds.forEach((rowId: any) => {
      const row = dataSource.find((r: any) => {
        const id = r['recid'] ?? r[recidField] ?? r['CardID'] ?? r['id'];
        return id === rowId;
      });
      
      if (row) {
        const cardId = row['CardID'] ?? row[recidField] ?? row['recid'] ?? rowId;
        if (cardId != null) {
          cardIds.push(cardId);
        }
      }
    });
    return cardIds;
  }

  /**
   * Get selected card details from EmployeeCardGrid (alternative to API call)
   */
  private getSelectedCardDetails(): any[] {
    if (!this.dataTableComponent) {
      console.warn('DataTableComponent not found');
      return [];
    }

    // Find EmployeeCardGrid in nested grids
    if (!this.dataTableComponent.nestedGrids) {
      console.warn('Nested grids not found');
      return [];
    }

    const cardGrid = this.dataTableComponent.nestedGrids.find(
      (grid: DataTableComponent) => grid.id === 'EmployeeCardGrid'
    );

    if (!cardGrid) {
      console.warn('EmployeeCardGrid not found');
      return [];
    }

    // Get selected row IDs from the grid
    const selectedRowIds = Array.from(cardGrid.selectedRows);
    
    // Get actual card data from the grid
    const cards: any[] = [];
    const recidField = cardGrid.recid || 'CardID';
    
    // Use filteredData or internalData depending on dataSource
    const dataSource = cardGrid.dataSource ? cardGrid.filteredData : cardGrid.data;
    
    selectedRowIds.forEach((rowId: any) => {
      const row = dataSource.find((r: any) => {
        const id = r['recid'] ?? r[recidField] ?? r['CardID'] ?? r['id'];
        return id === rowId;
      });
      
      if (row) {
        // Return the full card object
        cards.push(row);
      }
    });
    
    return cards;
  }

  // Card operation handlers
  onCardFormat(event: MouseEvent, item: any) {
    const selectedCardIds = this.getSelectedCardIds();
    
    //console.log('onCardFormat - selectedCardIds:', selectedCardIds);
    
    if (selectedCardIds.length === 0) {
      this.toastr.warning('Lütfen formatlamak için en az bir kart seçin', 'Uyarı');
      return;
    }

    // Store selected card IDs and clear previous card details
    this.selectedCardIdsForFormat = selectedCardIds;
    this.selectedCardsForFormat = []; // Clear previous card details
    this.selectedReaderForFormat = null; // Clear previous reader selection
    
    //console.log('onCardFormat - selectedCardIdsForFormat:', this.selectedCardIdsForFormat);
    
    // Open modal and load readers
    this.showFormatModal = true;
    this.loadReaders();
  }

  /**
   * Setup WebSocket listeners
   */
  private setupWebSocketListeners(): void {
    // Listen to WebSocket messages
    this.wsMessageSubscription = this.wsService.getMessages().subscribe((message: any) => {
      this.handleWebSocketMessage(message);
    });

    // Listen to connection status
    this.wsConnectionSubscription = this.wsService.getConnectionStatus().subscribe((connected: boolean) => {
      if (!connected && this.showFormatModal) {
        // Connection lost while modal is open
        this.toastr.warning('WebSocket bağlantısı kesildi', 'Uyarı');
      }
    });
  }

  /**
   * Handle WebSocket messages
   * Supports both old format: { type: 'xxx', status: true/false, data: {...}, ... }
   * and new format: { Type: 'xxx', Status: true/false, Data: {...}, Message: '...', ... }
   */
  private handleWebSocketMessage(message: any): void {
    // Normalize message format (support both old and new format)
    const messageType = message.Type || message.type;
    const messageData = message.Data || message.data;
    const messageStatus = message.Status !== undefined ? message.Status : message.status;
    
    // Handle formatconnect messages (format operation responses)
    if (messageType === 'formatconnect' || message.type === 'formatconnect' || (message.Message && this.isFormatting)) {
      //console.log('Format WebSocket message received:', message);
      
      // Update status message
      if (message.Message) {
        this.formatStatusMessage = message.Message;
        this.cdr.markForCheck();
      }

      // If Kill message received, close modal
      if (message.Kill) {
        this.isFormatting = false;
        
        // Close modal after 2 seconds
        setTimeout(() => {
          this.closeFormatModal();
          this.toastr.success('Format işlemi tamamlandı', 'Başarılı');
          
          // Reload card grid if needed
          if (this.dataTableComponent) {
            const cardGrid = this.dataTableComponent.nestedGrids?.find(
              (grid: DataTableComponent) => grid.id === 'EmployeeCardGrid'
            );
            if (cardGrid) {
              cardGrid.reload();
            }
          }
        }, 2000);
      }
      
      return; // Don't process further
    }
    
    // Handle checkReader response (supports both old and new format)
    if (messageType === 'checkReader' || message.type === 'checkReader' || message.type === 'RC2XXDeviceStatus') {
      
      // Handle new format: { Type: 'checkReader', Status: true, Message: '...', Data: { readers: [...] } }
      if (messageData && messageData.readers && Array.isArray(messageData.readers)) {
        // New format: { Type: 'checkReader', Data: { readers: [{ isConnected: true, readerSerial: '264550284', message: '...', ... }] } }
        messageData.readers.forEach((reader: any) => {
          const serial = reader.readerSerial || reader.SerialNumber || reader.serialNumber;
          if (serial) {
            const status = reader.isConnected === true ? 'connected' : 'disconnected';
            this.readerStatuses.set(String(serial), status);
            // Store message if available
            if (reader.message) {
              this.readerMessages.set(String(serial), reader.message);
            }
          }
        });
      } else if (message.data && message.data.readers && Array.isArray(message.data.readers)) {
        // Old format: { type: 'checkReader', data: { readers: [{ isConnected: false, readerSerial: '210551988', message: '...', ... }] } }
        message.data.readers.forEach((reader: any) => {
          const serial = reader.readerSerial || reader.SerialNumber || reader.serialNumber;
          if (serial) {
            const status = reader.isConnected === true ? 'connected' : 'disconnected';
            this.readerStatuses.set(String(serial), status);
            // Store message if available
            if (reader.message) {
              this.readerMessages.set(String(serial), reader.message);
            }
          }
        });
      } else if (messageData && typeof messageData === 'object' && !messageData.readers) {
        // Format: { Type: 'checkReader', Data: { '210551988': true, ... } } or old format
        Object.keys(messageData).forEach((serial: string) => {
          const result = messageData[serial];
          if (typeof result === 'boolean') {
            const status = result === true ? 'connected' : 'disconnected';
            this.readerStatuses.set(serial, status);
          } else if (typeof result === 'object' && result !== null) {
            // Format: { Type: 'checkReader', Data: { '210551988': { connected: true, ... } } }
            const status = result.connected || result.isConnected === true ? 'connected' : 'disconnected';
            this.readerStatuses.set(serial, status);
          }
        });
      } else if (message.data && typeof message.data === 'object' && !message.data.readers) {
        // Old format: { subType: 'checkReader', data: { '210551988': true, ... } }
        Object.keys(message.data).forEach((serial: string) => {
          const result = message.data[serial];
          if (typeof result === 'boolean') {
            const status = result === true ? 'connected' : 'disconnected';
            this.readerStatuses.set(serial, status);
          } else if (typeof result === 'object' && result !== null) {
            // Format: { subType: 'checkReader', data: { '210551988': { connected: true, ... } } }
            const status = result.connected || result.isConnected === true ? 'connected' : 'disconnected';
            this.readerStatuses.set(serial, status);
          }
        });
      } else if (message.results && Array.isArray(message.results)) {
        // Format: { subType: 'checkReader', results: [{ serialNumber: 'xxx', connected: true }, ...] }
        message.results.forEach((result: any) => {
          const serial = result.serialNumber || result.SerialNumber || result.deviceSerial;
          if (serial) {
            const status = result.connected || result.isConnected === true ? 'connected' : 'disconnected';
            this.readerStatuses.set(serial, status);
          }
        });
      } else if (message.deviceSerials && Array.isArray(message.deviceSerials)) {
        // Format: { subType: 'checkReader', deviceSerials: ['xxx', 'yyy'], 'xxx': true, 'yyy': false }
        message.deviceSerials.forEach((serial: string) => {
          const result = message[serial];
          if (result !== undefined) {
            const status = result === true || result === 'connected' ? 'connected' : 'disconnected';
            this.readerStatuses.set(serial, status);
          } else {
            // If no result for this serial, mark as disconnected
            this.readerStatuses.set(serial, 'disconnected');
          }
        });
      } else if (message.status !== undefined && message.readerSerial) {
        // Format: { subType: 'checkReader', status: true, readerSerial: '210551988' }
        const serial = String(message.readerSerial);
        const status = message.status === true ? 'connected' : 'disconnected';
        this.readerStatuses.set(serial, status);
      }
      this.cdr.markForCheck();
    }
  }

  /**
   * Load readers from API
   */
  loadReaders(): void {
    this.isLoadingReaders = true;
    this.readers = [];
    this.readerStatuses.clear();
    
    const url = `${environment.apiUrl}/api/Terminals/GetDefinitionReaders`;
    
    this.http.post<any>(url, {}).pipe(
      catchError(error => {
        this.isLoadingReaders = false;
        this.toastr.error('Reader\'lar yüklenirken bir hata oluştu', 'Hata');
        return of({ status: 'error', records: [] });
      })
    ).subscribe({
      next: (response) => {
        this.isLoadingReaders = false;
        if (response && response.status === 'success' && response.records) {
          this.readers = response.records;
          // Initialize all readers as disconnected initially
          this.readers.forEach((reader: any) => {
            const serial = reader.SerialNumber || reader.serialNumber;
            if (serial) {
              this.readerStatuses.set(serial, 'disconnected');
            }
          });
          // Send checkReader message via WebSocket
          this.checkReaderConnections();
        } else if (response && Array.isArray(response)) {
          // If response is directly an array
          this.readers = response;
          this.readers.forEach((reader: any) => {
            const serial = reader.SerialNumber || reader.serialNumber;
            if (serial) {
              this.readerStatuses.set(serial, 'disconnected');
            }
          });
          this.checkReaderConnections();
        } else if (response && response.readers && Array.isArray(response.readers)) {
          // If response has readers property
          this.readers = response.readers;
          this.readers.forEach((reader: any) => {
            const serial = reader.SerialNumber || reader.serialNumber;
            if (serial) {
              this.readerStatuses.set(serial, 'disconnected');
            }
          });
          this.checkReaderConnections();
        } else {
          this.readers = [];
          this.toastr.warning('Reader bulunamadı', 'Uyarı');
        }
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.isLoadingReaders = false;
        this.toastr.error('Reader\'lar yüklenirken bir hata oluştu', 'Hata');
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Check reader connections via WebSocket
   * PHP server expects: { type: 'checkReader', data: { deviceSerials: [...] } }
   */
  private checkReaderConnections(): void {
    if (!this.wsService.isConnected()) {
      this.toastr.warning('WebSocket bağlantısı yok', 'Uyarı');
      return;
    }

    const deviceSerials = this.readers
      .map((reader: any) => reader.SerialNumber || reader.serialNumber)
      .filter((serial: any) => serial);

    if (deviceSerials.length === 0) {
      return;
    }

    // PHP server format: type: 'checkReader'
    const message = {
      type: 'checkReader',
      data: {
        deviceSerials: deviceSerials
      }
    };

    // Set all readers to checking status
    deviceSerials.forEach((serial: string) => {
      this.readerStatuses.set(serial, 'checking');
    });
    this.cdr.markForCheck();

    this.wsService.sendMessage(message);
  }

  /**
   * Check single reader connection
   * PHP server expects: { type: 'checkReader', data: { deviceSerials: [...] } }
   */
  private checkSingleReader(serial: string): void {
    if (!this.wsService.isConnected()) {
      this.toastr.error('Bağlantı yok', 'Hata');
      return;
    }

    this.readerStatuses.set(serial, 'checking');
    this.cdr.markForCheck();

    // PHP server format: type: 'checkReader'
    const message = {
      type: 'checkReader',
      data: {
        deviceSerials: [serial]
      }
    };

    this.wsService.sendMessage(message);
  }

  /**
   * Get reader status
   */
  getReaderStatus(reader: any): 'connected' | 'disconnected' | 'checking' {
    const serial = reader.SerialNumber || reader.serialNumber;
    if (!serial) {
      return 'disconnected';
    }
    return this.readerStatuses.get(serial) || 'disconnected';
  }

  /**
   * Check if reader is selectable (connected)
   */
  isReaderSelectable(reader: any): boolean {
    return this.getReaderStatus(reader) === 'connected';
  }

  /**
   * Get reader message
   */
  getReaderMessage(reader: any): string | null {
    const serial = reader.SerialNumber || reader.serialNumber || reader.readerSerial;
    if (!serial) {
      return null;
    }
    return this.readerMessages.get(String(serial)) || null;
  }

  /**
   * Close format modal
   */
  closeFormatModal(): void {
    // Stop formatting
    this.formatWebSocket(false);
    
    this.showFormatModal = false;
    this.readers = [];
    this.selectedCardIdsForFormat = [];
    this.selectedCardsForFormat = [];
    this.formatStatusMessage = '';
    this.isFormatting = false;
    this.selectedReaderForFormat = null;
    this.readerStatuses.clear();
    this.readerMessages.clear();
  }

  /**
   * Cleanup subscriptions
   */
  ngOnDestroy(): void {
    // Close format WebSocket connection
    this.formatWebSocket(false);
    
    if (this.wsMessageSubscription) {
      this.wsMessageSubscription.unsubscribe();
    }
    if (this.wsConnectionSubscription) {
      this.wsConnectionSubscription.unsubscribe();
    }
  }

  /**
   * Handle reader selection for format operation
   */
  onReaderSelect(reader: any): void {
    const serial = reader.SerialNumber || reader.serialNumber;
    const status = this.getReaderStatus(reader);
    //console.log('status', status);

    // If disconnected, try to check connection again
    if (status === 'disconnected') {
      if (serial) {
        this.checkSingleReader(serial);
      } else {
        this.toastr.error('Bağlantı yok', 'Hata');
      }
      return;
    }

    // If checking, wait
    if (status === 'checking') {
      return;
    }

    // Only allow selection if connected
    if (status !== 'connected') {
      this.toastr.error('Bağlantı yok', 'Hata');
      return;
    }

    // If already formatting, don't allow another selection
    if (this.isFormatting) {
      this.toastr.warning('Format işlemi devam ediyor', 'Uyarı');
      return;
    }


    // Store selected reader
    this.selectedReaderForFormat = reader;
    
    //console.log('selectedCardIdsForFormat:', this.selectedCardIdsForFormat);
    //console.log('selectedCardsForFormat:', this.selectedCardsForFormat);
    
    // Try to get card details directly from grid first (faster, no API call needed)
    if (this.selectedCardsForFormat.length === 0) {
      const cardDetails = this.getSelectedCardDetails();
      if (cardDetails && cardDetails.length > 0) {
        //console.log('Got card details from grid:', cardDetails);
        this.selectedCardsForFormat = cardDetails;
      }
    }
    
    // If we have card details, start format operation
    if (this.selectedCardsForFormat.length > 0) {
      //console.log('Starting format operation with card details from grid...');
      this.startFormatOperation(reader);
    } else if (this.selectedCardIdsForFormat.length > 0) {
      // Fallback: Load from API if grid data not available
      //console.log('Loading card details from API...');
      this.loadCardDetailsForFormat();
    } else {
      console.error('No cards selected for format');
      this.toastr.error('Format için kart seçilmedi', 'Hata');
    }
  }

  /**
   * Load card details for format operation
   */
  private loadCardDetailsForFormat(): void {
    if (this.selectedCardIdsForFormat.length === 0) {
      console.error('No card IDs selected');
      this.toastr.error('Kart seçilmedi', 'Hata');
      return;
    }

    //console.log('Loading card details for IDs:', this.selectedCardIdsForFormat);
    const url = `${environment.apiUrl}/api/Cards`;
    
    // Use the same format as Card component - with proper search structure
    const requestBody = {
      page: 1,
      limit: -1,
      offset: 0,
      search: {
        field: 'CardID',
        operator: 'in',
        value: this.selectedCardIdsForFormat
      },
      searchLogic: 'AND',
      sort: undefined,
      join: undefined,
      showDeleted: false
    };
    
    //console.log('Request body:', requestBody);
    
    this.http.post<any>(url, requestBody).pipe(
      catchError(error => {
        console.error('Error loading card details:', error);
        console.error('Error details:', error.error || error.message);
        this.toastr.error('Kart detayları yüklenirken hata oluştu', 'Hata');
        return of({ records: [], total: 0 });
      })
    ).subscribe({
      next: (response) => {
        //console.log('Card details response:', response);
        //console.log('Response type:', typeof response);
        //console.log('Response keys:', response ? Object.keys(response) : 'null');
        
        // Handle different response formats
        let records: any[] = [];
        if (response && response.records) {
          records = response.records;
        } else if (response && Array.isArray(response)) {
          records = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          records = response.data;
        }
        
        //console.log('Extracted records:', records);
        
        if (records && records.length > 0) {
          this.selectedCardsForFormat = records;
          //console.log('Cards loaded:', this.selectedCardsForFormat);
          // Start format operation with first card
          if (this.selectedReaderForFormat) {
            //console.log('Starting format operation...');
            this.startFormatOperation(this.selectedReaderForFormat);
          } else {
            console.error('No reader selected for format');
          }
        } else {
          console.error('No records in response:', response);
          this.toastr.error('Kart detayları bulunamadı', 'Hata');
        }
      },
      error: (error) => {
        console.error('Subscription error:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error body:', error.error);
      }
    });
  }

  /**
   * Start format operation with selected reader and card
   */
  private startFormatOperation(reader: any): void {
    //console.log('startFormatOperation called with reader:', reader);
    //console.log('selectedCardsForFormat:', this.selectedCardsForFormat);
    
    if (this.selectedCardsForFormat.length === 0) {
      console.error('No cards available for format');
      this.toastr.error('Kart bilgisi bulunamadı', 'Hata');
      return;
    }

    // Use first card for format (or iterate through all cards)
    const card = this.selectedCardsForFormat[0];
    //console.log('Using card for format:', card);
    
    // Start format WebSocket connection
    //console.log('Calling formatWebSocket...');
    this.formatWebSocket(true, reader, card);
  }

  /**
   * Format WebSocket function - based on PHP formatWebsocket function
   * Uses existing WebSocketService connection instead of creating a new one
   */
  formatWebSocket(status: boolean, reader: any = null, card: any = null): void {
    if (!status) {
      // Stop formatting - send disconnect message if needed
      this.isFormatting = false;
      this.formatStatusMessage = '';
      this.cdr.markForCheck();
      return;
    }

    if (!reader || !card) {
      this.toastr.error('Reader veya kart bilgisi eksik', 'Hata');
      return;
    }

    // Check if WebSocket is connected
    if (!this.wsService.isConnected()) {
      this.toastr.error('WebSocket bağlantısı yok. Lütfen bekleyin...', 'Hata');
      // Try to connect
      this.wsService.connect();
      return;
    }

    try {
      this.isFormatting = true;
      this.formatStatusMessage = '';
      
      // Determine message based on card type
      // CardTypeID == 3 means card, otherwise fingerprint
      const messageCard = card.CardTypeID == 3 ? 'Kart okutunuz..' : 'Parmak izi terminaline bağlanıyor..';
      this.formatStatusMessage = messageCard;
      this.cdr.markForCheck();

      // Send formatconnect message using existing WebSocket connection
      // Format must be: { type: 'formatconnect', card: card, reader: reader }
      const client = {
        type: 'formatconnect',
        card: card,
        reader: reader.SerialNumber
      };
      
      //console.log('Sending formatconnect message:', client);
      
      // Use WebSocketService to send message
      // sendMessage will handle formatconnect specially and add token
      this.wsService.sendMessage(client);
      
    } catch (error) {
      console.error('Error sending formatconnect message:', error);
      this.toastr.error('Format mesajı gönderilemedi', 'Hata');
      this.isFormatting = false;
      this.formatStatusMessage = '';
      this.cdr.markForCheck();
    }
  }

  /**
   * Handle reader item click (for disconnected readers)
   */
  onReaderItemClick(reader: any, event: MouseEvent): void {
    const status = this.getReaderStatus(reader);
    const serial = reader.SerialNumber || reader.serialNumber;
    
    // Set message to "--" when clicked
    if (serial) {
      this.readerMessages.set(String(serial), '--');
      this.cdr.markForCheck();
    }
    
    // If disconnected, check connection
    if (status === 'disconnected') {
      if (serial) {
        this.checkSingleReader(serial);
      } else {
        this.toastr.error('Bağlantı yok', 'Hata');
      }
    } else if (status === 'connected') {
      // If connected, allow selection
      this.onReaderSelect(reader);
    }
    // If checking, do nothing
  }

  onCardTransfer(event: MouseEvent, item: any) {
    console.log('Transfer clicked', event, item);
    
    const selectedCardIds = this.getSelectedCardIds();
    
    if (selectedCardIds.length === 0) {
      this.toastr.warning('Lütfen transfer etmek için en az bir kart seçin', 'Uyarı');
      return;
    }

    console.log('Transfer edilecek kart ID\'leri:', selectedCardIds);
    // TODO: Transfer API'sine gönder
    // Örnek: this.http.post(`${environment.apiUrl}/api/Cards/Transfer`, { CardIDs: selectedCardIds })
  }

  onCardReset(event: MouseEvent, item: any) {
    console.log('Sıfırla clicked', event, item);
    
    const selectedCardIds = this.getSelectedCardIds();
    
    if (selectedCardIds.length === 0) {
      this.toastr.warning('Lütfen sıfırlamak için en az bir kart seçin', 'Uyarı');
      return;
    }

    console.log('Sıfırlanacak kart ID\'leri:', selectedCardIds);
    // TODO: Sıfırla API'sine gönder
    // Örnek: this.http.post(`${environment.apiUrl}/api/Cards/Reset`, { CardIDs: selectedCardIds })
  }

  /**
   * Handle card close and clone button click
   */
  onCardCloseAndClone(event: MouseEvent, item: any) {
    const selectedCardIds = this.getSelectedCardIds();
    
    if (selectedCardIds.length === 0) {
      this.toastr.warning('Lütfen kapatmak için bir kart seçin', 'Uyarı');
      return;
    }

    if (selectedCardIds.length > 1) {
      this.toastr.warning('Lütfen sadece bir kart seçin', 'Uyarı');
      return;
    }

    // Get selected card details
    const selectedCards = this.getSelectedCardDetails();
    if (selectedCards.length === 0) {
      this.toastr.error('Kart bilgisi bulunamadı', 'Hata');
      return;
    }

    this.selectedCardForCloseAndClone = selectedCards[0];
    this.closeAndCloneCardDesc = '';
    this.showCloseAndCloneModal = true;
  }

  /**
   * Close close and clone modal
   */
  closeCloseAndCloneModal(): void {
    this.showCloseAndCloneModal = false;
    this.closeAndCloneCardDesc = '';
    this.closeAndCloneCardDescError = false;
    this.selectedCardForCloseAndClone = null;
  }

  /**
   * Submit close and clone operation
   */
  submitCloseAndClone(): void {
    // Reset error
    this.closeAndCloneCardDescError = false;
    
    // Validate required field
    if (!this.closeAndCloneCardDesc || this.closeAndCloneCardDesc.trim() === '') {
      this.closeAndCloneCardDescError = true;
      this.toastr.warning('Eski kartın kapatılma sebebi zorunludur', 'Uyarı');
      this.cdr.markForCheck();
      return;
    }

    if (!this.selectedCardForCloseAndClone) {
      this.toastr.error('Kart bilgisi bulunamadı', 'Hata');
      return;
    }

    const cardId = this.selectedCardForCloseAndClone.CardID || this.selectedCardForCloseAndClone.recid;
    if (!cardId) {
      this.toastr.error('Kart ID bulunamadı', 'Hata');
      return;
    }

    const url = `${environment.apiUrl}/api/Cards/CloseAndClone`;
    const payload = {
      CardID: cardId,
      CardDesc: this.closeAndCloneCardDesc.trim()
    };

    this.http.post(url, payload).subscribe({
      next: (response: any) => {
        // Check if response indicates success
        const isSuccess = response && (response.error === false || response.error === undefined || response.status === 'success');
        
        if (isSuccess) {
          this.toastr.success('Kart kapatıldı ve yeni kart oluşturuldu', 'Başarılı');
          this.closeCloseAndCloneModal();
          
          // Reload EmployeeCardGrid
          if (this.dataTableComponent) {
            const cardGrid = this.dataTableComponent.nestedGrids?.find(
              (grid: DataTableComponent) => grid.id === 'EmployeeCardGrid'
            );
            if (cardGrid) {
              cardGrid.reload();
            }
          }
        } else {
          const errorMessage = response?.message || response?.error || 'İşlem başarısız oldu';
          this.toastr.error(errorMessage, 'Hata');
        }
      },
      error: (error) => {
        console.error('Error closing and cloning card:', error);
        const errorMessage = error?.error?.message || error?.message || 'Kart kapatma ve klonlama işlemi başarısız oldu';
        this.toastr.error(errorMessage, 'Hata');
      }
    });
  }

  /**
   * Reload a nested grid by ID in the main data table
   */
  reloadNestedGrid(gridId: string): void {
    if (this.dataTableComponent) {
      setTimeout(() => {
        if (this.dataTableComponent?.nestedGrids) {
          const grid = this.dataTableComponent.nestedGrids.find((g: any) => g.id === gridId);
          if (grid && grid.dataSource) {
            grid.reload();
          }
        }
      }, 0);
    }
  }

  /**
   * Deep copy formTabs while preserving functions (onSave, formLoadRequest, etc.)
   */
  private deepCopyFormTabs(tabs: FormTab[]): FormTab[] {
    return tabs.map(tab => ({
      ...tab,
      grids: tab.grids?.map(grid => ({
        ...grid,
        // Preserve functions that might be lost in JSON serialization
        onSave: grid.onSave,
        formLoadRequest: grid.formLoadRequest,
        formDataMapper: grid.formDataMapper,
        dataSource: grid.dataSource,
        data: grid.data
      }))
    }));
  }

  /**
   * Load total price based on CafeteriaAccount and EmployeeID
   */
  loadTotalPrice(accountId: number): void {
    if (!this.dataTableComponent) {
      return;
    }

    // Get EmployeeID from formData
    const employeeId = this.dataTableComponent.formData['EmployeeID'] || 
                      this.dataTableComponent.formData['recid'] ||
                      this.dataTableComponent.editingRecordId;

    if (!employeeId) {
      console.warn('EmployeeID not found, cannot load total price');
      return;
    }

    const url = `${environment.apiUrl}/api/CafeteriaEvents/GetTotalBalanceWithAccountIdAndEmployeeId`;
    const payload = {
      EmployeeID: employeeId,
      AccountId: accountId
    };
    
    console.log('Loading total price from:', url, 'with payload:', payload);

    this.http.post<any>(url, payload).pipe(
      finalize(() => {
        // Handle finalization if needed
      })
    ).subscribe({
      next: (response) => {
        console.log('Total price response:', response);
        if (response && response.status === 'success' && response.totalBalance != null) {
          // Update formData with totalBalance using onFormDataChange to trigger change detection
          if (this.dataTableComponent) {
            this.dataTableComponent.onFormDataChange({ TotalPrice: response.totalBalance });
            // Force change detection to update the view after form data change
            this.cdr.detectChanges();
          }
        } else {
          console.warn('Invalid response structure or status:', response);
        }
      },
      error: (error) => {
        console.error('Error loading total price:', error);
      }
    });
  }

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    public translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private wsService: WebSocketService
  ) {
    // Deep copy formTabs while preserving functions (onSave, formLoadRequest, etc.)
    this.formTabs = this.deepCopyFormTabs(formTabs);
    this.setupWebSocketListeners();
  }

  ngOnInit(): void {
    // Initialize toolbar items for EmployeeCardGrid with translations and handlers
    this.initializeCardGridToolbar();
    // Load and update custom field settings
    this.loadCustomFieldSettings();
  }

  /**
   * Load custom field settings from API and update columns
   */
  private loadCustomFieldSettings(): void {
    this.http.post<GridResponse>(`${environment.apiUrl}/api/CustomFieldSettings`, {
      limit: -1,
      offset: 0
    }).pipe(
      catchError(error => {
        console.error('Error loading custom field settings:', error);
        return of({
          status: 'error' as const,
          total: 0,
          records: []
        } as GridResponse);
      })
    ).subscribe(response => {
      if (response.status === 'success' && response.records && response.records.length > 0) {
        this.updateColumnsFromCustomFieldSettings(response.records);
      }
    });
  }

  /**
   * Update columns based on CustomFieldSettings data
   */
  private updateColumnsFromCustomFieldSettings(settings: any[]): void {
    // Wait for dataTableComponent to be available (use setTimeout to ensure ViewChild is initialized)
    setTimeout(() => {
      if (!this.dataTableComponent) {
        console.warn('DataTableComponent not available yet, retrying...');
        setTimeout(() => this.updateColumnsFromCustomFieldSettings(settings), 100);
        return;
      }

      // Update table columns
      settings.forEach(setting => {
        const fieldName = setting.Field; // e.g., "CustomField01"
        
        // Update table column
        if (this.dataTableComponent) {
          const updates: Partial<TableColumn> = {};
          
          // Update text and label
          if (setting.Text) {
            updates.text = setting.Text;
            updates.label = setting.Text;
          }
          
          // Update type
          if (setting.Type) {
            updates.type = setting.Type as ColumnType;
          }
          
          // Update visibility (IsVisible: false means hidden: true)
          if (setting.IsVisible !== undefined) {
            updates.hidden = !setting.IsVisible;
            // Store original hidden value for join visibility logic
            (updates as any)._customFieldHidden = !setting.IsVisible;
          }
          
          // Update column using setColumn method
          this.dataTableComponent.setColumn(fieldName, updates);
        }
        
        // Update form field
        const formFieldIndex = this.formFields.findIndex(f => f.field === fieldName);
        if (formFieldIndex !== -1) {
          const formField = this.formFields[formFieldIndex];
          
          // Update text and label
          if (setting.Text) {
            formField.text = setting.Text;
            formField.label = setting.Text;
          }
          
          // Update type
          if (setting.Type) {
            formField.type = setting.Type as ColumnType;
          }
          
          // Update disabled state (IsDisable: true means disabled: true)
          if (setting.IsDisable !== undefined) {
            formField.disabled = setting.IsDisable;
          }
          
          // Update visibility for form (IsVisible: false means hidden: true)
          if (setting.IsVisible !== undefined) {
            formField.hidden = !setting.IsVisible;
          }
        }
      });
      
      // Create new array reference to trigger change detection
      this.formFields = [...this.formFields];
      
      // Trigger change detection
      this.cdr.markForCheck();
    }, 100);
  }

  /**
   * Initialize toolbar items for EmployeeCardGrid
   */
  private initializeCardGridToolbar(): void {
    // Find the CardGrid in formTabs
    const cardTab = this.formTabs.find(tab => 
      tab.grids && tab.grids.some(grid => grid.id === 'EmployeeCardGrid')
    );
    
    if (cardTab && cardTab.grids) {
      const cardGrid = cardTab.grids.find(grid => grid.id === 'EmployeeCardGrid');
      if (cardGrid && cardGrid.toolbar && cardGrid.toolbar.items) {
        // Update toolbar items with translations and onClick handlers
        cardGrid.toolbar.items = cardGrid.toolbar.items.map(item => {
          if (item.id === 'formatla') {
            return {
              ...item,
              text: this.translate.instant('card.format'),
              tooltip: this.translate.instant('card.formatTooltip'),
              onClick: (event: MouseEvent, item: any) => this.onCardFormat(event, item)
            };
          } else if (item.id === 'transfer') {
            return {
              ...item,
              text: this.translate.instant('card.transfer'),
              tooltip: this.translate.instant('card.transferTooltip'),
              onClick: (event: MouseEvent, item: any) => this.onCardTransfer(event, item)
            };
          } else if (item.id === 'sifirla') {
            return {
              ...item,
              text: this.translate.instant('card.reset'),
              tooltip: this.translate.instant('card.resetTooltip'),
              onClick: (event: MouseEvent, item: any) => this.onCardReset(event, item)
            };
          } else if (item.id === 'kapat-ve-yeni-ekle') {
            return {
              ...item,
              text: 'Kartı Kapat ve Yeni Ekle',
              tooltip: 'Kartı Kapat ve Yeni Ekle',
              onClick: (event: MouseEvent, item: any) => this.onCardCloseAndClone(event, item)
            };
          }
          return item;
        });
      }
    }
  }
}
