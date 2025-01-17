import { Box, Typography, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import KeywordList from './KeywordList';
import { SearchState } from '../types';

interface Props {
  searchState: SearchState;
  loading: boolean;
}

export default function KeywordTracker({ searchState, loading }: Props) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!searchState.data || !searchState.data.keywordData || searchState.data.keywordData.length === 0) {
    if (!loading && searchState.isAuthenticated) {
      return (
        <Typography variant="body1" sx={{ textAlign: 'center', p: 3 }}>
          No results found for the selected keywords and date range.
        </Typography>
      );
    }
    return null;
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Search Results
      </Typography>
      <KeywordList
        keywords={searchState.keywords}
        data={searchState.data.keywordData}
        loading={loading}
      />
    </Box>
  );
}
