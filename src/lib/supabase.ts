import { createClient } from '@supabase/supabase-js';

// Supabaseクライアントの初期化
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'
);

import { createClient } from '@supabase/supabase-js';

// Supabaseクライアントの初期化
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'
);

// プロフィールAPI
export const profileAPI = {
  async createProfile(profileData: any) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Profile creation failed:', error);
      throw error;
    }
  },

  async updateProfile(profileData: any) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('user_id', profileData.user_id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  },

  async uploadAvatar(file: File): Promise<string> {
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || 
        supabaseUrl === 'https://your-project.supabase.co' || 
        supabaseAnonKey === 'your-anon-key') {
      // Supabase未設定時はBase64データURLを返す
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = () => {
          reject(new Error('ファイルの読み込みに失敗しました'));
        };
        reader.readAsDataURL(file);
      });
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      // Supabase Storage失敗時もBase64フォールバック
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = () => {
          reject(new Error('ファイルの読み込みに失敗しました'));
        };
        reader.readAsDataURL(file);
      });
    }
  },

  async searchProfiles(filters: any) {
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('is_visible', true);

    if (filters.ageRanges?.length) {
      query = query.in('age_range', filters.ageRanges);
    }
    if (filters.cities?.length) {
      query = query.in('city', filters.cities);
    }
    if (filters.relationshipPurposes?.length) {
      query = query.in('relationship_purpose', filters.relationshipPurposes);
    }
    if (filters.sexualOrientations?.length) {
      query = query.in('sexual_orientation', filters.sexualOrientations);
    }

    query = query.limit(filters.limit || 50);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
};

// マッチングAPI
export const matchingAPI = {
  async sendLike(targetUserId: string, isSuperLike: boolean = false) {
    const { data, error } = await supabase
      .from('likes')
      .insert([{
        target_user_id: targetUserId,
        is_super_like: isSuperLike
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getLikes() {
    const { data, error } = await supabase
      .from('likes')
      .select(`
        *,
        target_profile:profiles!likes_target_user_id_fkey(*)
      `);
    
    if (error) throw error;
    return data || [];
  }
};