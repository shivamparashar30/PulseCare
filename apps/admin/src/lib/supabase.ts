import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://swqzosenxzjofokwvkpw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3cXpvc2VueHpqb2Zva3d2a3B3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1NDg4NzAsImV4cCI6MjA5NzEyNDg3MH0.49AWnEt0RelGdQAnpDVDa8MjkyBp9ySjbsMidQPUSYk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
