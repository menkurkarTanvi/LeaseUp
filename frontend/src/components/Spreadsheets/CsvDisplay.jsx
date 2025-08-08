import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import axios from 'axios';
import '../../styles/Csv.css';

export default function CsvDisplay({ setSelectedUnitIds }) {
  const paginationModel = { page: 0, pageSize: 5 };

  // get_saved_apartments API call
  const [apartments, setApartments] = useState([]);
  const [rowSelectionModel] = new Set()
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [selectedIdNames, setSelectedIdNames] = useState(new Set())
  const [conversationList, setConversationList] = useState([]);

  const onRowsSelectionHandler = (ids) => {
    const rawIds = ids?.ids;
    const idSet = new Set(rawIds);
    setSelectedIds(ids)

    const names = new Set(
      apartments
        .filter((apt) => idSet.has(apt.id))
        .map((apt) => apt.name)
    );

    setSelectedIdNames(names);
    
    console.log('Selected IDs:', idSet);
    console.log('Selected Names:', Array.from(names));
  };


  //Save selected apartments when submitting to AI
  const handleSubmitAI = async() => {
    console.log('handle with AI')
    const namesArray = Array.from(selectedIdNames);

    try {
      const res = await fetch("http://localhost:8000/save_selected_names", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(namesArray),
      });

      const result = await res.json();
      console.log(result.message);

      await new Promise(resolve => setTimeout(resolve, 300));

      //Call AI: Send instruction to compare
      await axios.put(`http://localhost:8000/save_spreadsheet_conversation`, {
        question: "Compare the selected apartments.",
      });

      // Fetch and display conversation
      const convRes = await axios.get(`http://localhost:8000/get_spreadsheet_conversation`);
      setConversationList(convRes.data);
    } catch (err) {
      console.log("Failed to save selection:", err);
    }
  }

  useEffect(() => {
      const fetchData = async() => {
          try {
              const res = await fetch('http://localhost:8000/saved_apartments');
              const data = await res.json();
              if (!data || data.length === 0)
                  throw new Error("No data");
              setApartments(data);
          } catch (error) {
              console.error("GET APARTMENTS ERROR")
              const dummyData = [
              {
                "id": 0,
                "url": "https://housing.offcampus.utexas.edu/listing?property=71879",
                "name": "VIP Apartments",
                "price": 2300,
                "address": "101 E 33rd St, Austin, TX 78705",
                "latitude": 30.296979,
                "longitude": -97.735547,
                "beds": 3,
                "baths": 2,
                "lot_size_sqft": 1240,
                "description": "VIP APARTMENTS! North Campus on UT Shuttle and City Bus Route. Less than a mile from campus!!! Located right on the edge of the UT campus! Nearby coffee shops, restaurants, gym, clinic, fast food, and many other shopping options! Complimentary parking and onsite shared laundry facilities with mobile payment app! GOOGLE FIBER IS AVAILABLE!!! Pets allowed! Must have no criminal record. Lease Terms: 6 – 12 months",
                "listing_agent":"Spring Property Management",
                "contact": "(512) 205-3698",
                "amenities": ["Laundry","Fitness Center","Laundry: Hookups","Swimming Pool"],
                "lease_terms": ["Flexible","6-12 months"]
              },

              {
                "id": 1,
                "url": "https://housing.offcampus.utexas.edu/listing?property=32602/",
                "name": "Nueces (Cameron House)",
                "price": 1275,
                "address": "2222 Rio Grande St., Suite 200, Austin, TX 78705",
                "latitude": 30.286656,
                "longitude": -97.745099,
                "beds": 2,
                "baths": 2,
                "lot_size_sqft": 1233,
                "description": "Nueces House is a newer addition to The Quarters and one of the largest — eight stories featuring 235 apartments that is within walking distance to the University of Texas and two blocks from Guadalupe Street.",   
                "listing_agent":"Jay Eggspuehler",
                "contact": "(737) 377-1229",
                "amenities": ["Attached garage parking","Community pool","Coffee bar", "Game room"],
                "lease_terms": ["1 Year"]
              },];
              setApartments(dummyData);
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
                  onRowsSelectionHandler(ids)
              }}
              rowSelectionModel={rowSelectionModel}
              sx={{ border: 0 }}
          />
        </Paper>
        <Button 
          variant="outlined" id="submit-to-ai"
          onClick={handleSubmitAI}>
          Compare with AI
        </Button>
      </div>
  );
}

