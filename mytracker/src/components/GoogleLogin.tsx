import { Button, Box, Typography, CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useState } from 'react';
import { googleAuth } from '../services/googleAuth';

interface Props {
  onLoginSuccess: (token: string) => void;
}

export default function GoogleLogin({ onLoginSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { token } = await googleAuth.signIn({ prompt: "select_account" });
      onLoginSuccess(token);
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
      console.error('Google sign-in error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      gap: 2,
      p: 3,
      textAlign: 'center'
    }}>
      <Typography variant="h6" gutterBottom>
        Connect Your Google Account
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Sign in with Google to access data from:
        <Box component="ul" sx={{ textAlign: 'left', mt: 1 }}>
          <li>Google Search Console</li>
          <li>Google Analytics</li>
          <li>Google Business Profile</li>
        </Box>
      </Typography>
      
      <Button
        variant="contained"
        color="primary"
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
        onClick={handleLogin}
        disabled={loading}
        sx={{ 
          py: 1.5,
          px: 4,
          textTransform: 'none',
          fontSize: '1rem'
        }}
      >
        {loading ? 'Connecting...' : 'Sign in with Google'}
      </Button>

      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}
    </Box>
  );
}
