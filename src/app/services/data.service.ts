import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { GridResponse, TableRow, TableColumn, ColumnType } from '../components/data-table/data-table.component';
import { AdvancedFilter } from '../components/data-table/filter.model';

export interface W2UISearchItem {
  field: string;
  operator: string;
  type: string;
  value: any; // Can be array for enum/list types with 'in'/'not in' operators
}

export interface W2UISortItem {
  field: string;
  direction: 'asc' | 'desc';
}

export interface DataServiceParams {
  page?: number;
  limit?: number;
  search?: AdvancedFilter | null; // AdvancedFilter for w2ui compatible search
  searchLogic?: 'AND' | 'OR'; // Search logic (AND/OR)
  sort?: { field: string; direction: 'asc' | 'desc' };
  join?: { [key: string]: boolean | { [key: string]: boolean } }; // Join options
  showDeleted?: boolean; // Show deleted records flag
  columns?: TableColumn[]; // Optional columns for type mapping
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost/api/Employees';
  
  /**
   * Save or update employee record
   */
  saveEmployee(data: any): Observable<any> {
    if (data.EmployeeID) {
      // Update existing record
      return this.http.put(`${this.apiUrl}/${data.EmployeeID}`, data).pipe(
        map(response => response),
        catchError(error => {
          console.error('Error updating employee:', error);
          return of({ status: 'error', message: error.message });
        })
      );
    } else {
      // Create new record
      return this.http.post(this.apiUrl, data).pipe(
        map(response => response),
        catchError(error => {
          console.error('Error creating employee:', error);
          return of({ status: 'error', message: error.message });
        })
      );
    }
  }

  constructor(private http: HttpClient) {}

  /**
   * Fetch data from Employees API endpoint using POST method
   * Returns data in GridResponse format compatible with data-table component
   * Uses w2ui compatible search format
   */
  getData(params?: DataServiceParams): Observable<GridResponse> {
    // Calculate offset from page number (default to page 1 if not provided)
    const page = params?.page || 1;
    const limit = params?.limit || 25;
    const offset = (page - 1) * limit;

    // Build request body - flat structure (not nested in 'request')
    const requestBody: any = {
      limit: limit,
      offset: offset
    };

    // Add search in w2ui format
    if (params?.search && params.search.conditions.length > 0) {
      const searchArray: W2UISearchItem[] = params.search.conditions.map(condition => {
        // Find column to get type
        const column = params.columns?.find(col => col.field === condition.field);
        const columnType = column?.type || 'text';
        const w2uiType = this.mapColumnTypeToW2UI(columnType);
        
        // Use searchField if available, otherwise use field
        const searchField = column?.searchField || condition.field;
        
        // Map operator
        const operator = this.mapOperatorToW2UI(condition.operator, w2uiType);
        
        // For enum/list types or 'in'/'not in' operators, value should be an array
        // w2ui.js line 12095-12108: list/enum types use array of id values
        let searchValue: any = condition.value;
        
        if (['list', 'enum'].indexOf(w2uiType) !== -1 || ['in', 'not in'].indexOf(operator) !== -1) {
          // If value is already an array, use it directly
          // Otherwise, convert to array format (w2ui expects array of id values)
          if (Array.isArray(condition.value)) {
            searchValue = condition.value;
          } else if (condition.value != null && condition.value !== '') {
            // Single value, convert to array
            searchValue = [condition.value];
          } else {
            searchValue = [];
          }
        }
        
        return {
          field: searchField,
          operator: operator,
          type: w2uiType,
          value: searchValue
        };
      });
      
      requestBody.search = searchArray;
      requestBody.searchLogic = params.searchLogic || params.search.logic || 'AND';
    }

    // Add sort in w2ui format
    if (params?.sort) {
      requestBody.sort = [{
        field: params.sort.field,
        direction: params.sort.direction
      }];
    }

    // Add join options
    if (params?.join && Object.keys(params.join).length > 0) {
      requestBody.join = this.buildJoinObject(params.join);
    }

    // Add showDeleted flag
    if (params?.showDeleted === true) {
      requestBody.showDeleted = true;
    }

    // bypass_token will be added automatically by HttpRequestInterceptor
    // No need to manually add it here
    
    return this.http.post<any>(this.apiUrl, requestBody).pipe(
      map(response => {
        // Transform the response to GridResponse format
        return {
          status: 'success' as const,
          total: response.total || response.records?.length || 0,
          records: response.records || [],
          summary: response.summary
        } as GridResponse;
      }),
      catchError(error => {
        console.error('Error fetching data:', error);
        // Provide more detailed error information
        if (error.status === 0) {
          console.error('Network error: Unable to connect to API. Please check if the server is running and CORS is configured.');
        } else if (error.status) {
          console.error(`HTTP error ${error.status}: ${error.message}`);
        }
        return of({
          status: 'error' as const,
          total: 0,
          records: []
        } as GridResponse);
      })
    );
  }

