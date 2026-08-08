import { createClient } from '@supabase/supabase-js'

// วาง URL และ Anon Key ที่ก๊อปปี้มาจาก Supabase ใน Step 1.4
const supabaseUrl = 'https://eyguvgvncnqauizldkiv.supabase.co'
const supabaseAnonKey = 'วeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5Z3V2Z3ZuY25xYXVpemxka2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3OTAxMzYsImV4cCI6MjEwMTM2NjEzNn0.xkf1D6PXjMupFLOWepK7wOkYgvjSCPvQlNTHiWGdBDs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)