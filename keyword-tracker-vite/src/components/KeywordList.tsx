import { 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Typography,
  Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { KeywordData } from '../types';

interface Props {
  keywords: KeywordData[];
  onDelete: (id: string) => void;
}

export default function KeywordList({ keywords, onDelete }: Props) {
  if (keywords.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No keywords added yet
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3}>
      <List>
        {keywords.map((keyword, index) => (
          <ListItem
            key={keyword.id}
            divider={index !== keywords.length - 1}
            secondaryAction={
              <IconButton 
                edge="end" 
                aria-label="delete"
                onClick={() => onDelete(keyword.id)}
                sx={{ 
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'error.light',
                    color: 'error.dark'
                  }
                }}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Typography variant="h6" component="span">
                    {keyword.keyword}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    component="span"
                    sx={{ 
                      color: '#2563eb',
                      backgroundColor: '#eff6ff',
                      px: 2,
                      py: 0.5,
                      borderRadius: 1
                    }}
                  >
                    {keyword.expectedResult}
                  </Typography>
                </Box>
              }
              secondary={
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Last checked: {new Date(keyword.lastChecked).toLocaleString()}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
