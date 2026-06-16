import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const SUPABASE_URL = 'https://swqzosenxzjofokwvkpw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3cXpvc2VueHpqb2Zva3d2a3B3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1NDg4NzAsImV4cCI6MjA5NzEyNDg3MH0.49AWnEt0RelGdQAnpDVDa8MjkyBp9ySjbsMidQPUSYk';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
