import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { Business } from '../types';

interface Props {
  onCheckNow: () => void;
  onSavePreset: () => void;
  disabled: boolean;
  loading: boolean;
}

export default function PresetActions({ onCheckNow, onSavePreset, disabled, loading }: Props) {
  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
      <Button
        variant="contained"
        color="primary"
        onClick={onCheckNow}
        disabled={disabled}
        startIcon={loading && <CircularProgress size={20} color="inherit" />}
      >
        {loading ? 'Checking...' : 'Check Now'}
      </Button>
      
      <Button
        variant="outlined"
        color="primary"
        onClick={onSavePreset}
        disabled={disabled}
      >
        Save as Preset URL
      </Button>
      
      {disabled && !loading && (
        <Typography variant="caption" color="text.secondary">
          Enter a valid website URL to enable these actions
        </Typography>
      )}
    </Box>
  );
}
