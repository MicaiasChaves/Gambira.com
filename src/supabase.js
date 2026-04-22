import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://klhjyuiqcesasigtjfyf.supabase.co'
const SUPABASE_KEY = 'sb_publishable_909n5w6C4Mn3MydMhufsUA_dSOwiUhS'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)