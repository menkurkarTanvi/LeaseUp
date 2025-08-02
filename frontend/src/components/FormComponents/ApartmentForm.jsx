
import { TextField, Container, 
    FormControl, Select, MenuItem, Box, Chip, Button, Stack,
    Typography} from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import ApartmentPriceRange from './ApartmentPriceRange';
import CollegeSelect from './CollegeSelect';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import LeaseUpTypography from '../ux/LeaseUpTypography';
import logo from "../../assets/logo.png";
import './ApartmentForm.css';
import { TypeAnimation } from 'react-type-animation';

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

    const apiKey = process.env.REACT_APP_COLLEGE_SCORECARD_API_KEY;
    const baseURL = 'https://api.data.gov/ed/collegescorecard/v1/schools';
    const navigate = useNavigate();

    // user data that needs to be collected
    const [userName, setUserName] = useState('');
    const [buyer, setIsFirstTimeBuyer] = useState(false);
    const [isStudent, setIsStudent] = useState("");
    const [priceRange, setPriceRange] = useState([1000, 3000]);
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [colleges, setColleges] = useState([]);
    const [selectedCollege, setSelectedCollege] = useState(null);

    const questionRefs = useRef({});

    const scrollTo = (key) => {
        questionRefs.current[key]?.scrollIntoView({behavior: 'smooth', block: 'center'});
    }

    const handleBuyer = (event) => {
        setIsFirstTimeBuyer(event.target.value)
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

    const LeaseUpButtonStyle = {
        mt: 5,
        backgroundColor: '#005c2a',
        borderRadius: '24px',
        px: 6,
        height: 40,
        color: 'white',
        '&:hover': {
            backgroundColor: '#00461f',
        },
    };


    useEffect(() => {
        const fetchColleges = async () => {
            try {
                const response = await axios.get(baseURL, 
                    {
                        params: {
                            'api_key': apiKey,
                            'fields': 'school.name,latest.student.size,school.city,school.state,school.zip',
                            'per_page': 100,
                            sort: 'latest.student.size:desc' 
                        }
                    }
                );
                console.log('API response:', response.data);
                setColleges(response.data.results)
            } catch (error) {
                console.log("error fetching colleges", error)
                
            }
        };
        fetchColleges()
    }, [])

    const buildAddress = (college) => {
        if (!college) return '';
        return `${college['school.name']}, ${college['school.city']}, ${college['school.state']}, ${college['school.zip']}`;
    }

    const address = buildAddress(selectedCollege);

    const handleSubmit =  () => {
        const userData = {
            userName, 
            buyer,
            isStudent, 
            selectedCollege, 
            selectedAmenities, 
            priceRange, 
            address
        };
        console.log("user data sent to /maps: ", userData);
        navigate('/maps', {state: {userData}});
    }
    
    return (
    <>
        {/* logo container */}
        <Box
            sx={{
                position: 'fixed',
                top: 16,      
                left: 16,     
                zIndex: 1300, 
                cursor: 'pointer',
            }}
        >
            <img
                src={logo}
                alt="logo"
                style={{ 
                    height: 50, 
                    objectFit: 'contain', 
                    maxWidth: 300,
                }}
            />
        </Box>

        <div style={{ position: 'relative', zIndex: 0 }}>
            <div className="background-fade"></div>
            
            <Container
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    py: 4,
                }}
            >
                <Stack spacing={100} sx={{ width: '100%', maxWidth: 600 }}>
                    {/* first box needs padding to move downward due to lack of height */}
                    <Box 
                        ref={(el) => questionRefs.current.name = el}
                        sx={{
                            minHeight: '80vh',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                        }}
                    >
                        <Box>
                            {/* introduction sentence */}
                            <Typography 
                                variant='h4'
                                sx={{
                                    fontFamily: 'Georgia, serif',
                                    fontWeight: 45,
                                    mb: 2,
                            }}>
                                <TypeAnimation
                                sequence={[
                                    'Hi! Here are a few questions we want to get to know about your apartment searching process.',
                                    2000,
                                ]}
                                wrapper="p"
                                cursor={true}
                                repeat={Infinity}
                                />
                            </Typography>
                        </Box>

                        <Box mt={6}>
                            <LeaseUpTypography>
                            What's your name?
                            </LeaseUpTypography>
                            <FormControl fullWidth>
                                <TextField 
                                    id="user-name-field" 
                                    label="Name" 
                                    variant="standard" 
                                    value={userName} 
                                    onChange={(e) => setUserName(e.target.value)} 
                                />
                                <Button sx={LeaseUpButtonStyle} variant="contained" onClick={() => scrollTo("buyer")}>Next</Button>
                            </FormControl>
                        </Box>
                        
                    </Box>
                    
                    <Box ref={(el) => questionRefs.current.buyer = el}>
                        <LeaseUpTypography> Are you a first time buyer? </LeaseUpTypography>
                        <FormControl fullWidth>
                            <Select
                                id="buyer"
                                value={buyer}
                                label="Buyer"
                                onChange={handleBuyer}
                            >
                                <MenuItem value="yes">Yes</MenuItem>
                                <MenuItem value="no">No</MenuItem>
                            </Select>
                            <Button sx={LeaseUpButtonStyle} variant="contained" onClick={() => scrollTo("isStudent")}>Next</Button>
                        </FormControl>
                    </Box>
                    

                    <Box ref={(el) => questionRefs.current.isStudent = el}>
                        <LeaseUpTypography> Are you a student? </LeaseUpTypography>
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
                            <Button sx={LeaseUpButtonStyle} variant="contained" onClick={() => scrollTo("college")}>Next</Button>
                        </FormControl>
                    </Box>

                    {/* can see the college + address if user wants to change values */}
                    <Box ref={(el) => questionRefs.current.college = el}>
                        {isStudent == "yes" && (
                            <Box>
                                <LeaseUpTypography> Which college do you attend? </LeaseUpTypography>
                                <FormControl fullWidth>
                                    <CollegeSelect colleges={colleges} selectedCollege={selectedCollege} onCollegeSelect={(college) => setSelectedCollege(college)}></CollegeSelect>
                                    
                                </FormControl>
                            </Box>
                        )}

                        <Box mt={6}>
                            <LeaseUpTypography>Verify the college address of your first apartment:</LeaseUpTypography>
                            <FormControl fullWidth>
                            <TextField
                                id="address-field"
                                label="Address"
                                multiline
                                rows={4}
                                defaultValue={buildAddress(selectedCollege)}
                                InputLabelProps={{ shrink: true }}
                                InputProps={{readOnly: true}}
                            />
                            <Button sx={LeaseUpButtonStyle} variant="contained" onClick={() => scrollTo("price_range")}>Next</Button>
                        </FormControl>
                        </Box>
                    </Box>


                    <Box ref={(el) => questionRefs.current.price_range = el}>
                        <LeaseUpTypography> What is your price range for your apartment? </LeaseUpTypography>
                        <FormControl fullWidth>
                            <ApartmentPriceRange value={priceRange} onChange={handlePriceRange}/>
                            <Button sx={LeaseUpButtonStyle} variant="contained" onClick={() => scrollTo("amenities")}>Next</Button>
                        </FormControl>
                    </Box>


                    {/* amenities */}
                    <Box 
                        ref={(el) => questionRefs.current.amenities = el}
                        sx={{
                            minHeight: '100vh',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            p: 2,
                        }}
                    >
                        <LeaseUpTypography> What amenities are you looking for? </LeaseUpTypography>
                        <FormControl component="fieldset" fullWidth>
                            <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                                {amenities.map((amenity) => {
                                const selected = selectedAmenities.includes(amenity.key);
                                return (
                                    <Chip
                                        key={amenity.key}
                                        label={amenity.label}
                                        clickable
                                        variant={selectedAmenities.includes(amenity.key) ? 'filled' : 'outlined'}
                                        color={selectedAmenities.includes(amenity.key) ? 'primary' : 'default'}
                                        onClick={() => toggleAmenity(amenity.key)}
                                        onDelete={selected ? () => toggleAmenity(amenity.key) : undefined}
                                        sx={{ 
                                            borderRadius: '16px',
                                            fontSize: '1rem',
                                            height: 40,
                                            px: 1.5
                                        }}
                                    />
                                    );
                                })}
                            </Box>
                        </FormControl>

                        <Box mt={6}>
                            <FormControl>
                                <Button 
                                    variant="outlined" 
                                    size="large" 
                                    type="submit"
                                    onClick={handleSubmit}
                                    sx={LeaseUpButtonStyle}
                                >
                                    Submit to view possible apartments!
                                </Button>
                            </FormControl>
                        </Box>
                    </Box>
                </Stack>
            </Container>
        </div>
    </>
    );
}