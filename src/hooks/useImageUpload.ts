import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File, userId?: string): Promise<string | null> => {
    try {
      setUploading(true);
      setError(null);

      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = userId ? `${userId}/${fileName}` : fileName;

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      setError(errorMessage);
      console.error('Upload error:', err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (url: string): Promise<boolean> => {
    try {
      // Extract the file path from the URL
      const urlParts = url.split('/storage/v1/object/public/post-images/');
      if (urlParts.length !== 2) {
        throw new Error('Invalid image URL');
      }
      
      const filePath = urlParts[1];

      const { error } = await supabase.storage
        .from('post-images')
        .remove([filePath]);

      if (error) {
        throw error;
      }

      return true;
    } catch (err) {
      console.error('Delete error:', err);
      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    uploading,
    error
  };
}