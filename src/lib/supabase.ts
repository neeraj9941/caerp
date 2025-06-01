import { createClient } from '@supabase/supabase-js';

// Ensure this code runs only in a client-side environment
const supabaseUrl = typeof window !== 'undefined' ? import.meta.env.VITE_SUPABASE_URL : undefined;
const supabaseAnonKey = typeof window !== 'undefined' ? import.meta.env.VITE_SUPABASE_ANON_KEY : undefined;

if (typeof window !== 'undefined') {
  if (!supabaseUrl) {
    console.warn('Supabase URL is not set. Please check your .env file for VITE_SUPABASE_URL.');
  }
  if (!supabaseAnonKey) {
    console.warn('Supabase Anon Key is not set. Please check your .env file for VITE_SUPABASE_ANON_KEY.');
  }
  console.log('Attempting to initialize Supabase client with URL:', supabaseUrl);
}


// Initialize the client, even if the URL/key might be missing,
// to allow for graceful failure or later configuration.
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
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