  /**
   * Map ColumnType to w2ui search type
   * Maps our column types to w2ui compatible types
   * Note: w2ui uses operatorsMap to map types to operator groups (text, number, date, list, enum)
   */
  private mapColumnTypeToW2UI(columnType: ColumnType): string {
    // Return the actual column type (int, float, etc.) - w2ui will use operatorsMap internally
    // But for operator mapping, we need to map to operator group
    const typeMapping: Record<ColumnType, string> = {
      'text': 'text',
      'int': 'int',           // w2ui maps int -> number in operatorsMap
      'float': 'float',       // w2ui maps float -> number in operatorsMap
      'money': 'money',       // w2ui maps money -> number in operatorsMap
      'currency': 'currency', // w2ui maps currency -> number in operatorsMap
      'percent': 'percent',   // w2ui maps percent -> number in operatorsMap
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
      'picture': 'text',
      'textarea': 'text'
    };
    return typeMapping[columnType] || 'text';
  }

  /**
   * Get operator group for a w2ui type (used for operator mapping)
   * w2ui uses operatorsMap to map types like 'int', 'float' to operator groups like 'number'
   */
  private getOperatorGroupForW2UIType(w2uiType: string): string {
    // Map w2ui types to operator groups (as per w2ui operatorsMap)
    if (['int', 'float', 'money', 'currency', 'percent'].includes(w2uiType)) {
      return 'number';
    }
    if (['date', 'time', 'datetime'].includes(w2uiType)) {
      return 'date';
    }
    if (['list', 'select', 'radio', 'checkbox', 'toggle'].includes(w2uiType)) {
      return 'list';
    }
    if (['enum', 'file'].includes(w2uiType)) {
      return 'enum';
    }
    // Default to text for text, hex, color, alphanumeric, combo
    return 'text';
  }

  /**
   * Map FilterOperator to w2ui operator format
   * w2ui uses different operators for different types:
   * - text: 'is', 'begins', 'contains', 'ends'
   * - number: '=', 'between', '>', '<', '>=', '<='
   * - date: 'is', 'less', 'more', 'between'
   * - list: 'is'
   * - enum: 'in', 'not in'
   */
  private mapOperatorToW2UI(operator: string, w2uiType: string = 'text'): string {
    // Get operator group (number, date, list, enum, text) from w2ui type
    const operatorGroup = this.getOperatorGroupForW2UIType(w2uiType);
    
    // Number type operators (for int, float, money, currency, percent)
    if (operatorGroup === 'number') {
      const numberMapping: Record<string, string> = {
        'equals': '=',
        'notEquals': '!=',
        'greaterThan': '>',
        'greaterThanOrEqual': '>=',
        'lessThan': '<',
        'lessThanOrEqual': '<=',
        'between': 'between'
      };
      return numberMapping[operator] || operator;
    }
    
    // Date type operators
    if (operatorGroup === 'date') {
      const dateMapping: Record<string, string> = {
        'equals': 'is',
        'lessThan': 'less',
        'greaterThan': 'more',
        'between': 'between'
      };
      return dateMapping[operator] || operator;
    }
    
    // Enum type operators
    if (operatorGroup === 'enum') {
      const enumMapping: Record<string, string> = {
        'in': 'in',
        'notIn': 'not in'
      };
      return enumMapping[operator] || operator;
    }
    
    // Text type operators (default)
    const textMapping: Record<string, string> = {
      'equals': 'is',
      'notEquals': 'is not',
      'contains': 'contains',
      'notContains': 'not contains',
      'startsWith': 'begins',
      'endsWith': 'ends',
      'isEmpty': 'is null',
      'isNotEmpty': 'is not null'
    };
    return textMapping[operator] || operator;
  }

