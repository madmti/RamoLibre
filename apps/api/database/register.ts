import { registerDatabaseAdapter } from '@ramo-libre/database';
import { createSupabaseAdapter } from './adapters/supabase';

registerDatabaseAdapter('supabase', createSupabaseAdapter);
