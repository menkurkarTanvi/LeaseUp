import { CSVLink } from 'react-csv';
import CsvDisplay from './CsvDisplay';
import '../../styles/Spreadsheet.css';
import ChatBox from './ChatBox';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import '@fontsource/roboto/500.css';

export default function Spreadsheets() {
    // Array of literal objects. Each item is rendered as CSV line however the order of fields will be defined by the headers props. If the headers props are not defined, the component will generate headers from each data item.
    const dummyData = [
  { id: 1, address: '123 East Drive Street', monthlyRent: 750, amenities: ['In-Unit Laundry', 'Gym'] },
  { id: 2, address: '456 West Street Road', monthlyRent: 900, amenities: ['Coffee shop', 'Swimming pool', 'Free parking']},
    ];

    const [selectedUnitIds, setSelectedUnitIds] = useState([]);

    return (
        <div className="sheetPage">
            <div id="sheet-container">
                <Typography id="page-title" variant="h5">My Listings</Typography>
                <CsvDisplay id="csv-display" setSelectedUnitIds={setSelectedUnitIds} />
                    <CSVLink 
                        id="download-link"
                        data={dummyData}
                        filename={"LeaseUp_Listings.csv"}
                    >
                    <Button variant="contained" id="download-button">Download</Button>
                    </CSVLink>
            </div>
            <div id="chat-box">
                <ChatBox selectedUnits={selectedUnitIds} />
            </div>
        </div>
    );
}
