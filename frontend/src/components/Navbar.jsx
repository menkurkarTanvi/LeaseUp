import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import logoimg from "../assets/logo.png";

const pages = ['Products', 'Pricing', 'Blog'];

function NavBar() {
  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Desktop Logo */}
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
                height: '50px', // fixed height
                width: 'auto',  // auto width to keep aspect ratio
                display: 'block', 
              }}

            />
          </Box>

          {/* Push pages buttons to the right */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Pages buttons for desktop */}
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page}
                sx={{ my: 2, color: 'white', display: 'block' }}
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
