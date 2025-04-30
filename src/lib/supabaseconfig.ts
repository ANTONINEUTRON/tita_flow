import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

async function createSupabaseClient() {
    // const cookieStore = await cookies()

    // Create a server's supabase client with newly configured cookie,
    // which could be used to maintain user's session
    return createClient(
        process.env.SUPABASE_URL ?? "",
        process.env.SUPABASE_ANON_KEY ?? ""
    )
}

export const SUPABASE_CLIENT = createSupabaseClient()