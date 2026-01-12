// Payments table columns configuration
import { TableColumn, ColumnType, TableRow } from 'src/app/components/data-table/data-table.component';
import { environment } from 'src/environments/environment';

const apiUrl = environment.apiUrl;

// Enum helper functions
const getPaymentTypeText = (value: any): string => {
  const paymentTypeMap: { [key: number]: string } = {
    0: 'DEVIR',
    1: 'NAKİT',
    2: 'KREDİKARTI',
    3: 'EFT/HAVALE'
  };
  const numValue = typeof value === 'string' ? parseInt(value) : value;
  return paymentTypeMap[numValue] || String(value || '');
};

const getMeansOfPaymentText = (value: any): string => {
  const meansOfPaymentMap: { [key: number]: string } = {
    1: 'OPERATOR',
    2: 'SANALPOS',
    3: 'OTOMAT'
  };
  // Handle both string and number values
  let numValue: number;
  if (typeof value === 'string') {
    numValue = parseInt(value, 10);
  } else if (typeof value === 'number') {
    numValue = value;
  } else {
    return String(value || '');
  }
  return meansOfPaymentMap[numValue] || String(value || '');
};

const getTransactionTypeText = (value: any): string => {
  const transactionTypeMap: { [key: number]: string } = {
    1: 'YUKLEME/HARCAMA',
    2: 'ABONE GECIS',
    3: 'ILK GECIS',
    4: 'SONRAKI GECIS',
    5: 'İADE'
  };
  const numValue = typeof value === 'string' ? parseInt(value) : value;
  return transactionTypeMap[numValue] || String(value || '');
};

const getPaymentResultText = (value: any): string => {
  const paymentResultMap: { [key: number]: string } = {
    [-1]: 'YUKLEME TAMAMLA',
    0: 'BASARISIZ',
    1: 'BASARILI'
  };
  const numValue = typeof value === 'string' ? parseInt(value) : value;
  return paymentResultMap[numValue] || String(value || '');
};

// Helper function to get employee from PaymentOfVirtualPos or CafeteriaEvent
const getEmployee = (record: TableRow): any => {
  const paymentOfVirtualPos = record['PaymentOfVirtualPos'];
  if (paymentOfVirtualPos?.Employee) {
    return paymentOfVirtualPos.Employee;
  }
  const cafeteriaEvent = record['CafeteriaEvent'];
  if (cafeteriaEvent?.Employee) {
    return cafeteriaEvent.Employee;
  }
  return null;
};

export const tableColumns: TableColumn[] = [
  { 
    field: 'Id', 
    label: 'ID', 
    text: 'ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '80px', 
    size: '80px',
    min: 20,
    searchable: 'int' as ColumnType,
    resizable: true
  },
  { 
    field: 'Employee.IdentificationNumber', 
    searchField: 'PaymentOfVirtualPos.Employee.IdentificationNumber',
    label: 'TC Kimlik', 
    text: 'TC Kimlik',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      const employee = getEmployee(record);
      return employee?.IdentificationNumber || '';
    }
  },
  { 
    field: 'Employee.Name', 
    searchField: 'PaymentOfVirtualPos.Employee.Name',
    label: 'Ad', 
    text: 'Ad',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      const employee = getEmployee(record);
      return employee?.Name || '';
    }
  },
  { 
    field: 'Employee.SurName', 
    searchField: 'PaymentOfVirtualPos.Employee.SurName',
    label: 'Soyad', 
    text: 'Soyad',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      const employee = getEmployee(record);
      return employee?.SurName || '';
    }
  },
  { 
    field: 'Employee.EmployeeDepartments', 
    searchField: 'PaymentOfVirtualPos.Employee.EmployeeDepartments.Department.DepartmentName',
    label: 'Departman', 
    text: 'Departman',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '200px', 
    size: '200px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      const employee = getEmployee(record);
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
    field: 'Account.AccountName', 
    searchField: 'Account.AccountName',
    label: 'Hesap Adı', 
    text: 'Hesap Adı',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      const account = record['Account'];
      return account?.AccountName || '';
    }
  },
  { 
    field: 'Amount', 
    label: 'Tutar', 
    text: 'Tutar',
    type: 'float' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'float' as ColumnType,
    resizable: true,
    align: 'right',
    render: (record: TableRow) => {
      const amount = record['Amount'];
      if (amount !== undefined && amount !== null) {
        // Amount is in kuruş (cents), convert to TL
        const amountInTL = Number(amount) / 100;
        return amountInTL.toLocaleString('tr-TR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) + ' ₺';
      }
      return '0,00 ₺';
    }
  },
  { 
    field: 'PaymentType', 
    label: 'Ödeme Tipi', 
    text: 'Ödeme Tipi',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      // First try to get from PaymentType.Name (if joined)
      const paymentType = record['PaymentType'];
      if (paymentType?.Name) {
        return paymentType.Name;
      }
      // Otherwise use PaymentType numeric value with enum mapping
      const paymentTypeValue = record['PaymentType'];
      return getPaymentTypeText(paymentTypeValue);
    }
  },
  { 
    field: 'MeansOfPayment', 
    label: 'Ödeme Yöntemi', 
    text: 'Ödeme Yöntemi',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      return getMeansOfPaymentText(record['MeansOfPayment']);
    }
  },
  { 
    field: 'ResultStatus', 
    label: 'Durum', 
    text: 'Durum',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      return getPaymentResultText(record['ResultStatus']);
    }
  },
  { 
    field: 'Description', 
    label: 'Açıklama', 
    text: 'Açıklama',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'TransactionId', 
    label: 'İşlem ID', 
    text: 'İşlem ID',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'IsCancel', 
    label: 'Teknik İptal', 
    text: 'Teknik İptal',
    type: 'checkbox' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'checkbox' as ColumnType,
    resizable: true,
    align: 'center'
  }
];
