// PaymentsOfVirtualPos form configuration
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

// Custom form fields for view form (read-only for reports)
export const formFields: TableColumn[] = [
  { 
    field: 'PaymentId', 
    label: 'Ödeme ID', 
    text: 'Ödeme ID', 
    type: 'int' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'EmployeeID', 
    label: 'Personel ID', 
    text: 'Personel ID', 
    type: 'int' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'Employee.IdentificationNumber', 
    label: 'TC Kimlik', 
    text: 'TC Kimlik', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true,
    render: (record: any) => {
      const employee = record['Employee'];
      return employee?.IdentificationNumber || '';
    }
  },
  { 
    field: 'Employee.Name', 
    label: 'Ad', 
    text: 'Ad', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true,
    render: (record: any) => {
      const employee = record['Employee'];
      return employee?.Name || '';
    }
  },
  { 
    field: 'Employee.SurName', 
    label: 'Soyad', 
    text: 'Soyad', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true,
    render: (record: any) => {
      const employee = record['Employee'];
      return employee?.SurName || '';
    }
  },
  { 
    field: 'Employee.EmployeeDepartments', 
    label: 'Departman', 
    text: 'Departman', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true,
    render: (record: any) => {
      const employee = record['Employee'];
      if (employee?.EmployeeDepartments && Array.isArray(employee.EmployeeDepartments) && employee.EmployeeDepartments.length > 0) {
        return employee.EmployeeDepartments
          .map((ed: any) => ed['Department']?.DepartmentName)
          .filter(Boolean)
          .join(', ') || '';
      }
      return '';
    }
  },
  { 
    field: 'NameOfBank', 
    label: 'Banka Adı', 
    text: 'Banka Adı', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'CardHolderName', 
    label: 'Kart Sahibi', 
    text: 'Kart Sahibi', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'MaskedCreditCard', 
    label: 'Maskelenmiş Kart', 
    text: 'Maskelenmiş Kart', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'Response', 
    label: 'Yanıt', 
    text: 'Yanıt', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'AuthCode', 
    label: 'Yetkilendirme Kodu', 
    text: 'Yetkilendirme Kodu', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'ProcessTime', 
    label: 'İşlem Zamanı', 
    text: 'İşlem Zamanı', 
    type: 'datetime' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'ValorDate', 
    label: 'Valör Tarihi', 
    text: 'Valör Tarihi', 
    type: 'date' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'IsSuccess', 
    label: 'Başarılı', 
    text: 'Başarılı', 
    type: 'checkbox' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'Location', 
    label: 'Konum', 
    text: 'Konum', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  { 
    label: 'Sanal Pos Yükleme Bilgileri', 
    fields: ['PaymentId', 'EmployeeID', 'Employee.IdentificationNumber', 'Employee.Name', 'Employee.SurName', 'Employee.EmployeeDepartments', 'NameOfBank', 'CardHolderName', 'MaskedCreditCard', 'Response', 'AuthCode', 'ProcessTime', 'ValorDate', 'IsSuccess', 'Location'] 
  }
];

export const formLoadUrl = '';
export const formLoadRequest: ((recid: any, parentFormData?: any) => any) | undefined = undefined;
export const formDataMapper = (data: any) => data;
