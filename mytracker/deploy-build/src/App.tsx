import { useState, useEffect } from 'react';
import { Container, Box, Typography, Alert, Snackbar, Paper, ThemeProvider, createTheme, Button } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Business, KeywordData, SearchState } from './types';
import BusinessForm from './components/BusinessForm';
import AddKeyword from './components/AddKeyword';
import KeywordList from './components/KeywordList';
import PlatformLogin from './components/PlatformLogin';
import PresetActions from './components/PresetActions';
import DateRangeSelector from './components/DateRangeSelector';
import KeywordTracker from './components/KeywordTracker';
import { googleAuth } from './services/googleAuth';
import { getSearchConsoleData } from './services/searchData';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

export default function App() {
  const [authenticated, setAuthenticated] = useState({
    google: false,
    business: false,
    yelp: false
  });

  const [loading, setLoading] = useState(false);

  const [searchState, setSearchState] = useState<SearchState>({
    business: {
      name: '',
      location: '',
      website: ''
    },
    keywords: [],
    dateRange: {
      start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    data: null,
    isAuthenticated: false
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const checkAuth = async () => {
    try {
      const isGoogleAuth = await googleAuth.isAuthenticated();
      setAuthenticated(prev => ({
        ...prev,
        google: isGoogleAuth
      }));
      if (isGoogleAuth && searchState.business.website && searchState.keywords.length > 0) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setAuthenticated(prev => ({
        ...prev,
        google: false
      }));
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleBusinessSubmit = (business: Business) => {
    setSearchState(prev => ({
      ...prev,
      business
    }));
  };

  const handleAddKeyword = (keyword: string) => {
    setSearchState(prev => ({
      ...prev,
      keywords: [...prev.keywords, { id: crypto.randomUUID(), keyword }]
    }));
  };

  const handleDeleteKeyword = (id: string) => {
    setSearchState(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k.id !== id)
    }));
  };

  const createPresetUrl = () => {
    const params = new URLSearchParams();
    if (searchState.business.name) params.set('name', searchState.business.name);
    if (searchState.business.location) params.set('location', searchState.business.location);
    if (searchState.business.website) params.set('website', searchState.business.website);
    searchState.keywords.forEach((keyword, index) => {
      params.set(`kw${index}`, keyword.keyword);
    });
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url).then(
      () => {
        setSnackbar({
          open: true,
          message: 'Preset URL copied to clipboard!',
          severity: 'success'
        });
      },
      (err) => {
        console.error('Failed to copy URL:', err);
        setSnackbar({
          open: true,
          message: 'Failed to copy URL to clipboard',
          severity: 'error'
        });
      }
    );
  };

  const handlePlatformCheck = async (platform: 'google' | 'business' | 'yelp') => {
    if (!searchState.business.website) {
      setSnackbar({
        open: true,
        message: 'Please enter a website URL first',
        severity: 'warning'
      });
      return;
    }

    if (platform === 'google') {
      setLoading(true);
      try {
        await googleAuth.signIn();
        const isAuthenticated = await googleAuth.isAuthenticated();
        setAuthenticated(prev => ({ ...prev, google: isAuthenticated }));
        if (isAuthenticated) {
          await fetchData();
        }
      } catch (error) {
        console.error('Error connecting to Google:', error);
        setSnackbar({
          open: true,
          message: 'Failed to connect to Google. Please try again.',
          severity: 'error'
        });
        setAuthenticated(prev => ({ ...prev, google: false }));
      } finally {
        setLoading(false);
      }
    } else if (platform === 'business') {
      setSnackbar({
        open: true,
        message: 'Google Business Profile integration coming soon!',
        severity: 'info'
      });
    } else if (platform === 'yelp') {
      setSnackbar({
        open: true,
        message: 'Yelp integration coming soon!',
        severity: 'info'
      });
    }
  };

  const handlePlatformLogin = async (platform: string) => {
    if (!searchState.business.website) {
      setSnackbar({
        open: true,
        message: 'Please enter a website URL first',
        severity: 'warning'
      });
      return;
    }

    setLoading(true);
    try {
      switch (platform) {
        case 'google':
          await googleAuth.authenticate();
          setAuthenticated(prev => ({ ...prev, google: true }));
          setSearchState(prev => ({ ...prev, isAuthenticated: true }));
          setSnackbar({
            open: true,
            message: 'Successfully connected to Google Search Console',
            severity: 'success'
          });
          break;
        case 'business':
          // TODO: Implement Google Business Profile auth
          console.log('Business login not implemented yet');
          break;
        case 'facebook':
          // TODO: Implement Facebook auth
          console.log('Facebook login not implemented yet');
          break;
      }
    } catch (error) {
      console.error(`Error logging in to ${platform}:`, error);
      setSnackbar({
        open: true,
        message: `Failed to connect to ${platform}. Please try again.`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    if (!searchState.business.website || searchState.keywords.length === 0) {
      return;
    }

    setLoading(true);
    try {
      // Ensure we have a token
      const token = localStorage.getItem('google_access_token');
      if (!token) {
        throw new Error('No access token found. Please log in again.');
      }

      const data = await getSearchConsoleData(
        searchState.dateRange.start,
        searchState.dateRange.end,
        searchState.business.website,
        searchState.keywords.map(k => k.keyword)
      );

      console.log('Fetched data:', data);

      setSearchState(prev => ({
        ...prev,
        data: {
          keywordData: data
        }
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error fetching data. Please try again.',
        severity: 'error'
      });
      // If token error, reset authentication
      if (error instanceof Error && error.message.includes('token')) {
        setAuthenticated(prev => ({ ...prev, google: false }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const loadedBusiness = {
      name: params.get('name') || '',
      website: params.get('website') || '',
      location: params.get('location') || ''
    };
    
    const loadedKeywords: KeywordData[] = [];
    let index = 0;
    while (true) {
      const keyword = params.get(`kw${index}`);
      if (!keyword) break;
      loadedKeywords.push({ id: crypto.randomUUID(), keyword });
      index++;
    }

    if (loadedBusiness.name || loadedBusiness.website || loadedBusiness.location || loadedKeywords.length > 0) {
      setSearchState(prev => ({
        ...prev,
        business: loadedBusiness,
        keywords: loadedKeywords
      }));
    }
  }, []);

  const hasData = Boolean(searchState.business.website && searchState.keywords.length > 0);

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            color: theme.palette.primary.main,
            fontWeight: 'bold',
            mb: 4 
          }}
        >
          Keyword Performance Tracker
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Business Information
          </Typography>
          <BusinessForm
            initialBusiness={searchState.business}
            onSubmit={handleBusinessSubmit}
          />
        </Paper>

        {searchState.business.website && (
          <>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Keywords
              </Typography>
              <AddKeyword onAdd={handleAddKeyword} />
              <Box sx={{ mt: 2 }}>
                <KeywordList
                  keywords={searchState.keywords}
                  onDelete={handleDeleteKeyword}
                  data={searchState.data?.keywordData}
                  loading={loading}
                />
              </Box>
              {searchState.keywords.length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={createPresetUrl}
                    startIcon={<ContentCopyIcon />}
                  >
                    Create Preset URL
                  </Button>
                </Box>
              )}
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Connect Platforms
              </Typography>
              <Box sx={{ mt: 2 }}>
                <PlatformLogin
                  onCheck={handlePlatformCheck}
                  loading={loading}
                  authenticated={authenticated}
                />
              </Box>
            </Paper>

            {hasData && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Date Range
                </Typography>
                <DateRangeSelector
                  startDate={searchState.dateRange.start}
                  endDate={searchState.dateRange.end}
                  onDateChange={(start, end) => {
                    setSearchState(prev => ({
                      ...prev,
                      dateRange: { start, end }
                    }));
                  }}
                />
              </Paper>
            )}

            {authenticated.google && (
              <KeywordTracker 
                searchState={searchState}
                loading={loading}
              />
            )}
          </>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}
