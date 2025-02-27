export interface DiscordUser {
    id: string;
    username: string;
    avatar: string;
    discriminator: string;
    public_flags: number;
    premium_type: number;
    flags: number;
    banner: string | null;
    accent_color: number | null;
    global_name: string;
    avatar_decoration: string | null;
    banner_color: string | null;
    mfa_enabled: boolean;
    locale: string;
    email: string;
    verified: boolean;
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
  
  export const ALLOWED_ROLE_IDS = [
    // Role ids skibidi?
    "123456789012345678",
    "876543210987654321",
  ];
  
  // Do they have permissioners?
  export const hasPermission = (user: DiscordUser | null): boolean => {
    if (!user || !user.guilds) return false;
    
    for (const guild of user.guilds) {
      if (!guild.roles) continue;
      
      for (const role of guild.roles) {
        if (ALLOWED_ROLE_IDS.includes(role.id)) {
          return true;
        }
      }
    }
    
    return false;
  };