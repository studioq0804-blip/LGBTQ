import { supabase } from './client';

// Supabaseが適切に設定されているかチェック
function isSupabaseConfigured(): boolean {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  return !!(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'https://your-project.supabase.co' && 
    supabaseAnonKey !== 'your-anon-key'
  );
}

// プロフィールベースの認証（デモ対応）
async function ensureProfileAuth(): Promise<{ user: any; profile: any; isSupabaseAuth: boolean }> {
  // ローカルストレージから現在のプロフィールを取得
  const localProfile = localStorage.getItem('rainbow-match-profile');
  const localUser = localStorage.getItem('rainbow-match-user');
  
  if (!localProfile || !localUser) {
    throw new Error('プロフィールが作成されていません。プロフィール編集で作成してください。');
  }
  
  const profile = JSON.parse(localProfile);
  const user = JSON.parse(localUser);
  
  if (!isSupabaseConfigured()) {
    return {
      user,
      profile,
      isSupabaseAuth: false
    };
  }

  try {
    const { data: existingUser } = await supabase.auth.getUser();
    
    if (existingUser.user) {
      return {
        user: existingUser.user,
        profile,
        isSupabaseAuth: true
      };
    }
    
    // 既存のユーザーセッションがない場合はローカルモードにフォールバック
    return {
      user,
      profile,
      isSupabaseAuth: false
    };
  } catch (error) {
    console.warn('Supabase auth failed, using local mode:', error);
    return {
      user,
      profile,
      isSupabaseAuth: false
    };
  }
}

// Profile API
export const profileAPI = {
  async createProfile(profileData: any) {
    if (!isSupabaseConfigured()) {
      return profileData;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Profile creation failed, using local data:', error);
      return profileData;
    }
  },

  async updateProfile(profileData: any) {
    if (!isSupabaseConfigured()) {
      return profileData;
    }

    try {
      console.log('Updating profile in Supabase:', profileData);
      
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('user_id', profileData.user_id)
        .select()
        .single();
      
      if (error) throw error;
      console.log('Profile updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  },

  async searchProfiles(filters: any = {}) {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('is_visible', true);

      if (filters.ageRanges?.length > 0) {
        query = query.in('age_range', filters.ageRanges);
      }

      if (filters.cities?.length > 0) {
        query = query.in('city', filters.cities);
      }

      if (filters.relationshipPurposes?.length > 0) {
        query = query.in('relationship_purpose', filters.relationshipPurposes);
      }

      if (filters.sexualOrientations?.length > 0) {
        query = query.or(
          filters.sexualOrientations.map((orientation: string) => 
            `sexual_orientation.ilike.%${orientation}%`
          ).join(',')
        );
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('Profile search failed:', error);
      return [];
    }
  },

  async uploadAvatar(file: File): Promise<string> {
    if (!isSupabaseConfigured()) {
      // フォールバック: Base64データURL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
        reader.readAsDataURL(file);
      });
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
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
      // フォールバック: Base64データURL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
        reader.readAsDataURL(file);
      });
    }
  }
};

// Chat API - データベース中心の実装
export const chatAPI = {
  async getChatThreads() {
    const { user, isSupabaseAuth } = await ensureProfileAuth();
    
    if (!isSupabaseAuth) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('chat_threads')
        .select(`
          *,
          last_message:messages!chat_threads_last_message_id_fkey(
            id,
            content,
            sender_id,
            created_at,
            is_read
          ),
          participant_a_profile:profiles!chat_threads_participant_a_fkey(*),
          participant_b_profile:profiles!chat_threads_participant_b_fkey(*)
        `)
        .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Chat threads fetch error:', error);
      return [];
    }
  },

  async createChatThread(participantUserId: string) {
    const { user, isSupabaseAuth } = await ensureProfileAuth();
    
    if (!isSupabaseAuth) {
      // ローカルモードでモックスレッドを作成
      const mockThread = {
        id: `thread-${Date.now()}`,
        participant_a: user.id,
        participant_b: participantUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return mockThread;
    }

    try {
      // 既存のチャットスレッドをチェック
      const { data: existingThread } = await supabase
        .from('chat_threads')
        .select('*')
        .or(`and(participant_a.eq.${user.id},participant_b.eq.${participantUserId}),and(participant_a.eq.${participantUserId},participant_b.eq.${user.id})`)
        .single();

      if (existingThread) {
        return existingThread;
      }

      // 新しいチャットスレッドを作成
      const { data, error } = await supabase
        .from('chat_threads')
        .insert([{
          participant_a: user.id,
          participant_b: participantUserId
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Chat thread creation error:', error);
      throw error;
    }
  },

  async getMessages(chatThreadId: string) {
    const { user, isSupabaseAuth } = await ensureProfileAuth();
    
    if (!isSupabaseAuth) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_thread_id', chatThreadId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Messages fetch error:', error);
      return [];
    }
  },

  async sendMessage(chatThreadId: string, content: string) {
    const { user, isSupabaseAuth } = await ensureProfileAuth();
    
    if (!isSupabaseAuth) {
      // ローカルモードでモックメッセージを作成
      const mockMessage = {
        id: `message-${Date.now()}`,
        chat_thread_id: chatThreadId,
        sender_id: user.id,
        content: content.trim(),
        created_at: new Date().toISOString(),
        is_read: false
      };
      return mockMessage;
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          chat_thread_id: chatThreadId,
          sender_id: user.id,
          content: content.trim()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Message send error:', error);
      throw error;
    }
  },

  async markMessagesAsRead(messageIds: string[]) {
    const { user, isSupabaseAuth } = await ensureProfileAuth();
    
    if (!isSupabaseAuth) {
      return true;
    }

    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .in('id', messageIds);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Mark as read error:', error);
      return false;
    }
  }
};

// Matching API - データベース中心の実装
export const matchingAPI = {
  async sendLike(targetUserId: string, isSuperLike: boolean = false) {
    const { user, isSupabaseAuth } = await ensureProfileAuth();
    
    if (!isSupabaseAuth) {
      // ローカルモードでモックライクを作成
      return {
        id: `like-${Date.now()}`,
        user_id: user.id,
        target_user_id: targetUserId,
        is_super_like: isSuperLike,
        created_at: new Date().toISOString()
      };
    }

    try {
      const { data, error } = await supabase
        .from('likes')
        .insert([{
          user_id: user.id,
          target_user_id: targetUserId,
          is_super_like: isSuperLike
        }])
        .select()
        .single();
    
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Like send error:', error);
      throw error;
    }
  },

  async getLikes() {
    const { user, isSupabaseAuth } = await ensureProfileAuth();
    
    if (!isSupabaseAuth) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('likes')
        .select(`
          *,
          target_profile:profiles!target_user_id(*)
        `)
        .eq('user_id', user.id);
    
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Likes fetch error:', error);
      return [];
    }
  }
};