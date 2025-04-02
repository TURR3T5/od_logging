import { useState, useEffect } from 'react';
import { ContentItem, NewsEventsService } from '../lib/NewsEventsService';
import { notifications } from '@mantine/notifications';

export function useContentManagement(user: any) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  
  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const allItems = await NewsEventsService.getAllContent();
      setItems(allItems);
      setFilteredItems(allItems);
    } catch (error) {
      console.error('Error fetching content:', error);
      notifications.show({
        title: 'Error fetching content',
        message: 'There was an error loading the content. Please try again later.',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filterItems = (
    itemsList: ContentItem[] = items,
    filters: {
      contentType?: 'news' | 'event' | 'all';
      showPinnedOnly?: boolean;
      selectedDate?: Date | null;
      viewMode?: string;
      searchTerm?: string;
    } = {}
  ) => {
    const { contentType = 'all', showPinnedOnly = false, selectedDate = null, viewMode = 'list', searchTerm = '' } = filters;
    
    let filtered = [...itemsList];

    if (contentType === 'news') {
      filtered = filtered.filter((item) => item.type === 'news');
    } else if (contentType === 'event') {
      filtered = filtered.filter((item) => item.type === 'event');
    }

    if (showPinnedOnly) {
      filtered = filtered.filter((item) => item.is_pinned);
    }

    if (contentType === 'event' && selectedDate && viewMode === 'calendar') {
      filtered = filtered.filter((item) => {
        if (item.type === 'event' && item.event_date) {
          const eventDate = typeof item.event_date === 'string' 
            ? new Date(item.event_date) 
            : item.event_date;
          
          return eventDate && isSameDay(eventDate, selectedDate);
        }
        return false;
      });
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(lowerSearch) ||
        item.description.toLowerCase().includes(lowerSearch)
      );
    }

    filtered = filtered.sort((a, b) => {
      const dateA = a.type === 'event' && a.event_date 
        ? (typeof a.event_date === 'string' ? new Date(a.event_date) : a.event_date) 
        : new Date(a.created_at);
        
      const dateB = b.type === 'event' && b.event_date 
        ? (typeof b.event_date === 'string' ? new Date(b.event_date) : b.event_date) 
        : new Date(b.created_at);

      if (!dateA) return 1;
      if (!dateB) return -1;

      return dateB.getTime() - dateA.getTime();
    });

    return filtered;
  };

  const createItem = async (
    contentData: Omit<ContentItem, 'id' | 'created_at'>
  ): Promise<boolean> => {
    try {
      await NewsEventsService.createContent(contentData, user);
      await fetchItems();
      return true;
    } catch (error) {
      console.error('Error creating content:', error);
      return false;
    }
  };

  const updateItem = async (
    id: string, 
    updates: Partial<ContentItem>
  ): Promise<boolean> => {
    try {
      const success = await NewsEventsService.updateContent(id, updates, user);
      
      if (success) {
        const updatedItems = items.map((item) => 
          item.id === id ? { ...item, ...updates } : item
        );
        
        setItems(updatedItems);
        
        if (selectedItem?.id === id) {
          setSelectedItem({ ...selectedItem, ...updates });
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating item:', error);
      return false;
    }
  };

  const deleteItem = async (id: string): Promise<boolean> => {
    try {
      const success = await NewsEventsService.deleteContent(id, user);
      
      if (success) {
        const updatedItems = items.filter((item) => item.id !== id);
        setItems(updatedItems);
        
        if (selectedItem?.id === id) {
          setSelectedItem(null);
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting content:', error);
      return false;
    }
  };

  return {
    items,
    filteredItems,
    setFilteredItems,
    isLoading,
    selectedItem,
    setSelectedItem,
    fetchItems,
    filterItems,
    createItem,
    updateItem,
    deleteItem
  };
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}