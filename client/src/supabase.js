import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rbntmispjerdmimobglj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJibnRtaXNwamVyZG1pbW9iZ2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4OTgzNzIsImV4cCI6MjA4MzQ3NDM3Mn0.Bz9uT_t0L6UR0o6YKs5T3MC_djc6cbn9WBsSAGJH2Z0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });
    return { data, error };
}

export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    return { data, error };
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
}

export async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
}

export async function getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
}

// Subscribe to auth changes
export function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
}

export default supabase;
