import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Button, Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import VotingPage from './components/VotingPage';
import ShowDisplay from './components/ShowDisplay';
import ShowManager from './components/ShowManager';
import { signalRService } from './services/signalrService';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});

function App() {
  useEffect(() => {
    signalRService.start();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Button color="inherit" component={Link} to="/">
              Vote
            </Button>
            <Button color="inherit" component={Link} to="/show">
              Current Show
            </Button>
            <Button color="inherit" component={Link} to="/manage">
              Manage Shows
            </Button>
          </Toolbar>
        </AppBar>

        <Container>
          <Routes>
            <Route path="/" element={<VotingPage />} />
            <Route path="/show" element={<ShowDisplay />} />
            <Route path="/manage" element={<ShowManager />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
