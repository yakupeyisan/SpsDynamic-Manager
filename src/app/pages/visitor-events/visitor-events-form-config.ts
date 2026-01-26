// VisitorEvents form configuration
import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

// Custom form fields for add/edit form
export const formFields: TableColumn[] = [
  { 
    field: 'VisitorEmployeeID', 
    label: 'Ziyaretçi', 
    text: 'Ziyaretçi', 
    // NOTE: prevent /api/Employees request on page load (form options are loaded eagerly by DataTable)
    type: 'int' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'VisitorCardID', 
    label: 'Ziyaretçi Kart ID', 
    text: 'Ziyaretçi Kart ID', 
    type: 'int' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'VisitorCompany', 
    label: 'Ziyaretçi Firma', 
    text: 'Ziyaretçi Firma', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'VisitedCompany', 
    label: 'Ziyaret Edilen Firma', 
    text: 'Ziyaret Edilen Firma', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'VisitedEmployeeID', 
    label: 'Ziyaret Edilen Kişi', 
    text: 'Ziyaret Edilen Kişi', 
    // NOTE: prevent /api/Employees request on page load (form options are loaded eagerly by DataTable)
    type: 'int' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'Description', 
    label: 'Açıklama', 
    text: 'Açıklama', 
    type: 'textarea' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'AccessGroupName', 
    label: 'Erişim Grubu', 
    text: 'Erişim Grubu', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'TerminalDetails', 
    label: 'Terminal Detayları', 
    text: 'Terminal Detayları', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'InDate', 
    label: 'Giriş Tarihi', 
    text: 'Giriş Tarihi', 
    type: 'datetime' as ColumnType,
    fullWidth: false
  },
  { 
    field: 'OutDate', 
    label: 'Çıkış Tarihi', 
    text: 'Çıkış Tarihi', 
    type: 'datetime' as ColumnType,
    fullWidth: false
  }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  { 
    label: 'Ziyaret Bilgileri', 
    fields: ['VisitorEmployeeID', 'VisitorCardID', 'VisitorCompany', 'VisitedCompany', 'VisitedEmployeeID', 'Description', 'AccessGroupName', 'TerminalDetails', 'InDate', 'OutDate'] 
  }
];

// Form load URL
export const formLoadUrl = `${apiUrl}/api/VisitorEvents/form`;

// Form load request builder
export const formLoadRequest = (recid: any) => ({
  action: 'get',
  recid: recid,
  name: 'EditVisitorEvent'
});

// Form data mapper - maps API response to form data
export const formDataMapper = (apiRecord: any) => {
  const formData: any = { ...apiRecord };
  
  // Map nested VisitorEmployee object to VisitorEmployeeID field
  if (apiRecord.VisitorEmployee && (apiRecord.VisitorEmployee.EmployeeID || apiRecord.VisitorEmployee.Id)) {
    formData['VisitorEmployeeID'] = apiRecord.VisitorEmployee.EmployeeID || apiRecord.VisitorEmployee.Id;
  }
  
  // Map nested VisitedEmployee object to VisitedEmployeeID field
  if (apiRecord.VisitedEmployee && (apiRecord.VisitedEmployee.EmployeeID || apiRecord.VisitedEmployee.Id)) {
    formData['VisitedEmployeeID'] = apiRecord.VisitedEmployee.EmployeeID || apiRecord.VisitedEmployee.Id;
  }
  
  return formData;
};
