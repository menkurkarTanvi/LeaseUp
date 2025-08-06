import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import '../../styles/Csv.css';

export default function CsvDisplay({ setSelectedUnitIds }) {
  const paginationModel = { page: 0, pageSize: 5 };

  // get_saved_apartments API call
  const [apartments, setApartments] = useState([]);
  const [rowSelectionModel, setRowSelectionModel] = useState([]);

  useEffect(() => {
      const fetchData = async() => {
          try {
              const res = await fetch('http://localhost:8000/saved_apartments');
              const data = await res.json();
              setApartments(data);
          } catch (error) {
              console.error("GET APARTMENTS ERROR")
          }
      };

      fetchData();
  }, []);

  const apartmentRows = apartments.map((apt) => ({
    id: apt.id,
    name: apt.name,
    address: apt.address,
    price: apt.price,
    beds: apt.beds,
    baths: apt.baths,
    lot_size_sqft: apt.lot_size_sqft,
    listing_agent: apt.listing_agent,
    contact: apt.contact,
    amenities: apt.amenities.join(', '),
    lease_terms: apt.lease_terms.join(', ') 
  }));

  const apartmentColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 180 },
    { field: 'price', headerName: 'Monthly Rent', type: 'number', width: 130 },
    { field: 'address', headerName: 'Address', width: 200 },
    { field: 'latitude', headerName: 'Latitude', type: 'number', width: 130 },
    { field: 'longitude', headerName: 'Longitude', type: 'number', width: 130 },
    { field: 'beds', headerName: 'Beds', type: 'number', width: 90 },
    { field: 'baths', headerName: 'Baths', type: 'number', width: 90 },
    { field: 'lot_size_sqft', headerName: 'Sqft', type: 'number', width: 120 },
    { field: 'listing_agent', headerName: 'Listing Agent', width: 180 },
    { field: 'contact', headerName: 'Contact', width: 140 },
    {
      field: 'amenities',
      headerName: 'Amenities',
      type: 'string',
      width: 200,
    },
    {
      field: 'lease_terms',
      headerName: 'Lease Terms',
      type: 'string',
      width: 200,
    }
  ];

  useEffect(() => {
  console.log(apartments);
}, [apartments]);


  useEffect(() => {
    setSelectedUnitIds(rowSelectionModel); // <- Pass only the IDs
  }, [rowSelectionModel, setSelectedUnitIds]);

  return (
        <Paper id="csv-display" sx={{ height: 400, width: '100%' }}>
          <DataGrid
              rows={apartmentRows}
              columns={apartmentColumns}
              initialState={{ pagination: { paginationModel } }}
              pageSizeOptions={[5, 10]}
              checkboxSelection
              onRowSelectionModelChange={setRowSelectionModel}
              rowSelectionModel={rowSelectionModel}
              sx={{ border: 0 }}
          />
        </Paper>
  );
}



//CREATE MOCK DATA FOR SELECTED APARTMENTS