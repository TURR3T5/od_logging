
import { supabase } from './supabase';
import cacheService from './CacheService';
import { hasPermission } from './discord';

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
    
    
    news_type?: 'update' | 'announcement' | 'changelog'; 
    
    
    event_type?: 'community' | 'official' | 'special';
    event_date?: string | Date | null;
    location?: string;
    address?: string;
    
    
    tags?: string[];
}

const CACHE_KEY_ALL_CONTENT = 'all_content';
const CACHE_KEY_NEWS = 'news_items';
const CACHE_KEY_EVENTS = 'event_items';
const CACHE_KEY_PINNED = 'pinned_content';

export const checkContentPermission = async (
    user: any, 
    requiredLevel: 'content' | 'staff' | 'admin' = 'content'
  ): Promise<boolean> => {
    if (!user) return false;
  
    const discordPermission = await hasPermission(user, requiredLevel);
    if (discordPermission) return true;

    try {
      const userEmail = user.email?.toLowerCase();
      if (!userEmail) return false;
      
      const { data, error } = await supabase
        .from('user_roles_email')
        .select('role')
        .eq('email', userEmail)
        .single();
        
      if (error) {
        console.error('Error checking email role:', error);
        return false;
      }
      
      if (!data || !data.role) return false;

      const permissionHierarchy: Record<string, number> = {
        'admin': 3,
        'staff': 2,
        'content': 1,
        'viewer': 0,
        'none': -1
      };
      
      const userPermissionLevel = permissionHierarchy[data.role] || -1;
      const requiredPermissionLevel = permissionHierarchy[requiredLevel] || 1;
      
      return userPermissionLevel >= requiredPermissionLevel;
    } catch (error) {
      console.error('Error in email permission check:', error);
      return false;
    }
};

export const NewsEventsService = {
  async getAllContent(): Promise<ContentItem[]> {
    const cached = cacheService.get<ContentItem[]>(CACHE_KEY_ALL_CONTENT);
    if (cached) return cached;
    
    try {
      
      const { data: contentItems, error: contentError } = await supabase
        .from('content_items')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (contentError) throw contentError;
      if (!contentItems) return [];
      
      
      const contentIds = contentItems.map(item => item.id);
      
      
      const { data: newsMetadata, error: newsError } = await supabase
        .from('news_metadata')
        .select('*')
        .in('content_id', contentIds);
        
      if (newsError) throw newsError;
      
      
      const { data: eventMetadata, error: eventError } = await supabase
        .from('event_metadata')
        .select('*')
        .in('content_id', contentIds);
        
      if (eventError) throw eventError;
      
      
      const { data: contentTags, error: tagsError } = await supabase
        .from('content_tags')
        .select('*')
        .in('content_id', contentIds);
        
      if (tagsError) throw tagsError;
      
      
      const tagsByContentId: Record<string, string[]> = {};
      contentTags?.forEach(tag => {
        if (!tagsByContentId[tag.content_id]) {
          tagsByContentId[tag.content_id] = [];
        }
        tagsByContentId[tag.content_id].push(tag.tag);
      });
      
      
      const newsMetadataMap: Record<string, any> = {};
      newsMetadata?.forEach(meta => {
        newsMetadataMap[meta.content_id] = meta;
      });
      
      
      const eventMetadataMap: Record<string, any> = {};
      eventMetadata?.forEach(meta => {
        eventMetadataMap[meta.content_id] = meta;
      });
      
      
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
  
  async createContent(content: Omit<ContentItem, 'id' | 'created_at'>, user: any): Promise<string | null> {
    
    const hasPermissions = await checkContentPermission(user);
    if (!hasPermissions) {
      throw new Error('Insufficient permissions to create content');
    }

    try {
      
      content.created_by = user?.username || 'Unknown';

      
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
      
      
      return contentData.id;
    } catch (error) {
      console.error('Error creating content:', error);
      return null;
    }
  },

  async updateContent(id: string, updates: Partial<ContentItem>, user: any): Promise<boolean> {
    
    const hasPermissions = await checkContentPermission(user);
    if (!hasPermissions) {
      throw new Error('Insufficient permissions to update content');
    }

    try {
      
      updates.updated_by = user?.username || 'Unknown';
      updates.last_updated = new Date().toISOString();

      
      const { error } = await supabase
        .from('content_items')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
      
      
      return true;
    } catch (error) {
      console.error('Error updating content:', error);
      return false;
    }
  },

  async deleteContent(id: string, user: any): Promise<boolean> {
    
    const hasPermissions = await checkContentPermission(user, 'staff');
    if (!hasPermissions) {
      throw new Error('Insufficient permissions to delete content');
    }

    try {
      const { error } = await supabase
        .from('content_items')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting content:', error);
      return false;
    }
  }
};

export default NewsEventsService;