// Manual Door Trigger Component
import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TablerIconsModule } from 'angular-tabler-icons';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { catchError, map } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataTableComponent, TableColumn, ToolbarConfig, GridResponse, ColumnType, TableRow } from 'src/app/components/data-table/data-table.component';
import { FormComponent } from 'src/app/components/form/form.component';
import { FormFieldComponent } from 'src/app/components/form/form-field.component';
import { SelectComponent } from 'src/app/components/select/select.component';
import { InputComponent } from 'src/app/components/input/input.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { TabsComponent } from 'src/app/components/tabs/tabs.component';
import { TabItemComponent } from 'src/app/components/tabs/tab-item.component';

@Component({
  selector: 'app-manual-door-trigger',
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule,
    FormsModule,
    TablerIconsModule,
    TranslateModule,
    DataTableComponent,
    FormComponent,
    FormFieldComponent,
    SelectComponent,
    InputComponent,
    ButtonComponent,
    TabsComponent,
    TabItemComponent
  ],
  templateUrl: './manual-door-trigger.component.html',
  styleUrls: ['./manual-door-trigger.component.scss']
})
export class ManualDoorTriggerComponent implements OnInit {
  @ViewChild('doorsGrid') doorsGridComponent?: DataTableComponent;

  // Tab panel: 0=Kapılar, 1=Inputlar, 2=Outputlar
  activeTab: number = 0;

  // Grid height
  gridHeight: string = 'calc(100vh - 250px)';
  /** Tab içindeki gridler için: yükseklik zinciriyle dolacak, scroll tablo wrapper'da çalışır */
  tabGridHeight: string = '100%';

  // Form data
  formData: any = {
    processType: '-1',
    processTickM: 0,
    processTick: 0
  };

  // Process type options
  processTypeOptions = [
    { label: 'Sınırsız', value: '-1' },
    { label: 'Kapat', value: '0' },
    { label: 'Süreli', value: '**' }
  ];

  // Selected doors
  selectedDoors: TableRow[] = [];

  /** Son tetikleme cevapları: SerialNumber -> { message, status } (açıklama ve satır rengi için) */
  doorTriggerResults: Record<string, { message: string; status: string }> = {};

  // Doors table columns
  doorsTableColumns: TableColumn[] = [
    {
      field: 'SerialNumber',
      label: 'Seri No',
      text: 'Seri No',
      type: 'text' as ColumnType,
      sortable: true,
      width: '100px',
      size: '100px',
      searchable: 'text',
      resizable: true
    },
    {
      field: 'ReaderName',
      label: 'Okuyucu Adı',
      text: 'Okuyucu Adı',
      type: 'text' as ColumnType,
      sortable: true,
      width: '300px',
      size: '300px',
      searchable: 'text',
      resizable: true
    },
    {
      field: 'Description',
      label: 'Açıklama',
      text: 'Açıklama',
      type: 'text' as ColumnType,
      sortable: false,
      width: '100%',
      size: '100%',
      searchable: 'text',
      resizable: true
    }
  ];

  // Toolbar config for doors table
  doorsTableToolbarConfig: ToolbarConfig = {
    items: [],
    show: {
      reload: true,
      columns: false,
      search: true,
      add: false,
      edit: false,
      delete: false,
      save: false
    }
  };

  // Inputs table columns
  inputsTableColumns: TableColumn[] = [
    { field: 'SerialNumber', label: 'Seri No', text: 'Seri No', type: 'text' as ColumnType, sortable: true, width: '120px', searchable: 'text', resizable: true },
    { field: 'Name', label: 'Ad', text: 'Ad', type: 'text' as ColumnType, sortable: true, width: '200px', searchable: 'text', resizable: true },
    { field: 'Description', label: 'Açıklama', text: 'Açıklama', type: 'text' as ColumnType, sortable: false, width: '100%', searchable: 'text', resizable: true }
  ];

