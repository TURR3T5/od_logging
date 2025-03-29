import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import axios from 'axios';

dotenv.config({ path: './.env.local' });
const app = express();
const PORT = process.env.PORT || 3001;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const fivemApiKey = process.env.FIVEM_API_KEY;
const FIVEM_SERVER_IP = process.env.FIVEM_SERVER_IP || '195.60.166.90:30120';

const DISCORD_API_URL = 'https://discord.com/api/v10';
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_API_KEY = process.env.DISCORD_API_KEY || fivemApiKey;
const TARGET_SERVER_ID = process.env.DISCORD_SERVER_ID || '679360230299140114';

if (!supabaseUrl || !supabaseServiceKey || !fivemApiKey) {
	console.error('Missing required environment variables. Please check your .env file.');
	process.exit(1);
}

if (!DISCORD_BOT_TOKEN) {
  console.warn('DISCORD_BOT_TOKEN is not set. Discord bot API functionality will not be available.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

app.use(
	cors({
		origin: process.env.CORS_ORIGIN || '*',
		methods: ['GET', 'POST', 'OPTIONS'],
		allowedHeaders: ['X-API-KEY', 'Content-Type', 'Authorization'],
	})
);
app.use(bodyParser.json());

/* Server Stats */

class FiveMStats {
	constructor(ip) {
		if (!ip) throw new Error('Please provide an IP.');
		this.ip = ip;
	}

	async getPlayers() {
		try {
			const response = await fetch(`http://${this.ip}/players.json`);
			const players = await response.json();
			return players.length;
		} catch (error) {
			console.error('Error fetching players:', error);
			return 0;
		}
	}

	async getPlayersDetails() {
		try {
			const response = await fetch(`http://${this.ip}/players.json`);
			return await response.json();
		} catch (error) {
			console.error('Error fetching player details:', error);
			return [];
		}
	}

	async getServerInfo() {
		try {
			const response = await fetch(`http://${this.ip}/info.json`);
			const serverInfo = await response.json();
			return serverInfo;
		} catch (error) {
			console.error('Error fetching server info:', error);
			return null;
		}
	}
  async isServerOnline() {
    try {
      await fetch(`http://${this.ip}/info.json`, { timeout: 5000 });
      return 'online';
    } catch (error) {
      console.error('Error fetching server info:', error);
      return 'offline';
    }
  }
}

app.get('/server-stats', async (req, res) => {
	try {
		const statsTracker = new FiveMStats(FIVEM_SERVER_IP);

		const [onlinePlayers, serverInfo, status] = await Promise.all([statsTracker.getPlayers(), statsTracker.getServerInfo(), statsTracker.isServerOnline()]);

		const serverStats = {
			onlinePlayers,
			maxPlayers: serverInfo?.vars?.sv_maxClients || 64,
			whitelistCount: 0,
      status: status || 'offline',
		};

		res.json(serverStats);
	} catch (error) {
		console.error('Error fetching server stats:', error);
		res.status(500).json({ error: 'Failed to fetch server statistics' });
	}
});

const verifyApiKey = (req, res, next) => {
	const apiKey = req.headers['x-api-key'];
	if (apiKey !== fivemApiKey) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
	next();
};

const verifyDiscordApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!DISCORD_BOT_TOKEN) {
    return res.status(503).json({ error: 'Discord bot API is not configured' });
  }
  if (apiKey !== DISCORD_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

/* Logging system */

app.get('/', (req, res) => {
	res.json({
		message: 'FiveM logging API is running',
		usage: {
			method: 'POST',
			endpoint: '/log',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': 'your-api-key-here',
			},
		},
	});
});

app.get('/log', (req, res) => {
	res.json({
		message: 'This is the FiveM logging API endpoint. It accepts POST requests with a valid API key.',
		usage: {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': 'your-api-key-here',
			},
			body: {
				server_id: 'server_ingame_id',
				event_type: 'event_name',
				category: 'category_name',
				type: 'type_name',
				player_id: 'optional_player_id (Steam ID)',
				player_name: 'optional_player_name (In-game character name)',
				discord_id: 'optional_discord_id',
				details: {},
			},
		},
		categories: ['economy', 'inventory', 'player', 'vehicles', 'mechanic', 'crime', 'drugs', 'illegal', 'business', 'food', 'comms', 'social', 'housing', 'admin', 'police', 'crafting'],
	});
});

