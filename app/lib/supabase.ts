import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

//Environment variables for supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// The ! after the environment variables tells TypeScript that these values will definitely exist

//Create a single supabase client for interacting with the database
export const supabase = createClientComponentClient()