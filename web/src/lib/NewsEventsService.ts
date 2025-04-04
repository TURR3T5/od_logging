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
const invalidateAllContentCaches = () => {
  cacheService.invalidate(CACHE_KEY_ALL_CONTENT);
  cacheService.invalidate(CACHE_KEY_NEWS);
  cacheService.invalidate(CACHE_KEY_EVENTS);
  cacheService.invalidate(CACHE_KEY_PINNED);
};
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
      }
      const userPermissionLevel = permissionHierarchy[data.role] || -1;
      const requiredPermissionLevel = permissionHierarchy[requiredLevel] || 1;
      return userPermissionLevel >= requiredPermissionLevel;
    } catch (error) {
      console.error('Error in email permission check:', error);
      return false;
    }
}
export const NewsEventsService = {
  async getAllContent(): Promise<ContentItem[]> {
    const cached = cacheService.get<ContentItem[]>(CACHE_KEY_ALL_CONTENT);
    if (cached) {
      return cached;
    }
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
      if (content.type === 'news' && content.news_type) {
        const { error: newsError } = await supabase
          .from('news_metadata')
          .insert({
            content_id: contentData.id,
            news_type: content.news_type
          });
        if (newsError) throw newsError;
      }
      if (content.type === 'event' && content.event_type && content.event_date) {
        const { error: eventError } = await supabase
          .from('event_metadata')
          .insert({
            content_id: contentData.id,
            event_type: content.event_type,
            event_date: typeof content.event_date === 'string' ? content.event_date : content.event_date?.toISOString(),
            location: content.location,
            address: content.address
          });
        if (eventError) throw eventError;
      }
      if (content.tags && content.tags.length > 0) {
        const tagEntries = content.tags.map(tag => ({
          content_id: contentData.id,
          tag
        }));
        const { error: tagsError } = await supabase
          .from('content_tags')
          .insert(tagEntries);
        if (tagsError) throw tagsError;
      }
      invalidateAllContentCaches();
      return contentData.id;
    } catch (error: any) {
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
      const { data: currentItem, error: fetchError } = await supabase
        .from('content_items')
        .select('*')
        .eq('id', id)
        .single();
      if (fetchError) throw fetchError;
      if (!currentItem) throw new Error('Content item not found');
      const contentUpdates: any = {};
      if (updates.title !== undefined) contentUpdates.title = updates.title;
      if (updates.description !== undefined) contentUpdates.description = updates.description;
      if (updates.content !== undefined) contentUpdates.content = updates.content;
      if (updates.is_pinned !== undefined) contentUpdates.is_pinned = updates.is_pinned;
      if (updates.category !== undefined) contentUpdates.category = updates.category;
      if (updates.updated_by) contentUpdates.updated_by = updates.updated_by;
      if (updates.last_updated) contentUpdates.last_updated = updates.last_updated;
      const { error: updateError } = await supabase
        .from('content_items')
        .update(contentUpdates)
        .eq('id', id);
      if (updateError) throw updateError;
      if (currentItem.type === 'news' && updates.news_type) {
        const { data: existingNewsMetadata, error: metaCheckError } = await supabase
          .from('news_metadata')
          .select('*')
          .eq('content_id', id)
          .single();
        if (metaCheckError && metaCheckError.code !== 'PGRST116') {
          throw metaCheckError;
        }
        if (existingNewsMetadata) {
          const { error: newsUpdateError } = await supabase
            .from('news_metadata')
            .update({ news_type: updates.news_type })
            .eq('content_id', id);
          if (newsUpdateError) throw newsUpdateError;
        } else {
          const { error: newsInsertError } = await supabase
            .from('news_metadata')
            .insert({ content_id: id, news_type: updates.news_type });
          if (newsInsertError) throw newsInsertError;
        }
      }
      if (currentItem.type === 'event') {
        if (updates.event_type || updates.event_date || updates.location !== undefined || updates.address !== undefined) {
          const { data: existingEventMetadata, error: eventMetaCheckError } = await supabase
            .from('event_metadata')
            .select('*')
            .eq('content_id', id)
            .single();
          if (eventMetaCheckError && eventMetaCheckError.code !== 'PGRST116') {
            throw eventMetaCheckError;
          }
          const eventUpdates: any = { content_id: id };
          if (updates.event_type) eventUpdates.event_type = updates.event_type;
          if (updates.event_date) {
            eventUpdates.event_date = typeof updates.event_date === 'string' 
              ? updates.event_date 
              : updates.event_date?.toISOString();
          }
          if (updates.location !== undefined) eventUpdates.location = updates.location;
          if (updates.address !== undefined) eventUpdates.address = updates.address;
          if (existingEventMetadata) {
            const { error: eventUpdateError } = await supabase
              .from('event_metadata')
              .update(eventUpdates)
              .eq('content_id', id);
            if (eventUpdateError) throw eventUpdateError;
          } else {
            const { error: eventInsertError } = await supabase
              .from('event_metadata')
              .insert(eventUpdates);
            if (eventInsertError) throw eventInsertError;
          }
        }
      }
      if (updates.tags) {
        const { error: deleteTagsError } = await supabase
          .from('content_tags')
          .delete()
          .eq('content_id', id);
        if (deleteTagsError) throw deleteTagsError;
        if (updates.tags.length > 0) {
          const tagEntries = updates.tags.map(tag => ({
            content_id: id,
            tag
          }));
          const { error: insertTagsError } = await supabase
            .from('content_tags')
            .insert(tagEntries);
          if (insertTagsError) throw insertTagsError;
        }
      }
      invalidateAllContentCaches();
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
      try {
        await supabase
          .from('news_metadata')
          .delete()
          .eq('content_id', id);
        await supabase
          .from('event_metadata')
          .delete()
          .eq('content_id', id);
        await supabase
          .from('content_tags')
          .delete()
          .eq('content_id', id);
      } catch (cleanupError) {
        console.error('Error cleaning up related content:', cleanupError);
      }
      const { error } = await supabase
        .from('content_items')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('Error deleting content_items row:', error);
        throw error;
      }
      invalidateAllContentCaches();
      return true;
    } catch (error) {
      console.error('Error deleting content:', error);
      return false;
    }
  }
};
export default NewsEventsService;