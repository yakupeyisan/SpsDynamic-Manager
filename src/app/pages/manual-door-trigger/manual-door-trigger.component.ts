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
    ButtonComponent
  ],
  templateUrl: './manual-door-trigger.component.html',
  styleUrls: ['./manual-door-trigger.component.scss']
})
export class ManualDoorTriggerComponent implements OnInit {
  @ViewChild('doorsGrid') doorsGridComponent?: DataTableComponent;

  // Grid height
  gridHeight: string = 'calc(100vh - 250px)';

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
        map((response: any) => ({
          success: response.success !== false && response.error !== true,
          message: response.message || response.Message || (response.success ? 'Başarılı' : 'Hata'),
          door: door
        })),
        catchError(error => {
          console.error('Error opening door:', error);
          return of({
            success: false,
            message: error.error?.message || error.message || 'Hata oluştu',
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

        results.forEach((result, index) => {
          if (result.success) {
            successCount++;
            // Update door description in grid
            const door = result.door;
            if (this.doorsGridComponent && door) {
              // Find and update the record
              setTimeout(() => {
                // Refresh grid to show updated status
                if (this.doorsGridComponent) {
                  this.doorsGridComponent.onRefresh();
                }
              }, 100);
            }
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

        // Clear selection and refresh grid
        this.selectedDoors = [];
        setTimeout(() => {
          if (this.doorsGridComponent) {
            this.doorsGridComponent.onRefresh();
          }
        }, 500);
      },
      error: (error) => {
        console.error('Error in forkJoin:', error);
        this.toastr.error('Kapı tetikleme işlemi sırasında hata oluştu.', 'Hata');
      }
    });
  }
}
