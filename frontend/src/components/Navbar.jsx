import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import {Toolbar} from '@mui/material';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import logoimg from "../assets/logo.png";
import { useNavigate } from 'react-router-dom';

const pages = ['Maps', 'Leases', 'Spreadsheet'];

function NavBar() {
  const navigate = useNavigate();

  const pagePaths = {
    Maps: '/maps',
    Leases: '/leases',
    Spreadsheet: '/spreadsheets'
  }

  return (
    <AppBar 
      position="static" 
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.3)', 

      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          
          <Box
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
            }}
          >
            <img
              src={logoimg}
              alt="Logo"
              style={{ 
                height: '50px', 
                width: 'auto',  
                display: 'block', 
              }}

            />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={() => navigate(pagePaths[page])}
                sx={{
                  my: 2,
                  color: 'black',
                  display: 'block',
                  textDecoration: 'underline',
                  backgroundColor: 'transparent',
                  position: 'relative',
                  transition: 'all 0.3s ease',

                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',  // light translucent white bg
                    backdropFilter: 'blur(8px)',                    // blur background behind button
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)', // glassy shadow
                    borderRadius: '8px',
                    transform: 'scale(1.05)',                        // subtle pop out
                    cursor: 'pointer',
                  },
                }}
              >
                {page}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default NavBar;
