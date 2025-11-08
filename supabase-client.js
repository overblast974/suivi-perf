// Supabase Client Configuration
const SUPABASE_URL = 'https://lgdmjxphmpksqaaljgav.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnZG1qeHBobXBrc3FhYWxqZ2F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MTA4MTIsImV4cCI6MjA3ODE4NjgxMn0.oGjM3tQOkBSZbypQX0vei2JFRrYgOargFjKrJG7ikEg';

// Initialize Supabase client (will be available via window.supabase from CDN)
// This file should be loaded AFTER the Supabase CDN script

// Export for use in other files
if (typeof window !== 'undefined' && window.supabase) {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
