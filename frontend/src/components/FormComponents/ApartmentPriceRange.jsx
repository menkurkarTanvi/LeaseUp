import * as React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';

function valuetext(value) {
  return `$${value}`;
}

export default function ApartmentPriceRange({value, onChange}) {

  return (
    <Box sx={{ width: 575, p: 2 }}>
      {/* <Typography id="price-range-slider" gutterBottom>
        Select Apartment Price Range
      </Typography> */}
      <Slider
        value={value}
        onChange={onChange}
        valueLabelDisplay="on"
        getAriaLabel={() => 'Apartment price range'}
        getAriaValueText={valuetext}
        min={500}
        max={10000}
        step={100}
        sx={{
          color: '#007a3f',
        }}
      />
      <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
        Selected Range (yearly): ${value[0]} - ${value[1]}
      </Typography>
    </Box>
  );
}
