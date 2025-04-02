import { useState } from 'react';

export interface SearchFilters {
  playerSearch: string;
  eventTypeSearch: string;
  dateRange: { start: string; end: string } | null;
}

export function useLogsSearch() {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    playerSearch: '',
    eventTypeSearch: '',
    dateRange: null,
  });

  const handleSearch = (newFilters: SearchFilters) => {
    setSearchFilters(newFilters);
  };

  return {
    searchFilters,
    setSearchFilters,
    handleSearch
  };
}