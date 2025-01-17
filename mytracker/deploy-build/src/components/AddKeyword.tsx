import { useState } from 'react';
import { 
  Paper,
  TextField,
  Button,
  Box,
  Typography
} from '@mui/material';

interface Props {
  onAdd: (keyword: string) => void;
}

export default function AddKeyword({ onAdd }: Props) {
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      onAdd(keyword.trim());
      setKeyword('');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Add Keyword to Track
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            required
            fullWidth
            placeholder="e.g., plumber near me"
          />
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            sx={{ minWidth: '120px' }}
          >
            Add
          </Button>
        </Box>
      </form>
    </Paper>
  );
}
