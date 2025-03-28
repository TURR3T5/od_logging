import { supabase } from './supabase';

export interface DiscordUser {
  avatar_url?: string;
  email?: string;
  email_verified?: boolean;
  full_name?: string;
  iss?: string;
  name?: string;
  phone_verified?: boolean;
  picture?: string;
  provider_id?: string;
  sub?: string;
  custom_claims?: {
    global_name?: string;
  };
  id?: string;
  username?: string;
  avatar?: string;
  discriminator?: string;
  
  user_metadata?: {
    provider_id?: string;
    sub?: string;
    avatar_url?: string;
    email?: string;
  };
  
  public_flags?: number;
  premium_type?: number;
  flags?: number;
  banner?: string | null;
  accent_color?: number | null;
  global_name?: string;
  avatar_decoration?: string | null;
  banner_color?: string | null;
  mfa_enabled?: boolean;
  locale?: string;
  verified?: boolean;
  guilds?: DiscordGuild[];
}
  
export interface DiscordGuild {
  id: string;
  name: string;
  icon: string;
  owner: boolean;
  permissions: number;
  features: string[];
  permissions_new: string;
  roles?: DiscordRole[];
}

export interface DiscordRole {
  id: string;
  name: string;
  color: number;
  hoist: boolean;
  position: number;
  permissions: string;
  managed: boolean;
  mentionable: boolean;
}

// Using the hard-coded target server ID from the codebase
export const TARGET_SERVER_ID = "679360230299140114";

// List of allowed Discord user IDs for fall-back authorization
export const ALLOWED_DISCORD_USER_IDS = [
  "256031472605986829",
];

export type PermissionLevel = 'admin' | 'staff' | 'content' | 'viewer' | 'none';

export const hasPermission = async (user: any, requiredLevel: PermissionLevel = 'admin'): Promise<boolean> => {
  if (!user) return false;
  
  try {
    // Get Discord ID - try all possible locations
    const discordId = user.provider_id || user.sub || user.id || 
      (user.user_metadata && (user.user_metadata.provider_id || user.user_metadata.sub));
    
    if (!discordId) {
      console.warn('No Discord ID found in user object:', user);
      return false;
    }
    
    // If the user is in the allow list, give them admin permissions
    if (ALLOWED_DISCORD_USER_IDS.includes(discordId)) {
      return true;
    }
    
    // Get valid Discord roles from database
    const { data: rolePermissions, error } = await supabase
      .from('role_permissions')
      .select('*')
      .single();
    
    if (error) {
      console.error('Error fetching role permissions:', error);
      return false;
    }
    
    if (!rolePermissions) {
      console.warn('No role permissions found in database');
      return false;
    }
    
    // Get user's Discord roles from the target server
    const targetGuild = user.guilds?.find((guild: any) => guild.id === TARGET_SERVER_ID);
    
    if (!targetGuild) {
      console.warn(`Target server (${TARGET_SERVER_ID}) not found in user's guilds`);
      return false;
    }
    
    if (!targetGuild.roles) {
      console.warn('No roles found in target guild');
      return false;
    }
    
    const userRoleIds = targetGuild.roles.map((role: any) => role.id);
    
    // Check if user has any of the required roles
    switch(requiredLevel) {
      case 'admin':
        return userRoleIds.some((roleId: string) => rolePermissions.admin_roles.includes(roleId));
      case 'staff':
        return userRoleIds.some((roleId: string) => 
          rolePermissions.admin_roles.includes(roleId) || 
          rolePermissions.staff_roles.includes(roleId)
        );
      case 'content':
        return userRoleIds.some((roleId: string) => 
          rolePermissions.admin_roles.includes(roleId) || 
          rolePermissions.staff_roles.includes(roleId) || 
          rolePermissions.content_roles.includes(roleId)
        );
      case 'viewer':
        return userRoleIds.some((roleId: string) => 
          rolePermissions.admin_roles.includes(roleId) || 
          rolePermissions.staff_roles.includes(roleId) || 
          rolePermissions.content_roles.includes(roleId) || 
          rolePermissions.viewer_roles.includes(roleId)
        );
      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

export const getUserPermissionLevel = async (user: any): Promise<PermissionLevel> => {
  if (!user) return 'none';
  
  try {
    // Short-circuit for allowed users
    const discordId = user.provider_id || user.sub || user.id || 
      (user.user_metadata && (user.user_metadata.provider_id || user.user_metadata.sub));
    
    if (ALLOWED_DISCORD_USER_IDS.includes(discordId)) {
      return 'admin';
    }
    
    if (await hasPermission(user, 'admin')) return 'admin';
    if (await hasPermission(user, 'staff')) return 'staff';
    if (await hasPermission(user, 'content')) return 'content';
    if (await hasPermission(user, 'viewer')) return 'viewer';
    
    return 'none';
  } catch (error) {
    console.error('Error getting user permission level:', error);
    return 'none';
  }
};