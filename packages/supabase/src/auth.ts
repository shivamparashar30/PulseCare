import { supabase } from './client';
import { UserRole } from './database.types';

export interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  // Doctor-specific
  specialization?: string;
  // Store-specific
  storeName?: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export async function signUp({ email, password, fullName, phone, role, specialization, storeName }: SignUpParams) {
  // 1. Create auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
    },
  });

  if (error) throw error;

  const userId = data.user?.id;
  if (!userId) throw new Error('Signup failed: no user ID returned');

  // 2. Create profile in profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email,
      full_name: fullName,
      phone: phone || null,
      role,
    });

  if (profileError) {
    console.warn('Profile creation error (may already exist):', profileError.message);
  }

  // 3. If doctor, create doctor_profiles entry
  if (role === 'doctor') {
    const { error: doctorError } = await supabase
      .from('doctor_profiles')
      .insert({
        id: userId,
        specialization: specialization || 'General',
      });
    if (doctorError) console.warn('Doctor profile error:', doctorError.message);
  }

  // 4. If medical_store, create medical_stores entry
  if (role === 'medical_store') {
    const { error: storeError } = await supabase
      .from('medical_stores')
      .insert({
        id: userId,
        store_name: storeName || 'My Store',
      });
    if (storeError) console.warn('Store profile error:', storeError.message);
  }

  return data;
}

export async function signIn({ email, password }: SignInParams) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: { full_name?: string; phone?: string; avatar_url?: string }) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function uploadAvatar(userId: string, base64Data: string) {
  const fileName = `${userId}/${Date.now()}.jpg`;

  // Convert base64 to Uint8Array (works in both Hermes and V8 engines)
  const binaryString = typeof atob === 'function'
    ? atob(base64Data)
    : Buffer.from(base64Data, 'base64').toString('binary');
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, bytes, { contentType: 'image/jpeg', upsert: true });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  await updateProfile(userId, { avatar_url: publicUrl });
  return publicUrl;
}

export function onAuthStateChange(callback: (session: any) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}
