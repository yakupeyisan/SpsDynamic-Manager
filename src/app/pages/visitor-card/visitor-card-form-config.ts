// VisitorCard form configuration
import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

export const formFields: TableColumn[] = [
  {
    field: 'CardTypeID',
    label: 'Kart Tipi',
    text: 'Kart Tipi',
    type: 'list' as ColumnType,
    load: {
      url: `${apiUrl}/api/CardTypes`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        return (data?.records || []).map((item: any) => ({
          id: item.CardTypeID,
          text: item.CardType || item.CardTypeName || item.Name,
        }));
      },
    },
  },
  {
    field: 'CardCodeType',
    label: 'Kart Kullanım Tipi',
    text: 'Kart Kullanım Tipi',
    type: 'list' as ColumnType,
    load: {
      url: `${apiUrl}/api/CardCodeTypes`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        return data?.records
          ? data.records.map((item: any) => ({ id: item.id, text: item.text }))
          : [
              { id: 'Wiegand26', text: 'Wiegand26' },
              { id: 'Wiegand34', text: 'Wiegand34' },
              { id: 'MIFARE', text: 'MIFARE' },
            ];
      },
    },
  },
  {
    field: 'CardStatusId',
    label: 'Kart Statü',
    text: 'Kart Statü',
    type: 'list' as ColumnType,
    load: {
      url: `${apiUrl}/api/CardStatuses`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        return data?.records ? data.records.map((item: any) => ({ id: item.Id, text: item.Name })) : [];
      },
    },
  },
  {
    field: 'CafeteriaGroupID',
    label: 'Kafeterya Grup',
    text: 'Kafeterya Grup',
    type: 'list' as ColumnType,
    load: {
      url: `${apiUrl}/api/CafeteriaGroups`,
      injectAuth: true,
      method: 'POST' as const,
      data: { limit: -1, offset: 0 },
      map: (data: any) => {
        if (!data || !data.records || !Array.isArray(data.records)) return [];
        return data.records.map((item: any) => ({
          id: item.CafeteriaGroupID,
          text: item.CafeteriaGroupName || item.Name,
        }));
      },
    },
  },
  { field: 'TagCode', label: 'Tag Kodu', text: 'Tag Kodu', type: 'text' as ColumnType },
  { field: 'CardUID', label: 'CardUID', text: 'CardUID', type: 'text' as ColumnType },
  { field: 'CardCode', label: 'Kart Kodu', text: 'Kart Kodu', type: 'int' as ColumnType },
  { field: 'FacilityCode', label: 'FacilityCode', text: 'FacilityCode', type: 'text' as ColumnType },
  { field: 'Plate', label: 'Plaka', text: 'Plaka', type: 'text' as ColumnType },
  { field: 'TemporaryId', label: 'Geçici ID', text: 'Geçici ID', type: 'text' as ColumnType },
  { field: 'TemporaryDate', label: 'Geçici Tarih', text: 'Geçici Tarih', type: 'datetime' as ColumnType },
  { field: 'CardDesc', label: 'Kart Açıklaması', text: 'Kart Açıklaması', type: 'textarea' as ColumnType, fullWidth: true },
  { field: 'Status', label: 'Durum', text: 'Durum', type: 'checkbox' as ColumnType },
  { field: 'isDefined', label: 'Tanımlı', text: 'Tanımlı', type: 'checkbox' as ColumnType },
  { field: 'isVisitor', label: 'Ziyaretçi', text: 'Ziyaretçi', type: 'checkbox' as ColumnType, disabled: true },
];

export const formTabs: FormTab[] = [
  {
    label: 'Kart Bilgileri',
    fields: [
      'CardTypeID',
      'CardCodeType',
      'CardStatusId',
      'CafeteriaGroupID',
      'TagCode',
      'CardUID',
      'CardCode',
      'FacilityCode',
      'Plate',
      'TemporaryId',
      'TemporaryDate',
      'CardDesc',
      'Status',
      'isDefined',
      'isVisitor',
    ],
  },
];

export const formLoadUrl = `${apiUrl}/api/Cards/form`;

export const formLoadRequest = (recid: any) => ({
  action: 'get',
  recid: recid,
  name: 'EditCard',
});

export const formDataMapper = (apiRecord: any) => {
  const formData: any = { ...apiRecord };

  if (apiRecord.CardType?.CardTypeID) formData['CardTypeID'] = apiRecord.CardType.CardTypeID;
  if (apiRecord.CardStatus?.Id) formData['CardStatusId'] = apiRecord.CardStatus.Id;
  if (apiRecord.CafeteriaGroup?.CafeteriaGroupID) formData['CafeteriaGroupID'] = apiRecord.CafeteriaGroup.CafeteriaGroupID;

  // keep isVisitor stable for this screen
  if (formData['isVisitor'] == null && apiRecord.isVisitor != null) {
    formData['isVisitor'] = apiRecord.isVisitor;
  }

  return formData;
};

