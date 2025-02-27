
import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/types/supabase'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const fivemApiKey = process.env.FIVEM_API_KEY || ''

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-API-KEY, Content-Type, Authorization'
  )
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS'
  )

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'This is the FiveM logging API endpoint. It accepts POST requests with a valid API key.',
      usage: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'your-api-key-here'
        },
        body: {
          server_id: 'server_name',
          event_type: 'event_name',
          player_id: 'optional_player_id',
          player_name: 'optional_player_name',
          details: { /* additional details */ }
        }
      }
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = req.headers['x-api-key']
  if (apiKey !== fivemApiKey) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const {
      server_id,
      event_type,
      player_id,
      player_name,
      details
    } = req.body

    // Validate required fields
    if (!server_id || !event_type) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Insert log into Supabase
    const { data, error } = await supabase
      .from('logs')
      .insert([
        {
          server_id,
          event_type,
          player_id,
          player_name,
          details
        }
      ])

    if (error) {
      throw error
    }

    return res.status(200).json({ success: true, data })
  } catch (error: any) {
    console.error('Error logging event:', error.message)
    return res.status(500).json({ error: 'Failed to log event' })
  }
}