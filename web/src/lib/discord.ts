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

export const ROLE_PERMISSIONS = {
  ADMIN_ROLES: [
    "123456789012345678", // Admin role ID
    "876543210987654321", // Mod role ID
  ],
  STAFF_ROLES: [
    "111111111111111111", // Staff role ID
    "222222222222222222", // Helper role ID
  ],
  CONTENT_ROLES: [
    "333333333333333333", // Content Manager role ID
  ],
  VIEWER_ROLES: [
    "444444444444444444", // Viewer role ID
  ]
};

export const ALLOWED_DISCORD_USER_IDS = [
  "256031472605986829",
];

export type PermissionLevel = 'admin' | 'staff' | 'content' | 'viewer' | 'none';

export const hasPermission = (user: any, requiredLevel: PermissionLevel = 'admin'): boolean => {
  if (!user) {
    return false;
  }
  
  const discordId = user.provider_id || user.sub || (user.user_metadata && (user.user_metadata.provider_id || user.user_metadata.sub));
  
  if (discordId && ALLOWED_DISCORD_USER_IDS.includes(discordId)) {
    return true;
  }
  
  const targetGuild: DiscordGuild | undefined = user.guilds?.find((guild: DiscordGuild) => guild.id === TARGET_SERVER_ID);
  if (!targetGuild) {
    return false;
  }
  
  const userRoles = targetGuild.roles || [];
  const userRoleIds = userRoles.map(role => role.id);
  
  switch(requiredLevel) {
    case 'admin':
      return userRoleIds.some(roleId => ROLE_PERMISSIONS.ADMIN_ROLES.includes(roleId));
    case 'staff':
      return userRoleIds.some(roleId => 
        ROLE_PERMISSIONS.ADMIN_ROLES.includes(roleId) || 
        ROLE_PERMISSIONS.STAFF_ROLES.includes(roleId)
      );
    case 'content':
      return userRoleIds.some(roleId => 
        ROLE_PERMISSIONS.ADMIN_ROLES.includes(roleId) || 
        ROLE_PERMISSIONS.STAFF_ROLES.includes(roleId) || 
        ROLE_PERMISSIONS.CONTENT_ROLES.includes(roleId)
      );
    case 'viewer':
      return userRoleIds.some(roleId => 
        ROLE_PERMISSIONS.ADMIN_ROLES.includes(roleId) || 
        ROLE_PERMISSIONS.STAFF_ROLES.includes(roleId) || 
        ROLE_PERMISSIONS.CONTENT_ROLES.includes(roleId) || 
        ROLE_PERMISSIONS.VIEWER_ROLES.includes(roleId)
      );
    default:
      return false;
  }
};

export const getUserPermissionLevel = (user: any): PermissionLevel => {
  if (!user) return 'none';
  
  const discordId = user.provider_id || user.sub || (user.user_metadata && (user.user_metadata.provider_id || user.user_metadata.sub));
  
  if (discordId && ALLOWED_DISCORD_USER_IDS.includes(discordId)) {
    return 'admin';
  }
  
  const targetGuild: DiscordGuild | undefined = user.guilds?.find((guild: DiscordGuild) => guild.id === TARGET_SERVER_ID);
  if (!targetGuild) {
    return 'none';
  }
  
  const userRoles = targetGuild.roles || [];
  const userRoleIds = userRoles.map(role => role.id);
  
  if (userRoleIds.some(roleId => ROLE_PERMISSIONS.ADMIN_ROLES.includes(roleId))) {
    return 'admin';
  }
  if (userRoleIds.some(roleId => ROLE_PERMISSIONS.STAFF_ROLES.includes(roleId))) {
    return 'staff';
  }
  if (userRoleIds.some(roleId => ROLE_PERMISSIONS.CONTENT_ROLES.includes(roleId))) {
    return 'content';
  }
  if (userRoleIds.some(roleId => ROLE_PERMISSIONS.VIEWER_ROLES.includes(roleId))) {
    return 'viewer';
  }
  
  return 'none';
};