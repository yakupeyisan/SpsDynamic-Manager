// CafeteriaEvents form configuration
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';
import { environment } from 'src/environments/environment';

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

// Custom form fields for view form (read-only for reports)
export const formFields: TableColumn[] = [
  { 
    field: 'CafeteriaEventID', 
    label: 'ID', 
    text: 'ID', 
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
    field: 'TransactionType', 
    label: 'İşlem Tipi', 
    text: 'İşlem Tipi', 
    type: 'enum' as ColumnType,
    fullWidth: true,
    disabled: true,
    options: [
      { label: 'YUKLEME/HARCAMA', value: '1' },
      { label: 'ABONE GECIS', value: '2' },
      { label: 'ILK GECIS', value: '3' },
      { label: 'SONRAKI GECIS', value: '4' },
      { label: 'İADE', value: '5' }
    ],
    render: (record: any) => {
      return getTransactionTypeText(record['TransactionType']);
    }
  },
  { 
    field: 'Qty', 
    label: 'Miktar', 
    text: 'Miktar', 
    type: 'int' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'Price', 
    label: 'Birim Fiyat', 
    text: 'Birim Fiyat', 
    type: 'float' as ColumnType,
    fullWidth: true,
    disabled: true,
    render: (record: any) => {
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
    fullWidth: true,
    disabled: true,
    render: (record: any) => {
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
    fullWidth: true,
    disabled: true,
    render: (record: any) => {
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
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'Payment.Amount', 
    label: 'Ödeme Tutarı', 
    text: 'Ödeme Tutarı', 
    type: 'float' as ColumnType,
    fullWidth: true,
    disabled: true,
    render: (record: any) => {
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
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'ApplicationName', 
    label: 'Uygulama Adı', 
    text: 'Uygulama Adı', 
    type: 'text' as ColumnType,
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
  },
  { 
    field: 'DeviceSerial', 
    label: 'Cihaz Seri No', 
    text: 'Cihaz Seri No', 
    type: 'text' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'EventTime', 
    label: 'Olay Zamanı', 
    text: 'Olay Zamanı', 
    type: 'datetime' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'RecordTime', 
    label: 'Kayıt Zamanı', 
    text: 'Kayıt Zamanı', 
    type: 'datetime' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'isOffline', 
    label: 'Çevrimdışı', 
    text: 'Çevrimdışı', 
    type: 'checkbox' as ColumnType,
    fullWidth: true,
    disabled: true
  },
  { 
    field: 'Note', 
    label: 'Not', 
    text: 'Not', 
    type: 'textarea' as ColumnType,
    fullWidth: true,
    disabled: true
  }
];

export const formTabs: FormTab[] = [
  {
    label: 'Genel Bilgiler',
    fields: ['CafeteriaEventID', 'EmployeeID', 'Employee.IdentificationNumber', 'Employee.Name', 'Employee.SurName', 'Employee.EmployeeDepartments', 'TransactionType', 'Qty', 'Price', 'TotalPrice', 'LastBalance', 'PaymentId', 'Payment.Amount', 'ProductName', 'ApplicationName', 'Location', 'DeviceSerial', 'EventTime', 'RecordTime', 'isOffline', 'Note']
  }
];

export const formLoadUrl = `${environment.apiUrl}/api/CafeteriaEvents`;
export const formLoadRequest = (recid: any) => ({
  recid: recid
});

export const formDataMapper = (apiRecord: any): any => {
  return apiRecord;
};
