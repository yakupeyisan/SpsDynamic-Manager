// ReportTasks form configuration
import { environment } from 'src/environments/environment';
import { TableColumn, ColumnType, FormTab } from 'src/app/components/data-table/data-table.component';

const apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;

export const formFields: TableColumn[] = [
  {
    field: 'ReportId',
    label: 'Rapor',
    text: 'Rapor',
    type: 'list' as ColumnType,
    fullWidth: true,
    disabled: true, // ReportTask ekranında sadece Name güncellensin
    load: {
      url: `${apiUrl}/api/ReportTemplates`,
      injectAuth: true,
      method: 'POST' as const,
      data: { page: 1, limit: 1000, offset: 0, showDeleted: false },
      map: (data: any) => {
        const records = Array.isArray(data?.records) ? data.records : [];
        return records.map((item: any) => ({
          id: item?.Id ?? item?.ID ?? item?.id,
          text: item?.Name ?? item?.name ?? String(item?.Id ?? item?.id ?? ''),
        })).filter((x: any) => x.id != null);
      },
    },
  },
  {
    field: 'Name',
    label: 'Görev Adı',
    text: 'Görev Adı',
    type: 'text' as ColumnType,
    fullWidth: true,
  },
  {
    field: 'Params',
    label: 'Parametreler',
    text: 'Parametreler',
    type: 'textarea' as ColumnType,
    fullWidth: true,
    disabled: true, // ReportTask ekranında sadece Name güncellensin
  },
];

export const formTabs: FormTab[] = [
  {
    label: 'Rapor Görevi',
    fields: ['ReportId', 'Name', 'Params'],
  },
];

export const formLoadUrl = `${apiUrl}/api/ReportTasks/form`;

export const formLoadRequest = (recid: any) => ({
  action: 'get',
  recid: recid,
  name: 'EditReportTask',
});

export const formDataMapper = (apiRecord: any) => {
  const formData: any = { ...apiRecord };
  return formData;
};

