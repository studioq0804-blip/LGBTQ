// プロフィール管理フック
// Supabaseとの統合でリアルタイムプロフィール管理

import { useState, useEffect, useCallback } from 'react';
import { profileAPI, matchingAPI } from '../lib/supabase/api';
import { getMockProfiles, profiles16 } from '../data/mockData';
import type { Profile, MatchFilters } from '../types';

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // プロフィール検索
  const searchProfiles = useCallback(async (filters?: MatchFilters) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || 
          supabaseUrl === 'https://your-project.supabase.co' || 
          supabaseAnonKey === 'your-anon-key') {
        // Supabase未設定時はローカルモックデータを使用
        console.log('Supabase not configured, using local mock data');
        
        // ローカルストレージから現在のユーザープロフィールを取得
        const currentProfile = localStorage.getItem('rainbow-match-profile');
        let allProfiles = [...profiles16];
        
        if (currentProfile) {
          try {
            const parsedProfile = JSON.parse(currentProfile);
            // 既存のプロフィールを更新または追加
            const existingIndex = allProfiles.findIndex(p => p.userId === parsedProfile.userId);
            if (existingIndex >= 0) {
              allProfiles[existingIndex] = parsedProfile;
            } else {
              allProfiles.unshift(parsedProfile);
            }
          } catch (parseError) {
            console.warn('Failed to parse current profile:', parseError);
          }
        }
        
        setProfiles(profiles16);
        setIsLoading(false);
        return;
      }

      // Try to get profiles from database
      console.log('Fetching profiles from Supabase...');
      
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('is_visible', true);

      // フィルターを適用
      if (filters?.ageRanges?.length) {
        query = query.in('age_range', filters.ageRanges);
      }
      if (filters?.prefectures?.length) {
        query = query.in('city', filters.prefectures);
      }
      if (filters?.relationshipPurposes?.length) {
        query = query.in('relationship_purpose', filters.relationshipPurposes);
      }
      if (filters?.sexualOrientations?.length) {
        query = query.or(
          filters.sexualOrientations.map(orientation => 
            `sexual_orientation.ilike.%${orientation}%`
          ).join(',')
        );
      }

      query = query.limit(50);

      const { data: dbProfiles, error: dbError } = await query;
      
      if (dbError) {
        console.error('Database query error:', dbError);
        throw dbError;
      }
      
      if (dbProfiles && dbProfiles.length > 0) {
        // データベース形式からアプリ形式に変換
        const convertedProfiles: Profile[] = dbProfiles.map(dbProfile => ({
          id: dbProfile.id,
          userId: dbProfile.user_id,
          displayName: dbProfile.display_name || '',
          genderIdentity: dbProfile.gender_identity || '',
          sexualOrientation: dbProfile.sexual_orientation || '',
          bio: dbProfile.bio || '',
          age: 25,
          ageRange: dbProfile.age_range || '',
          city: dbProfile.city || '',
          height: dbProfile.height,
          bodyStyle: dbProfile.body_style || '',
          relationshipPurpose: dbProfile.relationship_purpose || '',
          personalityTraits: dbProfile.personality_traits || [],
          tags: dbProfile.tags || [],
          joinedCommunities: [],
          photos: [],
          avatarUrl: dbProfile.avatar_url || '',
          isVisible: dbProfile.is_visible,
          lastActive: dbProfile.last_active,
          privacy: dbProfile.privacy_settings || {
            showGenderIdentity: true,
            showSexualOrientation: true,
            showAge: true,
            showCity: true,
            showHeight: true,
            showBodyStyle: true,
            showTags: true,
            showBio: true,
            hidePhoto: false
          }
        }));
        
        // ローカルストレージから現在のユーザープロフィールを取得して統合
        const currentProfile = localStorage.getItem('rainbow-match-profile');
        if (currentProfile) {
          try {
            const parsedProfile = JSON.parse(currentProfile);
            // 既存のプロフィールを更新または追加
            const existingIndex = convertedProfiles.findIndex(p => p.userId === parsedProfile.userId);
            if (existingIndex >= 0) {
              convertedProfiles[existingIndex] = parsedProfile;
            } else {
              convertedProfiles.unshift(parsedProfile);
            }
          } catch (parseError) {
            console.warn('Failed to parse current profile:', parseError);
          }
        }
        
        console.log('Database profiles loaded:', convertedProfiles.length);
        setProfiles(convertedProfiles);
      } else {
        // データベースが空の場合はモックデータ + 現在のユーザーを使用
        console.log('Database is empty, using mock data with current user:', profiles16.length);
        
        const currentProfile = localStorage.getItem('rainbow-match-profile');
        let allProfiles = [...profiles16];
        
        if (currentProfile) {
          try {
            const parsedProfile = JSON.parse(currentProfile);
            // 既存のプロフィールを更新または追加
            const existingIndex = allProfiles.findIndex(p => p.userId === parsedProfile.userId);
            if (existingIndex >= 0) {
              allProfiles[existingIndex] = parsedProfile;
            } else {
              allProfiles.unshift(parsedProfile);
            }
          } catch (parseError) {
            console.warn('Failed to parse current profile:', parseError);
          }
        }
        
        setProfiles(allProfiles);
      }
    } catch (err) {
      console.error('プロフィール検索エラー:', err);
      setError('プロフィールの取得に失敗しました');
      
      // エラー時はモックデータにフォールバック
      console.log('Error occurred, falling back to mock data:', profiles16.length);
      
      const currentProfile = localStorage.getItem('rainbow-match-profile');
      let allProfiles = [...profiles16];
      
      if (currentProfile) {
        try {
          const parsedProfile = JSON.parse(currentProfile);
          const existingIndex = allProfiles.findIndex(p => p.userId === parsedProfile.userId);
          if (existingIndex >= 0) {
            allProfiles[existingIndex] = parsedProfile;
          } else {
            allProfiles.unshift(parsedProfile);
          }
        } catch (parseError) {
          console.warn('Failed to parse current profile:', parseError);
        }
      }
      
      setProfiles(allProfiles);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ローカルで更新されたプロフィールを即時にUIへ反映
  const applyLocalProfileUpdate = useCallback((updated: Profile) => {
    // stateを先頭置換で更新（userId単位で重複排除）
    setProfiles(prev => {
      const filtered = prev.filter(p => p.userId !== updated.userId);
      const next = [updated, ...filtered];
      return next;
    });
  }, []);

  // いいね送信
  const sendLike = useCallback(async (targetUserId: string, isSuperLike: boolean = false) => {
    try {
      // デモ用: 実際のユーザーIDに変換
      const demoUserId = `user-${Date.now()}`;
      await matchingAPI.sendLike(demoUserId, isSuperLike);
      return { ok: true };
    } catch (error) {
      console.error('いいね送信エラー:', error);
      return { ok: false, error: 'いいねの送信に失敗しました' };
    }
  }, []);

  // いいね一覧取得
  const getLikedProfiles = useCallback(async () => {
    try {
      const likes = await matchingAPI.getLikes();
      return likes.map(like => like.target_profile).filter(Boolean);
    } catch (error) {
      console.error('いいね一覧取得エラー:', error);
      return [];
    }
  }, []);

  // 初期データ読み込み
  useEffect(() => {
    console.log('useProfiles: 初期データ読み込み開始');
    searchProfiles();
  }, [searchProfiles]);

  return {
    profiles,
    isLoading,
    error,
    searchProfiles,
    sendLike,
    getLikedProfiles,
    applyLocalProfileUpdate
  };
}