import { Box, Button, CircularProgress, FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import BusinessIcon from '@mui/icons-material/Business';
import StoreIcon from '@mui/icons-material/Store';
import { useState } from 'react';

interface Platform {
  id: string;
  name: string;
  icon: JSX.Element;
  available: boolean;
}

const platforms: Platform[] = [
  {
    id: 'google',
    name: 'Google Search Console',
    icon: <GoogleIcon />,
    available: true
  },
  {
    id: 'business',
    name: 'Google Business Profile',
    icon: <BusinessIcon />,
    available: false
  },
  {
    id: 'yelp',
    name: 'Yelp',
    icon: <StoreIcon />,
    available: false
  }
];

interface Props {
  onCheck: (platform: 'google' | 'business' | 'yelp') => Promise<void>;
  loading: boolean;
  authenticated: {
    google: boolean;
    business?: boolean;
    yelp?: boolean;
  };
}

export default function PlatformLogin({ onCheck, loading, authenticated }: Props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {platforms.map((platform) => {
        const isAuthenticated = authenticated[platform.id as keyof typeof authenticated];
        const buttonText = isAuthenticated 
          ? `Reconnect to ${platform.name}`
          : platform.available 
            ? `Connect to ${platform.name}`
            : `${platform.name} (Coming Soon)`;

        return (
          <Button
            key={platform.id}
            variant="contained"
            startIcon={platform.icon}
            onClick={() => onCheck(platform.id as 'google' | 'business' | 'yelp')}
            disabled={loading || (!platform.available && !isAuthenticated)}
            sx={{ 
              bgcolor: isAuthenticated ? 'success.main' : 'primary.main',
              '&:hover': {
                bgcolor: isAuthenticated ? 'success.dark' : 'primary.dark',
              },
              opacity: platform.available || isAuthenticated ? 1 : 0.7
            }}
          >
            {buttonText}
          </Button>
        );
      })}
    </Box>
  );
}
