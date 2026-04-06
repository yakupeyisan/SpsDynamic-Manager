// PaymentsOfVirtualPos table columns configuration
import { TableColumn, ColumnType, TableRow } from 'src/app/components/data-table/data-table.component';

export const tableColumns: TableColumn[] = [
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
    field: 'Payment.AccountId',
    searchField: 'Payment.AccountId',
    label: 'Hesap ID',
    text: 'Hesap ID',
    type: 'int' as ColumnType,
    sortable: true,
    width: '100px',
    size: '100px',
    min: 20,
    searchable: 'int' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      const payment = record['Payment'];
      const v = payment?.AccountId;
      return v !== undefined && v !== null ? String(v) : '';
    }
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
    field: 'Payment.PaymentType',
    searchField: 'Payment.PaymentType',
    label: 'Ödeme Türü',
    text: 'Ödeme Türü',
    type: 'int' as ColumnType,
    sortable: true,
    width: '100px',
    size: '100px',
    min: 20,
    searchable: 'int' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      const payment = record['Payment'];
      const v = payment?.PaymentType;
      return v !== undefined && v !== null ? String(v) : '';
    }
  },
  {
    field: 'Payment.PayeeId',
    searchField: 'Payment.PayeeId',
    label: 'Ödeme Ayarı (Payee)',
    text: 'Ödeme Ayarı (Payee)',
    type: 'int' as ColumnType,
    sortable: true,
    width: '120px',
    size: '120px',
    min: 20,
    searchable: 'int' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      const payment = record['Payment'];
      const v = payment?.PayeeId;
      return v !== undefined && v !== null ? String(v) : '';
    }
  },
  {
    field: 'Payment.ResultStatus',
    searchField: 'Payment.ResultStatus',
    label: 'Ödeme Sonucu',
    text: 'Ödeme Sonucu',
    type: 'text' as ColumnType,
    sortable: true,
    width: '120px',
    size: '120px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      const payment = record['Payment'];
      const raw = payment?.ResultStatus;
      if (raw === undefined || raw === null || raw === '') return '';
      if (raw === 1 || raw === '1' || raw === true) return 'Başarılı';
      if (raw === 0 || raw === '0' || raw === false) return 'Başarısız / bekliyor';
      return String(raw);
    }
  },
  {
    field: 'Payment.Description',
    searchField: 'Payment.Description',
    label: 'Ödeme Açıklaması',
    text: 'Ödeme Açıklaması',
    type: 'text' as ColumnType,
    sortable: true,
    width: '220px',
    size: '220px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      const payment = record['Payment'];
      return payment?.Description != null ? String(payment.Description) : '';
    }
  },
  {
    field: 'Payment.MeansOfPayment',
    searchField: 'Payment.MeansOfPayment',
    label: 'Ödeme Aracı',
    text: 'Ödeme Aracı',
    type: 'text' as ColumnType,
    sortable: true,
    width: '110px',
    size: '110px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      const payment = record['Payment'];
      return payment?.MeansOfPayment != null ? String(payment.MeansOfPayment) : '';
    }
  },
  {
    field: 'Payment.IsCancel',
    searchField: 'Payment.IsCancel',
    label: 'Ödeme İptal',
    text: 'Ödeme İptal',
    type: 'checkbox' as ColumnType,
    sortable: true,
    width: '110px',
    size: '110px',
    min: 20,
    searchable: 'checkbox' as ColumnType,
    resizable: true,
    align: 'center'
  },
  {
    field: 'Payment.TransactionId',
    searchField: 'Payment.TransactionId',
    label: 'İşlem No (Payment)',
    text: 'İşlem No (Payment)',
    type: 'text' as ColumnType,
    sortable: true,
    width: '140px',
    size: '140px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      const payment = record['Payment'];
      return payment?.TransactionId != null ? String(payment.TransactionId) : '';
    }
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
    field: 'NameOfBank', 
    label: 'Banka Adı', 
    text: 'Banka Adı',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'CardHolderName', 
    label: 'Kart Sahibi', 
    text: 'Kart Sahibi',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'MaskedCreditCard', 
    label: 'Maskelenmiş Kart', 
    text: 'Maskelenmiş Kart',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'Response', 
    label: 'Yanıt', 
    text: 'Yanıt',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'AuthCode', 
    label: 'Yetkilendirme Kodu', 
    text: 'Yetkilendirme Kodu',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'text' as ColumnType,
    resizable: true
  },
  { 
    field: 'ProcessTime', 
    label: 'İşlem Zamanı', 
    text: 'İşlem Zamanı',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    min: 20,
    searchable: 'datetime' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      if (!record['ProcessTime']) return '';
      const dateTime = record['ProcessTime'];
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
    field: 'ValorDate', 
    label: 'Valör Tarihi', 
    text: 'Valör Tarihi',
    type: 'date' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    min: 20,
    searchable: 'date' as ColumnType,
    resizable: true,
    render: (record: TableRow) => {
      if (!record['ValorDate']) return '';
      const date = record['ValorDate'];
      if (date instanceof Date || (typeof date === 'string' && date.length > 0)) {
        const dateObj = new Date(date);
        if (!isNaN(dateObj.getTime())) {
          return dateObj.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });
        }
      }
      return String(date || '');
    }
  },
  { 
    field: 'IsSuccess', 
    label: 'Başarılı', 
    text: 'Başarılı',
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
  }
];
