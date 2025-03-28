// src/lib/NewsEventsService.ts
import { supabase } from './supabase';
import cacheService from './CacheService';

export interface ContentItem {
    id: string;
    title: string;
    description: string;
    content?: string;
    created_at: string;
    created_by?: string;
    is_pinned: boolean;
    last_updated?: string;
    updated_by?: string;
    type: 'news' | 'event';
    category: string;
    
    // News specific
    news_type?: 'update' | 'announcement' | 'changelog';
    
    // Event specific
    event_type?: 'community' | 'official' | 'special';
    event_date?: string | Date | null;
    location?: string;
    address?: string;
    
    // Tags
    tags?: string[];
}

const CACHE_KEY_ALL_CONTENT = 'all_content';
const CACHE_KEY_NEWS = 'news_items';
const CACHE_KEY_EVENTS = 'event_items';
const CACHE_KEY_PINNED = 'pinned_content';

export const NewsEventsService = {
  async getAllContent(): Promise<ContentItem[]> {
    const cached = cacheService.get<ContentItem[]>(CACHE_KEY_ALL_CONTENT);
    if (cached) return cached;
    
    try {
      // Get content items
      const { data: contentItems, error: contentError } = await supabase
        .from('content_items')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (contentError) throw contentError;
      if (!contentItems) return [];
      
      // Fetch associated metadata based on type
      const contentIds = contentItems.map(item => item.id);
      
      // Get news metadata
      const { data: newsMetadata, error: newsError } = await supabase
        .from('news_metadata')
        .select('*')
        .in('content_id', contentIds);
        
      if (newsError) throw newsError;
      
      // Get event metadata
      const { data: eventMetadata, error: eventError } = await supabase
        .from('event_metadata')
        .select('*')
        .in('content_id', contentIds);
        
      if (eventError) throw eventError;
      
      // Get content tags
      const { data: contentTags, error: tagsError } = await supabase
        .from('content_tags')
        .select('*')
        .in('content_id', contentIds);
        
      if (tagsError) throw tagsError;
      
      // Map tags to content items
      const tagsByContentId: Record<string, string[]> = {};
      contentTags?.forEach(tag => {
        if (!tagsByContentId[tag.content_id]) {
          tagsByContentId[tag.content_id] = [];
        }
        tagsByContentId[tag.content_id].push(tag.tag);
      });
      
      // Create a map of news metadata
      const newsMetadataMap: Record<string, any> = {};
      newsMetadata?.forEach(meta => {
        newsMetadataMap[meta.content_id] = meta;
      });
      
      // Create a map of event metadata
      const eventMetadataMap: Record<string, any> = {};
      eventMetadata?.forEach(meta => {
        eventMetadataMap[meta.content_id] = meta;
      });
      
      // Combine all data
      const combinedContent: ContentItem[] = contentItems.map(item => {
        const result: ContentItem = {
          ...item,
          tags: tagsByContentId[item.id] || []
        };
        
        if (item.type === 'news' && newsMetadataMap[item.id]) {
          result.news_type = newsMetadataMap[item.id].news_type;
        }
        
        if (item.type === 'event' && eventMetadataMap[item.id]) {
          result.event_type = eventMetadataMap[item.id].event_type;
          result.event_date = eventMetadataMap[item.id].event_date;
          result.location = eventMetadataMap[item.id].location;
          result.address = eventMetadataMap[item.id].address;
        }
        
        return result;
      });
      
      cacheService.set(CACHE_KEY_ALL_CONTENT, combinedContent, { expiryInMinutes: 15 });
      return combinedContent;
    } catch (error) {
      console.error('Error fetching content:', error);
      return [];
    }
  },
  
  async getNews(): Promise<ContentItem[]> {
    const allContent = await this.getAllContent();
    const newsItems = allContent.filter(item => item.type === 'news');
    cacheService.set(CACHE_KEY_NEWS, newsItems, { expiryInMinutes: 15 });
    return newsItems;
  },
  
  async getEvents(): Promise<ContentItem[]> {
    const allContent = await this.getAllContent();
    const eventItems = allContent.filter(item => item.type === 'event');
    cacheService.set(CACHE_KEY_EVENTS, eventItems, { expiryInMinutes: 15 });
    return eventItems;
  },
  
  async getPinnedContent(): Promise<ContentItem[]> {
    const allContent = await this.getAllContent();
    const pinnedItems = allContent.filter(item => item.is_pinned);
    cacheService.set(CACHE_KEY_PINNED, pinnedItems, { expiryInMinutes: 15 });
    return pinnedItems;
  },
  
  async createContent(content: Omit<ContentItem, 'id' | 'created_at'>): Promise<string | null> {
    try {
      // Insert the base content
      const { data: contentData, error: contentError } = await supabase
        .from('content_items')
        .insert({
          title: content.title,
          description: content.description,
          content: content.content,
          type: content.type,
          category: content.category,
          created_by: content.created_by,
          is_pinned: content.is_pinned || false
        })
        .select('id')
        .single();
        
      if (contentError) throw contentError;
      if (!contentData?.id) throw new Error('Failed to create content');
      
      const contentId = contentData.id;
      
      // Insert metadata based on content type
      if (content.type === 'news' && content.news_type) {
        const { error: newsError } = await supabase
          .from('news_metadata')
          .insert({
            content_id: contentId,
            news_type: content.news_type
          });
          
        if (newsError) throw newsError;
      }
      
      if (content.type === 'event' && content.event_type && content.event_date) {
        const { error: eventError } = await supabase
          .from('event_metadata')
          .insert({
            content_id: contentId,
            event_type: content.event_type,
            event_date: content.event_date,
            location: content.location,
            address: content.address
          });
          
        if (eventError) throw eventError;
      }
      
      // Insert tags if any
      if (content.tags && content.tags.length > 0) {
        const tagInserts = content.tags.map(tag => ({
          content_id: contentId,
          tag
        }));
        
        const { error: tagsError } = await supabase
          .from('content_tags')
          .insert(tagInserts);
          
        if (tagsError) throw tagsError;
      }
      
      // Invalidate cache
      cacheService.invalidate(CACHE_KEY_ALL_CONTENT);
      cacheService.invalidate(CACHE_KEY_NEWS);
      cacheService.invalidate(CACHE_KEY_EVENTS);
      cacheService.invalidate(CACHE_KEY_PINNED);
      
      return contentId;
    } catch (error) {
      console.error('Error creating content:', error);
      return null;
    }
  },
  
  async updateContent(id: string, updates: Partial<ContentItem>): Promise<boolean> {
    try {
      // Update base content
      const baseUpdates: any = {};
      
      if (updates.title !== undefined) baseUpdates.title = updates.title;
      if (updates.description !== undefined) baseUpdates.description = updates.description;
      if (updates.content !== undefined) baseUpdates.content = updates.content;
      if (updates.is_pinned !== undefined) baseUpdates.is_pinned = updates.is_pinned;
      if (updates.category !== undefined) baseUpdates.category = updates.category;
      
      if (Object.keys(baseUpdates).length > 0) {
        baseUpdates.last_updated = new Date().toISOString();
        baseUpdates.updated_by = updates.updated_by;
        
        const { error: contentError } = await supabase
          .from('content_items')
          .update(baseUpdates)
          .eq('id', id);
          
        if (contentError) throw contentError;
      }
      
      // Update news metadata if needed
      if (updates.type === 'news' && updates.news_type) {
        const { error: newsError } = await supabase
          .from('news_metadata')
          .upsert({
            content_id: id,
            news_type: updates.news_type
          });
          
        if (newsError) throw newsError;
      }
      
      // Update event metadata if needed
      if (updates.type === 'event') {
        const eventUpdates: any = { content_id: id };
        
        if (updates.event_type) eventUpdates.event_type = updates.event_type;
        if (updates.event_date) eventUpdates.event_date = updates.event_date;
        if (updates.location !== undefined) eventUpdates.location = updates.location;
        if (updates.address !== undefined) eventUpdates.address = updates.address;
        
        if (Object.keys(eventUpdates).length > 1) { // More than just content_id
          const { error: eventError } = await supabase
            .from('event_metadata')
            .upsert(eventUpdates);
            
          if (eventError) throw eventError;
        }
      }
      
      // Update tags if needed
      if (updates.tags) {
        // First delete existing tags
        const { error: deleteError } = await supabase
          .from('content_tags')
          .delete()
          .eq('content_id', id);
          
        if (deleteError) throw deleteError;
        
        // Then insert new ones
        if (updates.tags.length > 0) {
          const tagInserts = updates.tags.map(tag => ({
            content_id: id,
            tag
          }));
          
          const { error: tagsError } = await supabase
            .from('content_tags')
            .insert(tagInserts);
            
          if (tagsError) throw tagsError;
        }
      }
      
      // Invalidate cache
      cacheService.invalidate(CACHE_KEY_ALL_CONTENT);
      cacheService.invalidate(CACHE_KEY_NEWS);
      cacheService.invalidate(CACHE_KEY_EVENTS);
      cacheService.invalidate(CACHE_KEY_PINNED);
      
      return true;
    } catch (error) {
      console.error('Error updating content:', error);
      return false;
    }
  },
  
  async deleteContent(id: string): Promise<boolean> {
    try {
      // Delete content (will cascade to metadata and tags)
      const { error } = await supabase
        .from('content_items')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Invalidate cache
      cacheService.invalidate(CACHE_KEY_ALL_CONTENT);
      cacheService.invalidate(CACHE_KEY_NEWS);
      cacheService.invalidate(CACHE_KEY_EVENTS);
      cacheService.invalidate(CACHE_KEY_PINNED);
      
      return true;
    } catch (error) {
      console.error('Error deleting content:', error);
      return false;
    }
  }
};

export default NewsEventsService;