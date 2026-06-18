import { supabase } from '../../../packages/supabase/src/client';
export { supabase };

export async function uploadDocument(userId: string, docType: string, uri: string): Promise<string> {
  const fileName = `${userId}/${docType}_${Date.now()}.jpg`;

  // Read file as arraybuffer (works reliably on React Native Android + iOS)
  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  const { error } = await supabase.storage
    .from('documents')
    .upload(fileName, arrayBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('documents')
    .getPublicUrl(fileName);

  return publicUrl;
}
