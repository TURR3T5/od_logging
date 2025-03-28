// src/lib/discordApi.ts
import { supabase } from './supabase';

const DISCORD_API_URL = 'https://discord.com/api/v10';

export interface DiscordGuild {
    id: string;
    name: string;
    icon: string;
    owner: boolean;
    permissions: number | string;  // Support both number and string formats
    features: string[];
    permissions_new: string;  // Add this missing property
    roles?: DiscordRole[];    // Optional roles property
  }

  export interface GuildMember {
    user: {
      id: string;
      username: string;
      avatar: string;
    };
    nick: string | null;
    roles: string[];
    joined_at: string;
  }
  
  // Add DiscordRole interface to match discord.ts
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
// Get the user's Discord guilds
export const getUserGuilds = async (): Promise<DiscordGuild[] | null> => {
  try {
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('No active session found');
      return null;
    }
    
    // Get provider token (Discord access token) from the session
    const providerToken = session.provider_token;
    
    if (!providerToken) {
      console.error('No provider token found in session');
      return null;
    }
    
    // Fetch guilds from Discord API
    const response = await fetch(`${DISCORD_API_URL}/users/@me/guilds`, {
      headers: {
        Authorization: `Bearer ${providerToken}`
      }
    });
    
    if (!response.ok) {
      console.error('Failed to fetch guilds:', await response.text());
      return null;
    }
    
    const guilds: DiscordGuild[] = await response.json();
    console.log('Fetched guilds from Discord API:', guilds.length);
    return guilds;
  } catch (error) {
    console.error('Error fetching guilds:', error);
    return null;
  }
};

// Get the user's roles in a specific guild
export const getGuildMember = async (guildId: string): Promise<GuildMember | null> => {
  try {
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('No active session found');
      return null;
    }
    
    // Get provider token (Discord access token) from the session
    const providerToken = session.provider_token;
    
    if (!providerToken) {
      console.error('No provider token found in session');
      return null;
    }
    
    // Get user ID from the session
    const userId = session.user?.user_metadata?.provider_id || 
                  session.user?.user_metadata?.sub ||
                  session.user?.id;
    
    if (!userId) {
      console.error('No user ID found in session');
      return null;
    }
    
    // Fetch member data from Discord API
    const response = await fetch(`${DISCORD_API_URL}/guilds/${guildId}/members/${userId}`, {
      headers: {
        Authorization: `Bearer ${providerToken}`
      }
    });
    
    if (!response.ok) {
      // Note: This endpoint may need a bot token instead of a user token
      // If you get 401/403 errors, you may need to use a different approach
      console.error('Failed to fetch guild member:', await response.text());
      return null;
    }
    
    const member: GuildMember = await response.json();
    return member;
  } catch (error) {
    console.error('Error fetching guild member:', error);
    return null;
  }
};

// Get all available guilds and roles in one call
export const getDiscordUserData = async () => {
  const guilds = await getUserGuilds();
  
  if (!guilds) {
    return null;
  }
  
  // Optional: Fetch additional data for each guild (like roles)
  // Note: This might not work with user tokens alone, depending on Discord's API
  
  return {
    guilds,
    fetchedAt: new Date().toISOString()
  };
};