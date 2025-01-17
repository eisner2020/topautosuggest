import { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import KeywordList from './components/KeywordList';
import AddKeyword from './components/AddKeyword';
import { KeywordData } from './types';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AgencySettings from './components/AgencySettings';
import { AppBar, Toolbar, CssBaseline } from '@mui/material';
import { API_URL } from './config';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
    },
    secondary: {
      main: '#dc2626',
    },
  },
});

function App() {
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchKeywords();
  }, []);

  const fetchKeywords = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/keywords`);
      if (!response.ok) throw new Error('Failed to fetch keywords');
      const data = await response.json();
      setKeywords(data);
    } catch (err) {
      setError('Failed to load keywords');
      setSnackbar({ open: true, message: 'Failed to load keywords', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddKeyword = async (keyword: string, expectedResult: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/keywords`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword, expectedResult }),
      });
      
      if (!response.ok) throw new Error('Failed to add keyword');
      
      await fetchKeywords();
      setSnackbar({ open: true, message: 'Keyword added successfully', severity: 'success' });
    } catch (err) {
      setError('Failed to add keyword');
      setSnackbar({ open: true, message: 'Failed to add keyword', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKeyword = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/keywords/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete keyword');
      
      await fetchKeywords();
      setSnackbar({ open: true, message: 'Keyword deleted successfully', severity: 'success' });
    } catch (err) {
      setError('Failed to delete keyword');
      setSnackbar({ open: true, message: 'Failed to delete keyword', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Keyword Verification
            </Typography>
            <Button color="inherit" component={Link} to="/">
              Home
            </Button>
            <Button color="inherit" component={Link} to="/settings">
              Agency Settings
            </Button>
          </Toolbar>
        </AppBar>
        <Container>
          <Box sx={{ mt: 4 }}>
            <Routes>
              <Route path="/settings" element={<AgencySettings />} />
              <Route path="/" element={
                <Box sx={{ py: 4 }}>
                  <Typography variant="h3" component="h1" gutterBottom sx={{ 
                    textAlign: 'center',
                    color: theme.palette.primary.main,
                    fontWeight: 'bold',
                    mb: 4
                  }}>
                    Keyword Planner
                  </Typography>

                  <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                    <AddKeyword onAdd={handleAddKeyword} />
                  </Paper>

                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : error ? (
                    <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
                  ) : (
                    <KeywordList 
                      keywords={keywords}
                      onDelete={handleDeleteKeyword}
                    />
                  )}

                  <Snackbar 
                    open={snackbar.open} 
                    autoHideDuration={6000} 
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                  >
                    <Alert 
                      onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
                      severity={snackbar.severity}
                    >
                      {snackbar.message}
                    </Alert>
                  </Snackbar>
                </Box>
              } />
            </Routes>
          </Box>
        </Container>
      </ThemeProvider>
    </Router>
  );
}

export default App;