  // Outputs table columns
  outputsTableColumns: TableColumn[] = [
    { field: 'SerialNumber', label: 'Seri No', text: 'Seri No', type: 'text' as ColumnType, sortable: true, width: '120px', searchable: 'text', resizable: true },
    { field: 'Name', label: 'Ad', text: 'Ad', type: 'text' as ColumnType, sortable: true, width: '200px', searchable: 'text', resizable: true },
    { field: 'Description', label: 'Açıklama', text: 'Açıklama', type: 'text' as ColumnType, sortable: false, width: '100%', searchable: 'text', resizable: true }
  ];

  // Toolbar config for inputs/outputs (read-only)
  inputsOutputsToolbarConfig: ToolbarConfig = {
    items: [],
    show: { reload: true, columns: false, search: true, add: false, edit: false, delete: false, save: false }
  };

  // Data source for doors grid
  doorsDataSource = (params: any) => {
    return this.http.post<any>(`${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Terminals/GetAllDoors`, {}).pipe(
      map((response: any) => {
        // Response format: { status: "success", message: "...", data: { page: 1, pages: 1, limit: -1, data: [...] } }
        let records: any[] = [];
        
        if (response && response.data) {
          // Check if data.data exists (nested data structure)
          if (response.data.data && Array.isArray(response.data.data)) {
            records = response.data.data;
          } else if (Array.isArray(response.data)) {
            records = response.data;
          }
        } else if (Array.isArray(response)) {
          records = response;
        } else if (response.records && Array.isArray(response.records)) {
          records = response.records;
        }
        
        // Son tetikleme cevabını açıklamaya yaz ve başarılı satırı işaretle
        records = records.map((r: any) => {
          const key = r.SerialNumber ?? r.serialNumber;
          const res = key ? this.doorTriggerResults[key] : null;
          if (res) {
            return {
              ...r,
              Description: res.message,
              _triggerSuccess: res.status === 'success'
            };
          }
          return r;
        });
        
        return {
          status: 'success' as const,
          total: records.length,
          records: records
        } as GridResponse;
      }),
      catchError(error => {
        console.error('Error loading doors:', error);
        this.toastr.error('Kapılar yüklenirken hata oluştu', 'Hata');
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };

  // Data source for inputs grid
  inputsDataSource = (params: any) => {
    const baseUrl = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Terminals/GetAllInputs`;
    return this.http.post<any>(baseUrl, {}).pipe(
      map((response: any) => this.normalizeGridResponse(response, 'Inputlar')),
      catchError(error => {
        console.error('Error loading inputs:', error);
        this.toastr.error('Inputlar yüklenirken hata oluştu', 'Hata');
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };

  // Data source for outputs grid
  outputsDataSource = (params: any) => {
    const baseUrl = `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Terminals/GetAllOutputs`;
    return this.http.post<any>(baseUrl, {}).pipe(
      map((response: any) => this.normalizeGridResponse(response, 'Outputlar')),
      catchError(error => {
        console.error('Error loading outputs:', error);
        this.toastr.error('Outputlar yüklenirken hata oluştu', 'Hata');
        return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
      })
    );
  };

  private normalizeGridResponse(response: any, context: string): GridResponse {
    let records: any[] = [];
    if (response?.data?.data && Array.isArray(response.data.data)) records = response.data.data;
    else if (response?.data && Array.isArray(response.data)) records = response.data;
    else if (Array.isArray(response)) records = response;
    else if (response?.records && Array.isArray(response.records)) records = response.records;
    return { status: 'success' as const, total: records.length, records };
  }

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Initialize form data
    this.resetForm();
    // Refresh grid when component loads
    setTimeout(() => {
      if (this.doorsGridComponent) {
        this.doorsGridComponent.onRefresh();
      }
    }, 100);
  }

  // Reset form
  resetForm(): void {
    this.formData = {
      processType: '-1',
      processTickM: 0,
      processTick: 0
    };
    this.updateTimeFieldsState();
  }

  // Handle process type change
  onProcessTypeChange(value: string): void {
    this.formData.processType = value;
    this.updateTimeFieldsState();
  }

  // Update time fields state based on process type
  updateTimeFieldsState(): void {
    if (this.formData.processType === '**') {
      // Süreli - enable time fields
      this.formData.processTick = 1;
      this.formData.processTickM = 0;
    } else {
      // Sınırsız or Kapat - disable time fields
      this.formData.processTick = this.formData.processType === '-1' ? -1 : 0;
      this.formData.processTickM = 0;
    }
    this.cdr.detectChanges();
  }

  // Handle door selection
  onDoorSelect(selectedRows: TableRow[]): void {
    this.selectedDoors = selectedRows;
  }

  /** Başarılı tetikleme satırına yeşil arka plan verir */
  getDoorRowClass(row: TableRow): string | null {
    return (row as any)._triggerSuccess ? 'row-trigger-success' : null;
  }

  /** Input sekmesi açıkken işlemler paneli pasif (0=Kapılar, 1=Inputlar, 2=Outputlar) */
  get isOperationsPanelDisabled(): boolean {
    return this.activeTab === 1;
  }

  // Save handler
  onSave(): void {
    if (this.selectedDoors.length === 0) {
      this.toastr.warning('Lütfen okuyucu seçiniz.', 'Uyarı');
      return;
    }

    if (!this.formData.processType) {
      this.toastr.warning('Lütfen işlem tipi seçiniz.', 'Uyarı');
      return;
    }

    // Calculate duration
    const duration = this.formData.processType === '**' 
      ? (this.formData.processTickM * 60) + (this.formData.processTick * 1)
      : (this.formData.processType === '-1' ? -1 : 0);

    // Prepare requests for all selected doors
    const requests = this.selectedDoors.map((door: any) => {
      const requestData = {
        ReaderType: door.ReaderType || door.readerType,
        SerialNumber: door.SerialNumber || door.serialNumber,
        RelayId: door.ReaderType === 'AVES' || door.readerType === 'AVES' 
          ? (door.RelayIdGranted || door.relayIdGranted) 
          : (door.SerialNumber || door.serialNumber),
        Duration: duration
      };

      return this.http.post<any>(
        `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/Terminals/OpenDoor`,
        requestData
      ).pipe(
        map((response: any) => {
          // API örnek: { "status": "success", "message": "OK" }
          const status = response?.status === 'success' ? 'success' : 'error';
          const message = response?.message ?? response?.Message ?? (status === 'success' ? 'Başarılı' : 'Hata');
          return {
            success: status === 'success',
            message,
            status,
            door
          };
        }),
        catchError(error => {
          console.error('Error opening door:', error);
          return of({
            success: false,
            message: error.error?.message || error.message || 'Hata oluştu',
            status: 'error',
            door: door
          });
        })
      );
    });

    // Execute all requests
    forkJoin(requests).subscribe({
      next: (results) => {
        let successCount = 0;
        let errorCount = 0;

        results.forEach((result) => {
          const door = result.door;
          const key = door?.SerialNumber ?? door?.serialNumber;
          if (key) {
            this.doorTriggerResults[key] = {
              message: result.message,
              status: result.success ? 'success' : 'error'
            };
            // Grid'i reload etmeden satırı güncelle (açıklama + yeşil satır)
            if (this.doorsGridComponent) {
              this.doorsGridComponent.set(key, {
                Description: result.message,
                _triggerSuccess: result.success
              });
            }
          }
          if (result.success) {
            successCount++;
          } else {
            errorCount++;
          }
        });

        // Show summary message
        if (successCount > 0 && errorCount === 0) {
          this.toastr.success(`${successCount} kapı başarıyla tetiklendi.`, 'Başarılı');
        } else if (successCount > 0 && errorCount > 0) {
          this.toastr.warning(`${successCount} başarılı, ${errorCount} hata.`, 'Kısmi Başarı');
        } else {
          this.toastr.error('Kapı tetikleme işlemi başarısız oldu.', 'Hata');
        }

        this.selectedDoors = [];
      },
      error: (error) => {
        console.error('Error in forkJoin:', error);
        this.toastr.error('Kapı tetikleme işlemi sırasında hata oluştu.', 'Hata');
      }
    });
  }
}
