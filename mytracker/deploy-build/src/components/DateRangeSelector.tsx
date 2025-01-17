import { Box, ButtonGroup, Button } from '@mui/material';

interface Props {
  startDate: string;
  endDate: string;
  onDateChange: (start: string, end: string) => void;
}

export default function DateRangeSelector({ startDate, endDate, onDateChange }: Props) {
  const handlePeriodSelect = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    onDateChange(
      start.toISOString().split('T')[0],
      end.toISOString().split('T')[0]
    );
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <ButtonGroup variant="outlined" size="medium">
        <Button 
          onClick={() => handlePeriodSelect(7)}
          variant={startDate === new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ? 'contained' : 'outlined'}
        >
          Last 7 Days
        </Button>
        <Button 
          onClick={() => handlePeriodSelect(30)}
          variant={startDate === new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ? 'contained' : 'outlined'}
        >
          Last 30 Days
        </Button>
        <Button 
          onClick={() => handlePeriodSelect(90)}
          variant={startDate === new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ? 'contained' : 'outlined'}
        >
          Last 90 Days
        </Button>
      </ButtonGroup>
    </Box>
  );
}
