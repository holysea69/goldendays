import { createClient } from '@supabase/supabase-js';

// Supabase 대시보드 -> Settings -> API에서 확인 가능합니다.
const supabaseUrl = 'https://ofdizlrhyodfhpcwjsfh.supabase.co';
const supabaseAnonKey = 'sb_publishable_cVfSWepUT4dJMKKoS5NQhQ_EzymBgd1';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);