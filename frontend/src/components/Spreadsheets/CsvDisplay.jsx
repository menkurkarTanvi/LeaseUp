import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import axios from 'axios';
import '../../styles/Csv.css';

export default function CsvDisplay({ setSelectedUnitIds }) {
  const paginationModel = { page: 0, pageSize: 5 };

  const [apartments, setApartments] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectedIdNames, setSelectedIdNames] = useState(new Set());
  const [conversationList, setConversationList] = useState([]);

  const onRowsSelectionHandler = (ids) => {
    const rawIds = ids?.ids || [];
    const idSet = new Set(rawIds);
    setSelectedIds(idSet);

    const names = new Set(
      apartments
        .filter((apt) => idSet.has(apt.id))
        .map((apt) => apt.name)
    );

    setSelectedIdNames(names);

    console.log('Selected IDs:', Array.from(idSet));
    console.log('Selected Names:', Array.from(names));
  };

  // Submit selected apartments to AI for comparison
  const handleSubmitAI = async () => {
    const namesArray = Array.from(selectedIdNames);

    try {
      const res = await fetch("http://localhost:8000/save_selected_names", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(namesArray),
      });
      const result = await res.json();
      console.log(result.message);

      // Wait a bit for backend to process
      await new Promise(resolve => setTimeout(resolve, 300));

      // Trigger AI comparison request
      await axios.put(`http://localhost:8000/save_spreadsheet_conversation`, {
        question: "Compare the selected apartments.",
      });

      // Fetch AI conversation results
      const convRes = await axios.get(`http://localhost:8000/get_spreadsheet_conversation`);
      setConversationList(convRes.data);
    } catch (err) {
      console.error("Failed to save selection or fetch AI response:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:8000/saved_apartments');
        const data = await res.json();
        if (!data || data.length === 0) {
          throw new Error("No data");
        }
        setApartments(data);
      } catch (error) {
        console.error("GET APARTMENTS ERROR", error);
        // Optional: You can decide not to set dummy data here so it won't show fake apartments
        setApartments([]); 
      }
    };

    fetchData();
  }, []);

  // Map backend data to DataGrid rows
  const apartmentRows = apartments.map((apt) => ({
    id: apt.id,
    name: apt.name,
    price: apt.price,
    address: apt.address,
    beds: apt.beds,
    baths: apt.baths,
    lot_size_sqft: apt.lot_size_sqft,
    listing_agent: apt.listing_agent,
    contact: apt.contact,
    amenities: Array.isArray(apt.amenities) ? apt.amenities.join(', ') : apt.amenities || '',
    lease_terms: Array.isArray(apt.lease_terms) ? apt.lease_terms.join(', ') : apt.lease_terms || '',
  }));

  const apartmentColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 180 },
    { field: 'price', headerName: 'Monthly Rent', type: 'number', width: 130 },
    { field: 'address', headerName: 'Address', width: 300 },
    { field: 'beds', headerName: 'Beds', type: 'number', width: 90 },
    { field: 'baths', headerName: 'Baths', type: 'number', width: 90 },
    { field: 'lot_size_sqft', headerName: 'Sqft', type: 'number', width: 120 },
    { field: 'listing_agent', headerName: 'Listing Agent', width: 180 },
    { field: 'contact', headerName: 'Contact', width: 140 },
    {
      field: 'amenities',
      headerName: 'Amenities',
      type: 'string',
      width: 600,
    },
    {
      field: 'lease_terms',
      headerName: 'Lease Terms',
      type: 'string',
      width: 200,
    },
  ];

  return (
    <div id="csv-display-container">
      <Paper id="csv-display" sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={apartmentRows}
          columns={apartmentColumns}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[5, 10]}
          checkboxSelection
          onRowSelectionModelChange={(ids) => {
            onRowsSelectionHandler(ids);
          }}
          sx={{ border: 0 }}
        />
      </Paper>
      <Button
        variant="outlined"
        id="submit-to-ai"
        onClick={handleSubmitAI}
        disabled={selectedIdNames.size === 0}
      >
        Compare with AI
      </Button>
    </div>
  );
}
