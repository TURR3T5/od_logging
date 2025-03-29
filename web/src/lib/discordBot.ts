// Debug mode flag - set to false in production
const DEBUG_MODE = true;

// Use the existing server endpoints
const API_URL = '/api'; // This will be proxied to your Express server
const API_KEY = import.meta.env.VITE_FIVEM_API_KEY || ''; // Use the same API key as your FiveM server

// Interface for member data
export interface DiscordMember {
  user: {
    id: string;
    username: string;
    avatar?: string;
    global_name?: string;
  };
  roles: string[];
  nick?: string;
  joined_at: string;
}

class DiscordBotService {
  // Test if the bot can access the server
  async testBotAccess(): Promise<boolean> {
    if (DEBUG_MODE) {
      console.log('Testing Discord bot access...');
    }
    
    try {
      const response = await fetch(`${API_URL}/discord/guild-details`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        }
      });
      
      if (!response.ok) {
        if (DEBUG_MODE) {
          console.error('Bot access test failed:', await response.text());
        }
        return false;
      }
      
      const guildData = await response.json();
      if (DEBUG_MODE) {
        console.log('Bot access test success. Guild data:', {
          id: guildData.id,
          name: guildData.name,
          memberCount: guildData.approximate_member_count
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error testing bot access:', error);
      return false;
    }
  }
  
  // Get a user's roles in the target guild
  async getMemberRoles(discordUserId: string): Promise<string[] | null> {
    if (DEBUG_MODE) {
      console.log(`Fetching roles for user ID: ${discordUserId}`);
    }
    
    try {
      const response = await fetch(`${API_URL}/discord/member-roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify({ userId: discordUserId })
      });
      
      if (!response.ok) {
        if (DEBUG_MODE) {
          console.error('Error fetching member roles:', await response.text());
        }
        return null;
      }
      
      const data = await response.json();
      return data.roles;
    } catch (error) {
      console.error('Error getting member roles:', error);
      return null;
    }
  }
  
  // Update or create user roles in our database based on Discord roles
  async syncUserRoles(discordUserId: string): Promise<boolean> {
    if (DEBUG_MODE) {
      console.log(`Syncing roles for user ID: ${discordUserId}`);
    }
    
    try {
      // Use the server endpoint to handle the sync
      const response = await fetch(`${API_URL}/discord/sync-user-roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify({ userId: discordUserId })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error syncing user roles:', errorText);
        return false;
      }
      
      const result = await response.json();
      
      if (DEBUG_MODE && result.success) {
        console.log(`Successfully synced roles for user ${discordUserId}`);
      }
      
      return result.success;
    } catch (error) {
      console.error('Error syncing user roles:', error);
      return false;
    }
  }
  
  // Helper function to check if this service is properly configured
  isConfigured(): boolean {
    return !!API_KEY;
  }
  
  // Debug function to get detailed guild info
  async getGuildDetails(): Promise<any | null> {
    try {
      const response = await fetch(`${API_URL}/discord/guild-details`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        }
      });
      
      if (!response.ok) {
        console.error('Error fetching guild details:', await response.text());
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting guild details:', error);
      return null;
    }
  }
}

// Create and export a singleton instance
const discordBotService = new DiscordBotService();
export default discordBotService;