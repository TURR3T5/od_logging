import { useState, useEffect } from 'react';
import NewsEventsService, { ContentItem } from '../lib/NewsEventsService';

export const useUpcomingContent = () => {
  const [pinnedItems, setPinnedItems] = useState<ContentItem[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<ContentItem[]>([]);
  const [recentNews, setRecentNews] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        const allContent = await NewsEventsService.getAllContent();
        
        const pinned = allContent.filter(item => item.is_pinned);
        setPinnedItems(pinned);
        
        const now = new Date();
        const events = allContent.filter(item => 
          item.type === 'event' && 
          item.event_date && 
          new Date(item.event_date) > now
        );
        
        const sortedEvents = events.sort((a, b) => {
          const dateA = new Date(a.event_date || 0);
          const dateB = new Date(b.event_date || 0);
          return dateA.getTime() - dateB.getTime();
        });
        
        setUpcomingEvents(sortedEvents.slice(0, 4));
        
        const news = allContent.filter(item => item.type === 'news');

        const sortedNews = news.sort((a, b) => {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          return dateB.getTime() - dateA.getTime();
        });
        
        setRecentNews(sortedNews.slice(0, 5));
      } catch (error) {
        console.error('Error fetching upcoming content:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContent();
  }, []);
  
  return { pinnedItems, upcomingEvents, recentNews, isLoading };
};

export const convertToPinnedItems = (contentItems: ContentItem[]) => {
  return contentItems.map(item => ({
    id: item.id,
    type: item.type as 'news' | 'event',
    title: item.title,
    description: item.description,
    date: new Date(item.created_at),
    newsType: item.news_type,
    eventType: item.event_type,
    eventDate: item.event_date ? new Date(item.event_date) : undefined,
    location: item.location,
  }));
};

export const convertToNewsItems = (contentItems: ContentItem[]) => {
  return contentItems.map(item => ({
    id: parseInt(item.id),
    title: item.title,
    content: item.description,
    fullContent: item.content,
    date: item.created_at,
    type: item.news_type || 'announcement',
    locationName: item.location,
    locationAddress: item.address,
    organizer: item.created_by,
  }));
};