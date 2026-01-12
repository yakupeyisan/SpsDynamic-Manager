// CafeteriaEvents table columns configuration
import { TableColumn, ColumnType, TableRow } from 'src/app/components/data-table/data-table.component';

// TransactionType enum mapping
const getTransactionTypeText = (value: any): string => {
  if (value === null || value === undefined) return '';
  const typeMap: { [key: string]: string } = {
    '1': 'YUKLEME/HARCAMA',
    '2': 'ABONE GECIS',
    '3': 'ILK GECIS',
    '4': 'SONRAKI GECIS',
    '5': 'İADE'
  };
  return typeMap[String(value)] || String(value);
};

export const tableColumns: TableColumn[] = [
  { 
    field: 'CafeteriaEventID', 
    label: 'ID', 
    text: 'ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '100px', 
    size: '100px',
    min: 20,
    searchable: 'int' as ColumnType,
    resizable: true
  },
  { 
    field: 'Employee.IdentificationNumber', 
    searchField: 'Employee.IdentificationNumber',
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
      const employee = record['Employee'];
      return employee?.IdentificationNumber || '';
    }
  },
  { 
    field: 'Employee.Name', 
    searchField: 'Employee.Name',
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
      const employee = record['Employee'];
      return employee?.Name || '';
    }
  },
  { 
    field: 'Employee.SurName', 
    searchField: 'Employee.SurName',
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
      const employee = record['Employee'];
      return employee?.SurName || '';
    }
  },
  { 
    field: 'Employee.EmployeeDepartments', 
    searchField: 'Employee.EmployeeDepartments.Department.DepartmentName',
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
    field: 'TransactionType', 
    label: 'İşlem Tipi', 
    text: 'İşlem Tipi',
    type: 'enum' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'enum' as ColumnType,
    resizable: true,
    options: [
      { label: 'YUKLEME/HARCAMA', value: '1' },
      { label: 'ABONE GECIS', value: '2' },
      { label: 'ILK GECIS', value: '3' },
      { label: 'SONRAKI GECIS', value: '4' },
      { label: 'İADE', value: '5' }
    ],
    render: (record: TableRow) => {
      return getTransactionTypeText(record['TransactionType']);
    }
  },
  { 
    field: 'Qty', 
    label: 'Miktar', 
    text: 'Miktar',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '80px', 
    size: '80px',
    min: 20,
    searchable: 'int' as ColumnType,
    resizable: true,
    align: 'right'
  },
  { 
    field: 'Price', 
    label: 'Birim Fiyat', 
    text: 'Birim Fiyat',
    type: 'float' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'float' as ColumnType,
    resizable: true,
    align: 'right',
    render: (record: TableRow) => {
      const price = record['Price'];
      if (price !== undefined && price !== null) {
        const priceInTL = Number(price) / 100;
        return priceInTL.toLocaleString('tr-TR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) + ' ₺';
      }
      return '0,00 ₺';
    }
  },
  { 
    field: 'TotalPrice', 
    label: 'Toplam Fiyat', 
    text: 'Toplam Fiyat',
    type: 'float' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'float' as ColumnType,
    resizable: true,
    align: 'right',
    render: (record: TableRow) => {
      const totalPrice = record['TotalPrice'];
      if (totalPrice !== undefined && totalPrice !== null) {
        const totalPriceInTL = Number(totalPrice) / 100;
        return totalPriceInTL.toLocaleString('tr-TR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) + ' ₺';
      }
      return '0,00 ₺';
    }
  },
  { 
    field: 'LastBalance', 
    label: 'Son Bakiye', 
    text: 'Son Bakiye',
    type: 'float' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'float' as ColumnType,
    resizable: true,
    align: 'right',
    render: (record: TableRow) => {
      const balance = record['LastBalance'];
      if (balance !== undefined && balance !== null) {
        const balanceInTL = Number(balance) / 100;
        return balanceInTL.toLocaleString('tr-TR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) + ' ₺';
      }
      return '0,00 ₺';
    }
  },
  { 
    field: 'PaymentId', 
    label: 'Ödeme ID', 
    text: 'Ödeme ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '100px', 
    size: '100px',
    min: 20,
    searchable: 'int' as ColumnType,
    resizable: true
  },
  { 
    field: 'Payment.Amount', 
    searchField: 'Payment.Amount',
    label: 'Ödeme Tutarı', 
    text: 'Ödeme Tutarı',
    type: 'float' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'float' as ColumnType,
    resizable: true,
    align: 'right',
    render: (record: TableRow) => {
      const payment = record['Payment'];
      if (payment?.Amount !== undefined && payment?.Amount !== null) {
        const amountInTL = Number(payment.Amount) / 100;
        return amountInTL.toLocaleString('tr-TR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) + ' ₺';
      }
      return '';
    }
  },
  { 
    field: 'ProductName', 
    label: 'Ürün Adı', 
    text: 'Ürün Adı',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'ApplicationName', 
    label: 'Uygulama Adı', 
    text: 'Uygulama Adı',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'Location', 
    label: 'Konum', 
    text: 'Konum',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'DeviceSerial', 
    label: 'Cihaz Seri No', 
    text: 'Cihaz Seri No',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'EventTime', 
    label: 'Olay Zamanı', 
    text: 'Olay Zamanı',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'datetime' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      if (!record['EventTime']) return '';
      const dateTime = record['EventTime'];
      if (dateTime instanceof Date || (typeof dateTime === 'string' && dateTime.length > 0)) {
        const dateObj = new Date(dateTime);
        if (!isNaN(dateObj.getTime())) {
          return dateObj.toLocaleString('tr-TR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
        }
      }
      return String(dateTime || '');
    }
  },
  { 
    field: 'RecordTime', 
    label: 'Kayıt Zamanı', 
    text: 'Kayıt Zamanı',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'datetime' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      if (!record['RecordTime']) return '';
      const dateTime = record['RecordTime'];
      if (dateTime instanceof Date || (typeof dateTime === 'string' && dateTime.length > 0)) {
        const dateObj = new Date(dateTime);
        if (!isNaN(dateObj.getTime())) {
          return dateObj.toLocaleString('tr-TR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
        }
      }
      return String(dateTime || '');
    }
  },
  { 
    field: 'isOffline', 
    label: 'Çevrimdışı', 
    text: 'Çevrimdışı',
    type: 'checkbox' as ColumnType, 
    sortable: true, 
    width: '100px', 
    size: '100px',
    min: 20,
    searchable: 'checkbox' as ColumnType,
    resizable: true,
    align: 'center'
  },
  { 
    field: 'Note', 
    label: 'Not', 
    text: 'Not',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  }
];
