import React from 'react';
import { Select, MenuItem } from '@mui/material';



export default function CollegeSelect({colleges, selectedCollege, onCollegeSelect}) {
    // console.log('API key:', process.env.REACT_APP_COLLEGE_SCORECARD_API_KEY);
    
    const handleChange = (event) => {
        const selectedName = event.target.value;
        const collegeObj = colleges.find((c) => c['school.name'] === selectedName);
        onCollegeSelect(collegeObj)
    }


        return (
            <>
                <Select
                    labelId="college"
                    id="college"
                    value={selectedCollege?.['school.name'] || ""}
                    label="college"
                    onChange={handleChange}
                >
                    {colleges.map((college, index) => (
                        <MenuItem key={index} value={college['school.name']}>{college['school.name']}</MenuItem>
                    ))}
                </Select>
            </>
    )
}