export interface DiscordUser {
  // Existing properties
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
  
  // Add this new property to match the nested structure
  user_metadata?: {
    provider_id?: string;
    sub?: string;
    avatar_url?: string;
    email?: string;
    // Other possible nested properties
  };
  
  // Rest of the existing properties
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
  
  export const ALLOWED_ROLE_IDS = [
    // Role ids skibidi?
    "123456789012345678",
    "876543210987654321",
  ];

  export const ALLOWED_DISCORD_USER_IDS = [
    "256031472605986829", // Your Discord user ID
    // Add other authorized user IDs here
  ];
  
export const hasPermission = (user: any): boolean => {
  if (!user) {
    console.log("hasPermission: No user provided");
    return false;
  }
  
  // Log all potential ID fields to see what we're working with
  console.log("hasPermission checking user:", user);
  
  // Check if the provided Discord ID is in our allowed list
  const discordId = user.provider_id || user.sub || 
                    (user.user_metadata && (user.user_metadata.provider_id || user.user_metadata.sub));
  
  console.log("Discord ID extracted:", discordId);
  console.log("Allowed IDs:", ALLOWED_DISCORD_USER_IDS);
  
  if (discordId && ALLOWED_DISCORD_USER_IDS.includes(discordId)) {
    console.log("User authorized!");
    return true;
  }
  
  console.log("User not authorized");
  return false;
};