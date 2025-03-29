// scripts/check-env.js
import * as dotenv from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get directory name in ESM
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables from .env.local
const envPath = resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.warn('⚠️ .env.local file not found');
}

// Required environment variables
const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'FIVEM_API_KEY',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

// Optional variables
const optionalVars = [
  'DISCORD_BOT_TOKEN',
  'DISCORD_SERVER_ID',
  'FIVEM_SERVER_IP'
];

// Check required vars
const missingRequired = requiredVars.filter(v => !process.env[v]);
if (missingRequired.length > 0) {
  console.error('\n❌ Missing required environment variables:');
  missingRequired.forEach(v => console.error(`   - ${v}`));
  process.exit(1);
} else {
  console.log('✅ All required environment variables are present.');
}

// Check optional vars
const missingOptional = optionalVars.filter(v => !process.env[v]);
if (missingOptional.length > 0) {
  console.warn('\n⚠️ Some optional environment variables are missing:');
  missingOptional.forEach(v => console.warn(`   - ${v}`));
  
  if (!process.env.DISCORD_BOT_TOKEN) {
    console.warn('\n⚠️ DISCORD_BOT_TOKEN is not set - Discord bot API will not be available.');
  }
} else {
  console.log('✅ All optional environment variables are present.');
}

console.log('\n✅ Environment check completed.');