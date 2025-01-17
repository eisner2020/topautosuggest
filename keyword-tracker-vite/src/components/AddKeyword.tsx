import { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface Props {
  onAdd: (keyword: string, expectedResult: string) => void;
}

export default function AddKeyword({ onAdd }: Props) {
  const [keyword, setKeyword] = useState('');
  const [expectedResult, setExpectedResult] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim() && expectedResult.trim()) {
      onAdd(keyword.trim(), expectedResult.trim());
      setKeyword('');
      setExpectedResult('');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" gutterBottom sx={{ color: 'text.primary', mb: 3 }}>
        Add New Keyword
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
        <TextField
          label="Search Term"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          required
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ 
            '& .MuiInputBase-input': {
              fontSize: '1.125rem',
              padding: '1rem'
            }
          }}
        />
        
        <TextField
          label="Expected Result"
          value={expectedResult}
          onChange={(e) => setExpectedResult(e.target.value)}
          required
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CheckCircleIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ 
            '& .MuiInputBase-input': {
              fontSize: '1.125rem',
              padding: '1rem'
            }
          }}
        />
        
        <Button 
          type="submit"
          variant="contained"
          size="large"
          sx={{ 
            minWidth: { xs: '100%', md: '200px' },
            height: '56px',
            fontSize: '1.125rem'
          }}
        >
          Add Keyword
        </Button>
      </Box>
    </Box>
  );
}