app.post('/log', verifyApiKey, async (req, res) => {
	try {
		const { server_id, event_type, category, type, player_id, player_name, discord_id, details = {} } = req.body;

		if (!server_id || !event_type) {
			return res.status(400).json({ error: 'Missing required fields' });
		}

		const { data, error } = await supabase.from('logs').insert([
			{
				server_id,
				event_type,
				category,
				type,
				player_id,
				player_name,
				discord_id,
				details,
			},
		]);

		if (error) {
			console.error('Supabase error:', error);
			return res.status(500).json({ error: 'Failed to log event', details: error });
		}

		return res.status(200).json({ success: true, data });
	} catch (error) {
		return res.status(500).json({ error: 'Unexpected error logging event', details: error.message });
	}
});

/* Discord bot API endpoints */

app.get('/discord', (req, res) => {
  if (!DISCORD_BOT_TOKEN) {
    return res.status(503).json({ 
      status: 'unavailable',
      message: 'Discord bot API is not configured' 
    });
  }
  
  res.json({
    status: 'available',
    message: 'Discord Bot API is running',
    endpoints: {
      '/discord/guild-details': 'GET - Returns details about the Discord server',
      '/discord/member-roles': 'POST - Returns roles for a specific Discord user'
    }
  });
});

app.get('/discord/guild-details', verifyDiscordApiKey, async (req, res) => {
  if (!DISCORD_BOT_TOKEN) {
    return res.status(503).json({ error: 'Discord bot API is not configured' });
  }
  
  try {
    const guildResponse = await axios.get(`${DISCORD_API_URL}/guilds/${TARGET_SERVER_ID}`, {
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`
      }
    });

    const rolesResponse = await axios.get(`${DISCORD_API_URL}/guilds/${TARGET_SERVER_ID}/roles`, {
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`
      }
    });

    res.json({
      ...guildResponse.data,
      roles: rolesResponse.data
    });
  } catch (error) {
    console.error('Error fetching guild details:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch guild details',
      details: error.response?.data || error.message
    });
  }
});

app.post('/discord/member-roles', verifyDiscordApiKey, async (req, res) => {
  if (!DISCORD_BOT_TOKEN) {
    return res.status(503).json({ error: 'Discord bot API is not configured' });
  }
  
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  
  try {
    const response = await axios.get(`${DISCORD_API_URL}/guilds/${TARGET_SERVER_ID}/members/${userId}`, {
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`
      }
    });
    
    res.json({ roles: response.data.roles });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.json({ roles: [] });
    }
    
    console.error('Error fetching member roles:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch member roles',
      details: error.response?.data || error.message
    });
  }
});

app.post('/discord/sync-user-roles', verifyDiscordApiKey, async (req, res) => {
  if (!DISCORD_BOT_TOKEN) {
    return res.status(503).json({ error: 'Discord bot API is not configured' });
  }
  
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  
  try {
    let roles = [];
    try {
      const response = await axios.get(`${DISCORD_API_URL}/guilds/${TARGET_SERVER_ID}/members/${userId}`, {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`
        }
      });
      roles = response.data.roles;
    } catch (error) {
      if (error.response?.status === 404) {
        roles = [];
      } else {
        throw error;
      }
    }
    
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('discord_id', userId);
      
    if (deleteError) {
      throw deleteError;
    }
    
    if (roles.length > 0) {
      const roleEntries = roles.map(roleId => ({
        discord_id: userId,
        role_id: roleId
      }));
      
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert(roleEntries);
        
      if (insertError) {
        throw insertError;
      }
    }
    
    res.json({ 
      success: true, 
      message: `Successfully synced ${roles.length} roles for user ${userId}` 
    });
  } catch (error) {
    console.error('Error syncing user roles:', error);
    res.status(500).json({
      error: 'Failed to sync user roles',
      details: error.response?.data || error.message || error
    });
  }
});

app.listen(PORT, () => {
	console.log(`API Server running on http://localhost:${PORT}`);
});

export default app;