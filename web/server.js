import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';

dotenv.config({ path: './.env.local' });
const app = express();
const PORT = 3001;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const fivemApiKey = process.env.FIVEM_API_KEY;
const FIVEM_SERVER_IP = '195.60.166.90:30120';

if (!supabaseUrl || !supabaseServiceKey || !fivemApiKey) {
	console.error('Missing required environment variables. Please check your .env file.');
	process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

app.use(
	cors({
		origin: '*',
		methods: ['GET', 'POST', 'OPTIONS'],
		allowedHeaders: ['X-API-KEY', 'Content-Type', 'Authorization'],
	})
);
app.use(bodyParser.json());

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
			console.log('Full Server Info:', JSON.stringify(serverInfo, null, 2));
			return serverInfo;
		} catch (error) {
			console.error('Error fetching server info:', error);
			return null;
		}
	}
}

app.get('/server-stats', async (req, res) => {
	try {
		const statsTracker = new FiveMStats(FIVEM_SERVER_IP);

		const [onlinePlayers, serverInfo] = await Promise.all([statsTracker.getPlayers(), statsTracker.getServerInfo()]);

		const serverStartTime = serverInfo?.vars?.sv_serverStartTime ? new Date(parseInt(serverInfo.vars.sv_serverStartTime)) : process.env.SERVER_START_TIME ? new Date(process.env.SERVER_START_TIME) : new Date();

		const serverStats = {
			onlinePlayers,
			maxPlayers: serverInfo?.vars?.sv_maxClients || 64,
			uptime: serverInfo?.uptime || 0,
			uptimeDetails: serverInfo?.vars?.sv_serverStartTime || 0,
		};

		res.json(serverStats);
	} catch (error) {
		console.error('Error fetching server stats:', error);
		res.status(500).json({ error: 'Failed to fetch server statistics' });
	}
});

function formatUptime(seconds) {
	const days = Math.floor(seconds / (24 * 3600));
	const hours = Math.floor((seconds % (24 * 3600)) / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);

	return `${days}d ${hours}h ${minutes}m`;
}

const verifyApiKey = (req, res, next) => {
	const apiKey = req.headers['x-api-key'];
	if (apiKey !== fivemApiKey) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
	next();
};

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
				server_id: 'server_name',
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

app.listen(PORT, () => {
	console.log(`API Server running on http://localhost:${PORT}`);
});

export default app;
