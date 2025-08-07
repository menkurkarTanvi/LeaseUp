import { useState, useEffect } from 'react';
import { CSVLink } from 'react-csv';
import CsvDisplay from './CsvDisplay';
import '../../styles/Spreadsheet.css';
import ChatBox from './ChatBox';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import '@fontsource/roboto/500.css';
import "./Spreadsheets.css";


export default function Spreadsheets() {
    const [apartments, setApartments] = useState([]);
    const [selectedUnitIds, setSelectedUnitIds] = useState([]);

    useEffect(() => {
        const fetchApartments = async () => {
            try {
                const res = await fetch('http://localhost:8000/saved_apartments');
                const data = await res.json();
                if (!data || data.length === 0) throw new Error("No data");
                setApartments(data);
            } catch (error) {
                console.error("GET APARTMENTS ERROR", error);
                const dummyData = [
                    {
                        id: 0,
                        url: "https://housing.offcampus.utexas.edu/listing?property=71879",
                        name: "VIP Apartments",
                        price: 2300,
                        address: "101 E 33rd St, Austin, TX 78705",
                        latitude: 30.296979,
                        longitude: -97.735547,
                        beds: 3,
                        baths: 2,
                        lot_size_sqft: 1240,
                        description: "VIP APARTMENTS! ...",
                        listing_agent: "Spring Property Management",
                        contact: "(512) 205-3698",
                        amenities: ["Laundry", "Fitness Center", "Laundry: Hookups", "Swimming Pool"],
                        lease_terms: ["Flexible", "6-12 months"]
                    },
                    {
                        id: 1,
                        url: "https://housing.offcampus.utexas.edu/listing?property=32602/",
                        name: "Nueces (Cameron House)",
                        price: 1275,
                        address: "2222 Rio Grande St., Suite 200, Austin, TX 78705",
                        latitude: 30.286656,
                        longitude: -97.745099,
                        beds: 2,
                        baths: 2,
                        lot_size_sqft: 1233,
                        description: "Nueces House is a newer addition...",
                        listing_agent: "Jay Eggspuehler",
                        contact: "(737) 377-1229",
                        amenities: ["Attached garage parking", "Community pool", "Coffee bar", "Game room"],
                        lease_terms: ["1 Year"]
                    }
                ];
                setApartments(dummyData);
            }
        };

        fetchApartments();
    }, []);

    useEffect(() => {
    console.log("Selected rows:", selectedUnitIds);
    }, [selectedUnitIds]);


    return (
        <div className="sheetPage">
            <div id="sheet-container">
                <Typography id="page-title" variant="h5">My Listings</Typography>
                <CsvDisplay id="csv-display" setSelectedUnitIds={setSelectedUnitIds} />
                    <CSVLink 
                        id="download-link"
                        data={apartments}
                        filename={"LeaseUp_Listings.csv"}
                    >
                    <Button variant="contained" id="download-button">Download</Button>
                    </CSVLink>
                {selectedUnitIds.length > 1 && <Button variant="contained" id="submit-to-ai">Compare with AI</Button>}
            </div>
            <div id="chat-box">
                <ChatBox selectedUnits={selectedUnitIds} />
            </div>
        </div>
    );
}
