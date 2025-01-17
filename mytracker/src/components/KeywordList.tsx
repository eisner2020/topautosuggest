import { Box, Typography, CircularProgress, IconButton, List, ListItem, Collapse, Paper } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useState } from 'react';
import { KeywordData } from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface Props {
  keywords: KeywordData[];
  onDelete: (id: string) => void;
  data?: Array<{
    keyword: string;
    clicks: number;
    impressions: number;
    avgPosition: number;
    dailyData?: Array<{
      date: string;
      clicks: number;
      impressions: number;
      position: number;
    }>;
  }>;
  loading?: boolean;
}

export default function KeywordList({ keywords, onDelete, data, loading }: Props) {
  const [expandedKeywords, setExpandedKeywords] = useState<Set<string>>(new Set());

  const toggleExpand = (keywordId: string) => {
    const newExpanded = new Set(expandedKeywords);
    if (newExpanded.has(keywordId)) {
      newExpanded.delete(keywordId);
    } else {
      newExpanded.add(keywordId);
    }
    setExpandedKeywords(newExpanded);
  };

  if (!keywords.length) {
    return null;
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <List>
      {keywords.map((item) => {
        const keywordData = data?.find(d => d.keyword.toLowerCase() === item.keyword.toLowerCase());
        
        return (
          <Paper
            key={item.id}
            elevation={1}
            sx={{ mb: 2 }}
          >
            <ListItem
              sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                p: 2
              }}
            >
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                gap: 2
              }}>
                <Typography sx={{
                  bgcolor: 'action.hover',
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  fontSize: '0.9em',
                  fontWeight: 500
                }}>
                  {item.keyword}
                </Typography>

                {loading ? (
                  <CircularProgress size={16} />
                ) : keywordData ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Clicks: <strong>{keywordData.clicks}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Impressions: <strong>{keywordData.impressions}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Position: <strong>{keywordData.avgPosition.toFixed(1)}</strong>
                    </Typography>
                    {keywordData.dailyData && keywordData.dailyData.length > 0 && (
                      <IconButton
                        onClick={() => toggleExpand(item.id)}
                        size="small"
                      >
                        {expandedKeywords.has(item.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    )}
                  </Box>
                ) : null}

                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => onDelete(item.id)}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>

              {keywordData?.dailyData && keywordData.dailyData.length > 0 && (
                <Collapse in={expandedKeywords.has(item.id)}>
                  <Box sx={{ mt: 3, p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Performance Trend
                    </Typography>
                    <Box sx={{ height: 300, mb: 3 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={keywordData.dailyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date"
                            tickFormatter={formatDate}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis 
                            yAxisId="left"
                            orientation="left"
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis 
                            yAxisId="right"
                            orientation="right"
                            tick={{ fontSize: 12 }}
                            reversed
                          />
                          <Tooltip 
                            labelFormatter={formatDate}
                            formatter={(value: any) => [value, value === (value as number).toFixed(1) ? 'Position' : value === Math.floor(value) ? 'Clicks' : 'Impressions']}
                          />
                          <Legend />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="clicks"
                            stroke="#2196f3"
                            name="Clicks"
                            dot={false}
                          />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="impressions"
                            stroke="#f50057"
                            name="Impressions"
                            dot={false}
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="position"
                            stroke="#4caf50"
                            name="Position"
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                </Collapse>
              )}
            </ListItem>
          </Paper>
        );
      })}
    </List>
  );
}
