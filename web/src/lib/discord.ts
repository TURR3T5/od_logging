import { supabase } from './supabase';
import discordBotService from './discordBot';
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
export const TARGET_SERVER_ID = "679360230299140114";
export type PermissionLevel = 'admin' | 'staff' | 'content' | 'viewer' | 'none';
export const hasPermission = async (user: any, requiredLevel: PermissionLevel = 'admin'): Promise<boolean> => {
  if (!user) return false;
  if (user.email) {
    const userEmail = user.email.toLowerCase();
    const ADMIN_EMAILS = ['casper.truberg@outlook.dk']; 
    if (ADMIN_EMAILS.includes(userEmail)) {
      return true;
    }
    try {
      const { data: emailRole, error: emailRoleError } = await supabase
        .from('user_roles_email')
        .select('role')
        .eq('email', userEmail);
      if (!emailRoleError && emailRole && emailRole.length > 0) {
        let highestRole = 'none';
        const permissionHierarchy: Record<string, number> = {
          'admin': 4,
          'staff': 3,
          'content': 2,
          'viewer': 1,
          'none': 0
        };
        for (const role of emailRole) {
          if (!role.role) continue;
          if ((permissionHierarchy[role.role] || 0) > (permissionHierarchy[highestRole] || 0)) {
            highestRole = role.role;
          }
        }
        switch(requiredLevel) {
          case 'admin':
            return highestRole === 'admin';
          case 'staff':
            return ['admin', 'staff'].includes(highestRole);
          case 'content':
            return ['admin', 'staff', 'content'].includes(highestRole);
          case 'viewer':
            return ['admin', 'staff', 'content', 'viewer'].includes(highestRole);
          default:
            return false;
        }
      }
    } catch (emailError) {
      console.error('Error checking email permissions:', emailError);
    }
  }
  try {
    const discordId = user.provider_id || user.sub || user.id || 
      (user.user_metadata && (user.user_metadata.provider_id || user.user_metadata.sub));
    if (!discordId) {
      console.warn('No Discord ID found in user object:', user);
      return requiredLevel === 'viewer' && user.email ? true : false;
    }
    if (process.env.ALLOWED_DISCORD_IDS?.includes(discordId)) {
      return true;
    }
    const { data: rolePermissionsData, error: rolePermissionsError } = await supabase
      .from('role_permissions')
      .select('*');
    if (rolePermissionsError || !rolePermissionsData || rolePermissionsData.length === 0) {
      console.warn('No role permissions found in database');
      return false;
    }
    const rolePermissions = rolePermissionsData[0];
    if (discordBotService.isConfigured()) {
      await discordBotService.syncUserRoles(discordId);
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('discord_id', discordId);
      if (userRolesError) {
        console.error('Error fetching user roles:', userRolesError);
      }
      if (userRoles && userRoles.length > 0) {
        const userRoleIds = userRoles.map(ur => ur.role_id);
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
      }
    }
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
    const discordId = user.provider_id || user.sub || user.id || 
      (user.user_metadata && (user.user_metadata.provider_id || user.user_metadata.sub));
    if (process.env.ALLOWED_DISCORD_IDS?.includes(discordId)) {
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