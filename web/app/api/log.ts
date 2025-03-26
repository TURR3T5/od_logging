import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../src/types/supabase'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const fivemApiKey = process.env.FIVEM_API_KEY || ''

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

export async function GET() {
  return NextResponse.json({
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
        category: 'category_name',
        type: 'type_name',
        player_id: 'optional_player_id (Steam ID)',
        player_name: 'optional_player_name (In-game character name)',
        details: { 
          /* additional details */ 
          discord_id: 'optional_discord_id',
          // Any other relevant details for the specific log type
        }
      }
    },
    categories: [
      "economy", "inventory", "player", "vehicles", "mechanic",
      "crime", "drugs", "illegal", "business", "food",
      "comms", "social", "housing", "admin", "police", "crafting"
    ]
  })
}

export async function POST(request: NextRequest) {
  // Check API key
  const apiKey = request.headers.get('x-api-key')
  if (apiKey !== fivemApiKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      server_id,
      event_type,
      category,
      type,
      player_id,
      player_name,
      details
    } = body

    // Validate required fields
    if (!server_id || !event_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Insert log into Supabase
    const { data, error } = await supabase
      .from('logs')
      .insert([
        {
          server_id,
          event_type,
          category,
          type,
          player_id,
          player_name,
          details
        }
      ])

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error logging event:', error.message)
    return NextResponse.json({ error: 'Failed to log event' }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'X-API-KEY, Content-Type, Authorization'
    }
  })
}