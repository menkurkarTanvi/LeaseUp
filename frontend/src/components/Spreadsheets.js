import React from 'react';
import { CSVLink } from 'react-csv';
import CsvDisplay from './CsvDisplay';
import '../styles/Spreadsheet.css';

export function Spreadsheets() {
    // Array of literal objects. Each item is rendered as CSV line however the order of fields will be defined by the headers props. If the headers props are not defined, the component will generate headers from each data item.
    const dummyData = [
  { id: 1, address: '123 East Drive Street', monthlyRent: 750, amenities: ['In-Unit Laundry', 'Gym'] },
  { id: 2, address: '456 West Street Road', monthlyRent: 900, amenities: ['Coffee shop', 'Swimming pool', 'Free parking']},
    ];

    return (
        <div id="sheet-container">
            <CSVLink 
                id="download-link"
                data={dummyData}
                filename={"LeaseUp_Listings.csv"}
            >
            Download
            </CSVLink>
            <CsvDisplay/>
        </div>
    );
}

export default Spreadsheets;