import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import '../../styles/Csv.css';

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: 'Name', width: 150 },
  { field: 'address', headerName: 'Address', width: 300 },
  { field: 'monthly_rent', headerName: 'Monthly Rent', type: 'number', width: 130 },
  { field: 'beds', headerName: 'Beds', type: 'number', width: 90 },
  { field: 'baths', headerName: 'Baths', type: 'number', width: 90 },
  { field: 'lot_size_sqft', headerName: 'Lot Size (sqft)', type: 'number', width: 130 },
  { field: 'listing_agent', headerName: 'Listing Agent', width: 150 },
  { field: 'amenities', headerName: 'Amenities', width: 800 },
  { field: 'contact_number', headerName: 'Contact Number', type: 'number', width: 150 },
];


const paginationModel = { page: 0, pageSize: 5 };

export default function CsvDisplay({rows}) {
  return (
        <Paper id="csv-display" sx={{ height: 500, width: '1000' }}>
          <DataGrid
              rows={rows}
              columns={columns}
              initialState={{ pagination: { paginationModel } }}
              pageSizeOptions={[5, 10]}
              checkboxSelection
              sx={{ border: 0 }}
          />
        </Paper>
  );
}
