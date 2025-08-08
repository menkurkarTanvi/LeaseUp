import { useState, useEffect } from 'react';
import { CSVLink } from 'react-csv';
import CsvDisplay from './CsvDisplay';
import '../../styles/Spreadsheet.css';
import ChatBox from './ChatBox';
import Button from '@mui/material/Button';
import '@fontsource/roboto/500.css';
import "./Spreadsheets.css";
import { useContext } from 'react';
import { ApartmentContext } from '../../contexts/ApartmentContext';
import {Typography} from '@mui/material';

export function Spreadsheets() {

    const { savedApartments } = useContext(ApartmentContext);
    
    const formattedData = savedApartments.map(apt => ({
        id: apt.id, 
        name: apt.name, 
        monthly_rent: apt.price, 
        address: apt.address, 
        beds: apt.beds, 
        baths: apt.baths,
        lot_size_sqft: apt.lot_size_sqft,
        listing_agent: apt.listing_agent, 
        amenities: Array.isArray(apt.amenities) ? apt.amenities.join(", ") : (typeof apt.amenities === 'string' ? apt.amenities : "No amenities"),
        contact_number: apt.contact, 

    }))


    return (
        <div className="sheetPage">
            <div id="sheet-container">
                <Typography id="page-title" variant="h5" sx={{ textAlign: 'center', marginBottom: 2 }}>My Listings</Typography>

                <CsvDisplay id="csv-display" rows={formattedData}  />
                    <CSVLink 
                        id="download-link"
                        data={formattedData}
                        filename={"LeaseUp_Listings.csv"}
                    >
                        <Button 
                            variant="outlined" 
                            size="medium" 
                            sx={{ 
                                borderColor: 'black', 
                                color: 'black',
                                mt: 2,          
                                px: 3,           
                                py: 1,           
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                '&:hover': {
                                    borderColor: 'black',
                                    backgroundColor: '#f0f0f0',
                                }
                            }}
                        >
                            Download
                        </Button>
                    </CSVLink>
                {/* {selectedUnitIds.length > 1 && <Button variant="contained" id="submit-to-ai">Compare with AI</Button>} */}
            </div>
            <div id="chat-box">
                {/* <ChatBox selectedUnits={selectedUnitIds} /> */}
            </div>
        </div>
    );
}
