import { SearchFilters } from '../hooks/useLogsSearch';

export const applyLogsFilters = (
  query: any, 
  currentFilters: {
    category?: string;
    type?: string;
    eventType?: string;
    serverId?: string;
    discordId?: string;
  },
  searchFilters: SearchFilters
) => {
  if (currentFilters.category) {
    query = query.eq('category', currentFilters.category);
  }

  if (currentFilters.type) {
    query = query.eq('type', currentFilters.type);
  }

  if (currentFilters.eventType) {
    query = query.eq('event', currentFilters.eventType);
  }

  if (searchFilters.eventTypeSearch) {
    query = query.ilike('event', `%${searchFilters.eventTypeSearch}%`);
  }

  if (currentFilters.serverId) {
    query = query.eq('source', currentFilters.serverId);
  }

  if (currentFilters.discordId) {
    const discordId = currentFilters.discordId.trim();
    if (discordId) {
      query = query.ilike('discord', `%${discordId}%`);
    }
  }

  if (searchFilters.playerSearch) {
    const searchTerm = searchFilters.playerSearch.trim();
    if (searchTerm) {
      const filterConditions = [
        `charname.ilike.%${searchTerm}%`, 
        `source.ilike.%${searchTerm}%`, 
        `discord.ilike.%${searchTerm}%`,
        `txname.ilike.%${searchTerm}%`,
        `citizenid.ilike.%${searchTerm}%`
      ];

      query = query.or(filterConditions.join(','));
    }
  }

  if (searchFilters.dateRange) {
    query = query
      .gte('created_at', searchFilters.dateRange.start)
      .lte('created_at', searchFilters.dateRange.end);
  }

  return query;
};