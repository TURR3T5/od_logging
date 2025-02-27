import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = "https://wisaxuzzzebogbhkeyuc.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indpc2F4dXp6emVib2diaGtleXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjYxMjgsImV4cCI6MjA1NjI0MjEyOH0.GEz0yPEj5gIWSL15Rme86uq2zYJsVMPCd9uG84YvwUY";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env.local file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);