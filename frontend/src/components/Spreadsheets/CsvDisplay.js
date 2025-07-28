import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import '../../styles/Csv.css';

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'address', headerName: 'Address', width: 130 },
  { field: 'monthlyRent', headerName: 'Monthly Rent', type: 'number', width: 130 },
  {
    field: 'amenities',
    headerName: 'Amenities',
    type: 'list',
    width: 90,
  },
];

const rows = [
  { id: 1, address: '123 East Drive Street', monthlyRent: 750, amenities: ['In-Unit Laundry', 'Gym'] },
  { id: 2, address: '456 West Street Road', monthlyRent: 900, amenities: ['Coffee shop', 'Swimming pool', 'Free parking']},
];

const paginationModel = { page: 0, pageSize: 5 };

export default function CsvDisplay() {
  return (
        <Paper id="csv-display" sx={{ height: 400, width: '100%' }}>
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
