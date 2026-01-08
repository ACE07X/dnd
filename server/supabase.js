// Supabase client configuration for DND RPG
import { createClient } from '@supabase/supabase-js';

// Development fallback credentials (for local testing)
const supabaseUrl = process.env.SUPABASE_URL || 'https://rbntmispjerdmimobglj.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJibnRtaXNwamVyZG1pbW9iZ2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4OTgzNzIsImV4cCI6MjA4MzQ3NDM3Mn0.Bz9uT_t0L6UR0o6YKs5T3MC_djc6cbn9WBsSAGJH2Z0';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJibnRtaXNwamVyZG1pbW9iZ2xqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg5ODM3MiwiZXhwIjoyMDgzNDc0MzcyfQ.7SBMHM9Zp--rUHbGIuJ4tI1A7YeKuvrmXYGocCKctNM';

// Client for frontend use (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export { supabaseUrl };