  /**
   * Get data with custom URL (for testing or different endpoints)
   * Uses POST method by default
   */
  getDataFromUrl(url: string, params?: DataServiceParams): Observable<GridResponse> {
    // Calculate offset from page number (default to page 1 if not provided)
    const page = params?.page || 1;
    const limit = params?.limit || 25;
    const offset = (page - 1) * limit;

    // Build request body - flat structure (not nested in 'request')
    const requestBody: any = {
      limit: limit,
      offset: offset
    };

    // Add search in w2ui format
    if (params?.search && params.search.conditions.length > 0) {
      const searchArray: W2UISearchItem[] = params.search.conditions.map(condition => {
        // Find column to get type
        const column = params.columns?.find(col => col.field === condition.field);
        const columnType = column?.type || 'text';
        const w2uiType = this.mapColumnTypeToW2UI(columnType);
        
        // Use searchField if available, otherwise use field
        const searchField = column?.searchField || condition.field;
        
        // Map operator
        const operator = this.mapOperatorToW2UI(condition.operator, w2uiType);
        
        // For enum/list types or 'in'/'not in' operators, value should be an array
        // w2ui.js line 12095-12108: list/enum types use array of id values
        let searchValue: any = condition.value;
        
        if (['list', 'enum'].indexOf(w2uiType) !== -1 || ['in', 'not in'].indexOf(operator) !== -1) {
          // If value is already an array, use it directly
          // Otherwise, convert to array format (w2ui expects array of id values)
          if (Array.isArray(condition.value)) {
            searchValue = condition.value;
          } else if (condition.value != null && condition.value !== '') {
            // Single value, convert to array
            searchValue = [condition.value];
          } else {
            searchValue = [];
          }
        }
        
        return {
          field: searchField,
          operator: operator,
          type: w2uiType,
          value: searchValue
        };
      });
      
      requestBody.search = searchArray;
      requestBody.searchLogic = params.searchLogic || params.search.logic || 'AND';
    }

    // Add sort in w2ui format
    if (params?.sort) {
      requestBody.sort = [{
        field: params.sort.field,
        direction: params.sort.direction
      }];
    }

    // bypass_token will be added automatically by HttpRequestInterceptor
    // No need to manually add it here
    
    return this.http.post<any>(url, requestBody).pipe(
      map(response => {
        return {
          status: 'success' as const,
          total: response.total || response.records?.length || 0,
          records: response.records || [],
          summary: response.summary
        } as GridResponse;
      }),
      catchError(error => {
        console.error('Error fetching data from URL:', error);
        // Provide more detailed error information
        if (error.status === 0) {
          console.error('Network error: Unable to connect to API. Please check if the server is running and CORS is configured.');
        } else if (error.status) {
          console.error(`HTTP error ${error.status}: ${error.message}`);
        }
        return of({
          status: 'error' as const,
          total: 0,
          records: []
        } as GridResponse);
      })
    );
  }

  /**
   * Build join object in the required format
   * Converts flat join structure to nested structure if needed
   */
  private buildJoinObject(join: { [key: string]: boolean | { [key: string]: boolean } }): any {
    const result: any = {};
    
    for (const [key, value] of Object.entries(join)) {
      if (value === true) {
        result[key] = true;
      } else if (typeof value === 'object') {
        // Handle nested joins (e.g., EmployeeDepartments.Department, Card.CardType, Card.CafeteriaGroup)
        // Copy all nested properties, not just specific ones
        const nestedObj: any = {};
        for (const [nestedKey, nestedValue] of Object.entries(value)) {
          if (nestedValue === true) {
            nestedObj[nestedKey] = true;
          }
        }
        // Only add to result if there are nested properties
        if (Object.keys(nestedObj).length > 0) {
          result[key] = nestedObj;
        }
      }
    }
    
    return result;
  }
}
