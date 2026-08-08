import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://eyguvgvncnqauizldkiv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5Z3V2Z3ZuY25xYXVpemxka2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3OTAxMzYsImV4cCI6MjEwMTM2NjEzNn0.xkf1D6PXjMupFLOWepK7wOkYgvjSCPvQlNTHiWGdBDs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
