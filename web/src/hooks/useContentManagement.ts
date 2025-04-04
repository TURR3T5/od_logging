import { useState } from 'react';
import { ContentItem, NewsEventsService } from '../lib/NewsEventsService';
import { notifications } from '@mantine/notifications';

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function normalizeContentItem(item: ContentItem): ContentItem {
  return {
    ...item,
    news_type: item.type === 'news' ? (item.news_type || 'announcement') : undefined,
    event_type: item.type === 'event' ? (item.event_type || 'community') : undefined,
  };
}

export function useContentManagement(user: any) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const allItems = await NewsEventsService.getAllContent();

      const normalizedItems = allItems.map(normalizeContentItem);

      setItems(normalizedItems);
    } catch (error) {
      notifications.show({
        title: 'Error fetching content',
        message: 'There was an error loading the content. Please try again later.',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

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

      const normalizedData = {
        ...contentData,
        news_type: contentData.type === 'news' ? (contentData.news_type || 'announcement') : undefined,
        event_type: contentData.type === 'event' ? (contentData.event_type || 'community') : undefined,
      };

      const id = await NewsEventsService.createContent(normalizedData, user);
      if (id) {
        await fetchItems();
        return true;
      }
      return false;
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

      const currentItem = items.find(item => item.id === id);
      if (!currentItem) {
        console.error('Item not found for update:', id);
        return false;
      }

      let updatesToApply = {...updates};

      if (currentItem.type === 'news' && !updatesToApply.news_type) {
        updatesToApply.news_type = currentItem.news_type || 'announcement';
      }

      if (currentItem.type === 'event' && !updatesToApply.event_type) {
        updatesToApply.event_type = currentItem.event_type || 'community';
      }

      const success = await NewsEventsService.updateContent(id, updatesToApply, user);
      if (success) {
        setItems(prevItems => 
          prevItems.map(item => 
            item.id === id ? { ...item, ...updatesToApply } : item
          )
        );
        if (selectedItem?.id === id) {
          setSelectedItem({ ...selectedItem, ...updatesToApply });
        }
        await fetchItems();
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
        setItems(prevItems => prevItems.filter(item => item.id !== id));
        if (selectedItem?.id === id) {
          setSelectedItem(null);
        }
        await fetchItems();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      return false;
    }
  };

  return {
    items,
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