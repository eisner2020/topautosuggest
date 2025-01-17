import { Box, TextField, Typography, Button } from '@mui/material';
import { Business } from '../types';
import { useEffect, useState } from 'react';

interface Props {
  initialBusiness?: Business;
  onSubmit: (business: Business) => void;
}

export default function BusinessForm({ initialBusiness, onSubmit }: Props) {
  const [business, setBusiness] = useState<Business>({
    name: '',
    website: '',
    location: ''
  });

  useEffect(() => {
    if (initialBusiness) {
      setBusiness(initialBusiness);
    }
  }, [initialBusiness]);

  useEffect(() => {
    // Auto-submit when all fields are filled
    if (business.name && business.website && business.location) {
      onSubmit(business);
    }
  }, [business, onSubmit]);

  const handleChange = (field: keyof Business) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setBusiness(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  return (
    <Box component="form" onSubmit={(event) => event.preventDefault()}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Business Name"
          value={business.name}
          onChange={handleChange('name')}
          fullWidth
          required
        />
        
        <TextField
          label="Website URL"
          value={business.website}
          onChange={handleChange('website')}
          fullWidth
          required
          helperText="Enter the exact URL as it appears in Google Search Console"
        />
        
        <TextField
          label="Location"
          value={business.location}
          onChange={handleChange('location')}
          fullWidth
          required
        />

        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          sx={{ mt: 2 }}
        >
          Save Business Info
        </Button>
      </Box>
    </Box>
  );
}
