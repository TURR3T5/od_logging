
import { supabase } from './supabase';
import cacheService from './CacheService';

export interface DiscordRole {
  id: string;
  name: string;
  permission_level: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface RoleChange {
  id: string;
  role_id: string;
  previous_level: string;
  new_level: string;
  previous_active: boolean;
  new_active: boolean;
  changed_at: string;
  changed_by: string;
}

const CACHE_KEY_ROLES = 'discord_roles';
const CACHE_KEY_CHANGES = 'role_changes';

export const RoleManagementService = {
  async getRoles(): Promise<DiscordRole[]> {
    const cached = cacheService.get<DiscordRole[]>(CACHE_KEY_ROLES);
    if (cached) return cached;
    
    try {
      const { data, error } = await supabase
        .from('discord_roles')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      cacheService.set(CACHE_KEY_ROLES, data || [], { expiryInMinutes: 15 });
      return data || [];
    } catch (error) {
      console.error('Error fetching roles:', error);
      return [];
    }
  },
  
  async getRoleChanges(roleId?: string): Promise<RoleChange[]> {
    const cacheKey = roleId 
      ? `${CACHE_KEY_CHANGES}_${roleId}` 
      : CACHE_KEY_CHANGES;
    
    const cached = cacheService.get<RoleChange[]>(cacheKey);
    if (cached) return cached;
    
    try {
      let query = supabase
        .from('role_changes')
        .select('*')
        .order('changed_at', { ascending: false });
        
      if (roleId) {
        query = query.eq('role_id', roleId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      cacheService.set(cacheKey, data || [], { expiryInMinutes: 15 });
      return data || [];
    } catch (error) {
      console.error('Error fetching role changes:', error);
      return [];
    }
  },
  
  async createRole(role: Omit<DiscordRole, 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('discord_roles')
        .insert({
          id: role.id,
          name: role.name,
          permission_level: role.permission_level,
          is_active: role.is_active || true,
          updated_by: role.updated_by
        });
        
      if (error) throw error;
      
      cacheService.invalidate(CACHE_KEY_ROLES);
      return true;
    } catch (error) {
      console.error('Error creating role:', error);
      return false;
    }
  },
  
  async updateRole(id: string, updates: Partial<DiscordRole>): Promise<boolean> {
    try {
      const roleUpdates: any = { 
        updated_at: new Date().toISOString() 
      };
      
      if (updates.name !== undefined) roleUpdates.name = updates.name;
      if (updates.permission_level !== undefined) roleUpdates.permission_level = updates.permission_level;
      if (updates.is_active !== undefined) roleUpdates.is_active = updates.is_active;
      if (updates.updated_by) roleUpdates.updated_by = updates.updated_by;
      
      const { error } = await supabase
        .from('discord_roles')
        .update(roleUpdates)
        .eq('id', id);
        
      if (error) throw error;
      
      cacheService.invalidate(CACHE_KEY_ROLES);
      cacheService.invalidate(CACHE_KEY_CHANGES);
      cacheService.invalidate(`${CACHE_KEY_CHANGES}_${id}`);
      
      return true;
    } catch (error) {
      console.error('Error updating role:', error);
      return false;
    }
  },
  
  async deleteRole(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('discord_roles')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      cacheService.invalidate(CACHE_KEY_ROLES);
      cacheService.invalidate(CACHE_KEY_CHANGES);
      cacheService.invalidate(`${CACHE_KEY_CHANGES}_${id}`);
      
      return true;
    } catch (error) {
      console.error('Error deleting role:', error);
      return false;
    }
  }
};

export default RoleManagementService;