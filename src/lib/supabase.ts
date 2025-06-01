import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://feendqwrkczannagkngk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlZW5kcXdya2N6YW5uYWdrbmdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwNTgwOTUsImV4cCI6MjA2MzYzNDA5NX0.UoTLSpM9zGyveLGYleue5ILeONTXBPwcoWEeM_6joak';

console.log('Initializing Supabase client with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Test the connection and auth setup
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth event:', event, session?.user?.email);
});

// Add a simple function to test the connection
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    console.log('Successfully connected to Supabase');
    return true;
  } catch (error) {
    console.error('Failed to connect to Supabase:', error);
    return false;
  }
}