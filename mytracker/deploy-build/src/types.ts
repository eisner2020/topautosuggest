export interface Business {
  name: string;
  website: string;
  location: string;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface KeywordData {
  id: string;
  keyword: string;
}

export interface DailyData {
  date: string;
  clicks: number;
  impressions: number;
  position: number;
}

export interface ProcessedKeywordData {
  keyword: string;
  clicks: number;
  impressions: number;
  avgPosition: number;
  dailyData: DailyData[];
}

export interface SearchState {
  business: Business;
  keywords: KeywordData[];
  dateRange: DateRange;
  isAuthenticated: boolean;
  data: {
    keywordData?: ProcessedKeywordData[];
  } | null;
}
