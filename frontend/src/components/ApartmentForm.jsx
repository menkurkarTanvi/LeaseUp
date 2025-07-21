
import { TextField, Container, 
    FormControl, InputLabel, Select, MenuItem, Box, FormLabel, Chip} from '@mui/material';
import { useFormik } from 'formik';
import { useState } from 'react';
import ApartmentPriceRange from './ApartmentPriceRange';


// dummy data before API usage -- geoDB by cities
const countries = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
  ];
  
  const statesByCountry = {
    US: ['California', 'Texas', 'New York'],
    CA: ['Ontario', 'Quebec', 'British Columbia'],
  };

  const citiesByState = {
    California: ['Los Angeles', 'San Francisco', 'San Diego'],
    Texas: ['Houston', 'Austin', 'Dallas'],
    'New York': ['New York City', 'Buffalo', 'Rochester'],
    Ontario: ['Toronto', 'Ottawa', 'Hamilton'],
    Quebec: ['Montreal', 'Quebec City', 'Laval'],
    'British Columbia': ['Vancouver', 'Victoria', 'Kelowna'],
  };

  const colleges = {
    "Ohio State University": {
      city: "Columbus",
      state: "Ohio",
      country: "United States",
      address: "281 W Lane Ave, Columbus, OH 43210",
    },
    "University of Toronto": {
      city: "Toronto",
      state: "Ontario",
      country: "Canada",
      address: "27 King's College Cir, Toronto, ON M5S",
    },
    "University of California, Berkeley": {
      city: "Berkeley",
      state: "California",
      country: "United States",
      address: "200 California Hall, Berkeley, CA 94720",
    },
    "McGill University": {
      city: "Montreal",
      state: "Quebec",
      country: "Canada",
      address: "845 Sherbrooke St W, Montreal, QC H3A 0G4",
    },
    "University of Texas at Austin": {
      city: "Austin",
      state: "Texas",
      country: "United States",
      address: "110 Inner Campus Dr, Austin, TX 78712",
    },
    "New York University": {
      city: "New York City",
      state: "New York",
      country: "United States",
      address: "70 Washington Square S, New York, NY 10012",
    },
  };

//   needed data -- could be put in a json for readability and not heavy code?
  const amenities = [
    { key: 'in_unit_laundry', label: 'In-Unit Laundry' },
    { key: 'central_air', label: 'Central Air Conditioning' },
    { key: 'dishwasher', label: 'Dishwasher' },
    { key: 'balcony', label: 'Private Balcony' },
    { key: 'hardwood_floors', label: 'Hardwood Floors' },
    { key: 'walk_in_closet', label: 'Walk-in Closet' },
    { key: 'gym', label: 'Fitness Center' },
    { key: 'pool', label: 'Swimming Pool' },
    { key: 'rooftop', label: 'Rooftop Access' },
    { key: 'pet_friendly', label: 'Pet Friendly' },
  ];
  

