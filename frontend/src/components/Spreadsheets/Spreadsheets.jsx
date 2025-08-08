import { CSVLink } from 'react-csv';
import CsvDisplay from './CsvDisplay';
import '../../styles/Spreadsheet.css';
import ChatBox from './ChatBox';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import '@fontsource/roboto/500.css';
import "./Spreadsheets.css";
import { useContext } from 'react';
import { ApartmentContext } from '../../contexts/ApartmentContext';


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
                {/* <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <Typography id="page-title" variant="h5" sx={{ textAlign: 'center', marginBottom: 2 }}>My Listings</Typography>
                </div> */}
                <Typography id="page-title" variant="h5" sx={{ textAlign: 'center', marginBottom: 2 }}>My Listings</Typography>

                <CsvDisplay id="csv-display" rows={formattedData} />
                    <CSVLink 
                        id="download-link"
                        data={formattedData}
                        filename={"LeaseUp_Listings.csv"}
                    >
                    <Button variant="contained" id="download-button">Download</Button>
                    </CSVLink>
            </div>
            <div id="chat-box">
                <ChatBox/>
            </div>
        </div>
    );
}

export default Spreadsheets;