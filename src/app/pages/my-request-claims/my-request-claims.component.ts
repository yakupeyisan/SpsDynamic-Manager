// MyRequestClaims (Bekleyen Taleplerim) Component
import { Component, OnInit, ViewChild } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { catchError, map } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { joinOptions } from './my-request-claims-config';
import { tableColumns } from './my-request-claims-table-columns';
import { DataTableComponent, TableColumn, ToolbarConfig, GridResponse, JoinOption } from 'src/app/components/data-table/data-table.component';

@Component({
  selector: 'app-my-request-claims',
  standalone: true,
  imports: [MaterialModule, CommonModule, TablerIconsModule, TranslateModule, DataTableComponent],
  templateUrl: './my-request-claims.component.html',
  styleUrls: ['./my-request-claims.component.scss']
})
export class MyRequestClaimsComponent implements OnInit {
  @ViewChild(DataTableComponent) dataTableComponent?: DataTableComponent;
  private isReloading = false;
  tableColumns: TableColumn[] = tableColumns;
  joinOptions: JoinOption[] = joinOptions;

  tableDataSource = (params: any) => {
    return this.http
      .post<GridResponse>(
        `${environment.settings[environment.setting as keyof typeof environment.settings].apiUrl}/api/RequestClaims/MyRequests`,
        {
          page: params.page || 1,
          limit: params.limit || 10,
          offset: ((params.page || 1) - 1) * (params.limit || 10),
          search: params.search || undefined,
          searchLogic: params.searchLogic || 'AND',
          sort: params.sort,
          join: params.join,
          columns: this.tableColumns
        }
      )
      .pipe(
        map((response: GridResponse) => ({
          status: 'success' as const,
          total: response.total ?? (response.records ? response.records.length : 0),
          records: response.records ?? []
        })),
        catchError((error) => {
          console.error('Error loading my request claims:', error);
          return of({ status: 'error' as const, total: 0, records: [] } as GridResponse);
        })
      );
  };

  get tableToolbarConfig(): ToolbarConfig {
    return {
      items: [],
      show: { reload: true, columns: true, search: true, add: false, edit: false, delete: false, save: false }
    };
  }

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {}

  onTableRefresh(): void {
    if (!this.isReloading && this.dataTableComponent) {
      this.isReloading = true;
      this.dataTableComponent.reload();
      setTimeout(() => {
        this.isReloading = false;
      }, 500);
    }
  }
}
