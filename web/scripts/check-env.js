import * as dotenv from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const envPath = resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.warn('⚠️ .env.local file not found');
}

const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'FIVEM_API_KEY',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

const missingRequired = requiredVars.filter(v => !process.env[v]);
if (missingRequired.length > 0) {
  console.error('\n❌ Missing required environment variables:');
  missingRequired.forEach(v => console.error(`   - ${v}`));
  process.exit(1);
} else {
  console.log('✅ All required environment variables are present.');
}

console.log('\n✅ Environment check completed.');