export default function ApartmentForm(){

    // dummy data -- use formik later usage
    const [country, setCountry] = useState("")
    const [state, setState] = useState("")
    const [buyer, setIsFirstTimeBuyer] = useState(false)
    const [city, setCity] = useState()
    const [isStudent, setIsStudent] = useState("")
    const [college, setCollege] = useState("")
    const [priceRange, setPriceRange] = useState([1000, 3000])
    const [selectedAmenities, setSelectedAmenities] = useState([])

    const handleCountry = (event) => {
        setCountry(event.target.value)
        setState("")
    }

    const handleState = (event) => {
        setState(event.target.value)
    }

    const handleBuyer = (event) => {
        setIsFirstTimeBuyer(event.target.value)
    }

    const handleCity = (event) => {
        setCity(event.target.value)
    }

    const handleColleges = (event) => {
        setCollege(event.target.value)
    }

    const handlePriceRange = (event, newValue) => {
        setPriceRange(newValue)
    }

    const toggleAmenity = (key) => {
        setSelectedAmenities((prev) =>
            prev.includes(key)
            ? prev.filter((item) => item !== key)
            : [...prev, key]
        )
    }
    
    return (
    <>
        <Container>
            <p> What's your name? </p>
            <FormControl fullWidth>
                <TextField id="outlined-basic" label="Name" variant="outlined" />
            </FormControl>
            
            <p> Are you a first time buyer? </p>
            <InputLabel id="buyer-label">First Time Buyer</InputLabel>
            <FormControl fullWidth>
                <Select
                    labelId="first-time-buyer"
                    id="is-a-first-time-buyer"
                    value={buyer}
                    label="first time buyer"
                    onChange={handleBuyer}
                >
                    <MenuItem value="yes">Yes</MenuItem>
                    <MenuItem value="no">No</MenuItem>
                </Select>
            </FormControl>

            <p> Are you a student? </p>
            <InputLabel id="student-label">Student</InputLabel>
            <FormControl fullWidth>
                <Select
                    labelId="student"
                    id="student"
                    value={isStudent}
                    label="first time buyer"
                    onChange={(e) => setIsStudent(e.target.value)}
                >
                    <MenuItem value="yes">Yes</MenuItem>
                    <MenuItem value="no">No</MenuItem>
                </Select>
            </FormControl>


            
            {/* to get api key for colleges + retriving address us dept education api (college scorecard) 
                using dummy data for now
            */}
            {isStudent == "yes" && (
                <>
                    <p> Which college do you attend? </p>
                    <InputLabel id="college-label">College</InputLabel>
                    <FormControl fullWidth>
                        <Select
                            labelId="college"
                            id="college"
                            value={college}
                            label="college"
                            onChange={handleColleges}
                        >
                        {Object.keys(colleges).map((col) => (
                            <MenuItem key={col} value={col}>{col}</MenuItem>
                        ))}
                        </Select>
                    </FormControl>
                </>
           )}

           {isStudent == "no" && (
            <>
                <p> What country are we looking at for your apartment? </p>
                <FormControl fullWidth>
                    <InputLabel id="country-label">Country</InputLabel>
                    <Select
                        labelId="country"
                        id="country"
                        value={country}
                        label="country"
                        onChange={handleCountry}
                    >
                        {countries.map((c) => (
                            <MenuItem key={c.code} value={c.code}>{c.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                

                {country && (
                    <>
                        <p> Which state/province? </p>
                        <InputLabel id="state-label">State</InputLabel>
                        <FormControl fullWidth>
                            <Select
                                labelId="state"
                                id="state"
                                value={state}
                                label="state"
                                onChange={handleState}
                            >
                            {statesByCountry[country].map((s) => (
                                <MenuItem key={s} value={s}>{s}</MenuItem>
                            ))}
                            </Select>
                        </FormControl>
                    </>
                )}

                {state && (
                    <>
                        <p> Which city are you looking to live in? </p>
                        <InputLabel id="city-label">City</InputLabel>
                        <FormControl fullWidth>
                            <Select
                                labelId="city"
                                id="city"
                                value={city}
                                label="city"
                                onChange={handleCity}
                            >
                            {citiesByState[state].map((c) => (
                                <MenuItem key={c} value={c}>{c}</MenuItem>
                            ))}
                            </Select>
                        </FormControl>
                    </>
                )}
            </>
           )}

            <p> What is your price range? </p>
            <FormControl fullWidth>
                <ApartmentPriceRange value={priceRange} onChange={handlePriceRange}/>
            </FormControl>

            <p> What amenities are you looking for? </p>
            <FormControl component="fieldset" fullWidth>
                <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                    {amenities.map((amenity) => (
                    <Chip
                        key={amenity.key}
                        label={amenity.label}
                        clickable
                        variant={selectedAmenities.includes(amenity.key) ? 'filled' : 'outlined'}
                        color={selectedAmenities.includes(amenity.key) ? 'primary' : 'default'}
                        onClick={() => toggleAmenity(amenity.key)}
                        sx={{ borderRadius: '16px' }}
                    />
                    ))}
                </Box>
            </FormControl>
               


        </Container>
        
    </>
    );
}