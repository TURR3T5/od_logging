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
    query = query.eq('event_type', currentFilters.eventType);
  }

  if (searchFilters.eventTypeSearch) {
    query = query.ilike('event_type', `%${searchFilters.eventTypeSearch}%`);
  }

  if (currentFilters.serverId) {
    query = query.eq('server_id', currentFilters.serverId);
  }

  if (currentFilters.discordId) {
    const discordId = currentFilters.discordId.trim();
    if (discordId) {
      query = query.ilike('discord_id', `%${discordId}%`);
    }
  }

  if (searchFilters.playerSearch) {
    const searchTerm = searchFilters.playerSearch.trim();
    if (searchTerm) {
      const filterConditions = [
        `player_name.ilike.%${searchTerm}%`, 
        `server_id.ilike.%${searchTerm}%`, 
        `discord_id.ilike.%${searchTerm}%`
      ];

      if (!isNaN(Number(searchTerm))) {
        filterConditions.push(`player_id.ilike.%${searchTerm}%`);
      }

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