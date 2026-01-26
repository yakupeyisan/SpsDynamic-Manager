// CustomFieldSettings form configuration
import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

// Custom form fields for add/edit form
export const formFields: TableColumn[] = [
  { 
    field: 'Field', 
    label: 'Alan', 
    text: 'Alan', 
    type: 'text' as ColumnType,
    disabled: true,
    fullWidth: true
  },
  { 
    field: 'Text', 
    label: 'Metin', 
    text: 'Metin', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'Type', 
    label: 'Tip', 
    text: 'Tip', 
    type: 'text' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'IsVisible', 
    label: 'Görünür', 
    text: 'Görünür', 
    type: 'checkbox' as ColumnType,
    fullWidth: true
  },
  { 
    field: 'IsDisable', 
    label: 'Devre Dışı', 
    text: 'Devre Dışı', 
    type: 'checkbox' as ColumnType,
    fullWidth: true
  }
];

// Form tabs configuration
export const formTabs: FormTab[] = [
  { 
    label: 'Özel Alan Bilgileri', 
    fields: ['Field', 'Text', 'Type', 'IsVisible', 'IsDisable', 'Options'] 
  }
];

// Form load URL
export const formLoadUrl = `${apiUrl}/api/CustomFieldSettings/form`;

// Form load request builder
export const formLoadRequest = (recid: any) => ({
  action: 'get',
  recid: recid,
  name: 'EditCustomFieldSettings'
});

// Form data mapper - maps API response to form data
export const formDataMapper = (apiRecord: any) => {
  const formData: any = { ...apiRecord };
  return formData;
};
