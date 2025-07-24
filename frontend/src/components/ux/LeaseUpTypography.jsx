import { Typography } from "@mui/material";


export default function LeaseUpTypography({children}) {
    return (
        <Typography
            variant="h5"
            sx={{
                fontFamily: 'Georgia, serif',
                fontWeight: 50,
                mb: 2,
            }}
        >
            {children}
        </Typography>
    );
}