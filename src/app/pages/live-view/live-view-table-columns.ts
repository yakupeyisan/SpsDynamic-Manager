// LiveView table columns configuration
import { TableColumn, ColumnType } from 'src/app/components/data-table/data-table.component';

export const tableColumns: TableColumn[] = [
  { 
    field: 'Id', 
    label: 'ID', 
    text: 'ID',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '40px', 
    size: '40px',
    searchable: 'int',
    resizable: true
  },
  { 
    field: 'PictureID', 
    label: 'Resim', 
    text: 'Resim',
    type: 'text' as ColumnType, 
    sortable: false, 
    width: '80px', 
    size: '80px',
    searchable: false,
    resizable: true,
    render: (record: any) => {
      if (record.PictureID) {
        // Check if PictureID is already HTML (contains <img tag)
        if (typeof record.PictureID === 'string' && record.PictureID.includes('<img')) {
          // Extract src from HTML if needed, or return as-is
          // For now, return the HTML as-is since it's already formatted
          return record.PictureID;
        }
        // If it's a URL, wrap it in img tag
        return `<img src="${record.PictureID}" style="height: 80px; width: 80px; object-fit: cover; border-radius: 4px;" />`;
      }
      return '';
    }
  },
  { 
    field: 'Name', 
    label: 'Adı', 
    text: 'Adı',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'SurName', 
    label: 'Soyad', 
    text: 'Soyad',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '120px', 
    size: '120px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'PdksCompanyName', 
    label: 'Firma Adı', 
    text: 'Firma Adı',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'ReaderName', 
    label: 'Kapı', 
    text: 'Kapı',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '200px', 
    size: '200px',
    searchable: 'text',
    resizable: true
  },
  { 
    field: 'Card.FacilityCode', 
    label: 'Bina Kodu', 
    text: 'Bina Kodu',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '50px', 
    size: '50px',
    searchable: 'text',
    resizable: true,
    render: (record: any) => record.Card?.FacilityCode || ''
  },
  { 
    field: 'Card.CardCode', 
    label: 'Kart Kodu', 
    text: 'Kart Kodu',
    type: 'int' as ColumnType, 
    sortable: true, 
    width: '80px', 
    size: '80px',
    searchable: 'int',
    resizable: true,
    render: (record: any) => record.Card?.CardCode || ''
  },
  { 
    field: 'Message', 
    label: 'Mesaj', 
    text: 'Mesaj',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    searchable: 'text',
    resizable: true,
    render: (record: any) => {
      if (record.Message) {
        // Return Message as-is (may contain HTML like </br>)
        // The data-table component will detect HTML and render it properly
        return record.Message;
      }
      return '';
    }
  },
  { 
    field: 'Tarih', 
    label: 'Tarih', 
    text: 'Tarih',
    type: 'datetime' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    searchable: 'datetime',
    resizable: true
  },
  { 
    field: 'DepartmentName', 
    label: 'Departman Adı', 
    text: 'Departman Adı',
    type: 'text' as ColumnType, 
    sortable: true, 
    width: '150px', 
    size: '150px',
    searchable: 'text',
    resizable: true
  }
];
