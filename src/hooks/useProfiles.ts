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
        // Supabase未設定時はEdge Functionからモックデータを取得
        console.log('Supabase not configured, fetching from Edge Function');
        try {
          const params = new URLSearchParams();
          if (filters?.ageRanges?.length) params.set('ageRanges', filters.ageRanges.join(','));
          if (filters?.prefectures?.length) params.set('cities', filters.prefectures.join(','));
          if (filters?.relationshipPurposes?.length) params.set('relationshipPurposes', filters.relationshipPurposes.join(','));
          if (filters?.sexualOrientations?.length) params.set('sexualOrientations', filters.sexualOrientations.join(','));
          params.set('limit', '50');

          const response = await fetch(`/functions/v1/mock-profiles?${params.toString()}`);
          if (!response.ok) throw new Error('Mock API failed');
          
          const serverProfiles = await response.json();
          console.log('Edge Function returned:', serverProfiles.length, 'profiles');
          
          // サーバー形式からアプリ形式に変換
          const convertedProfiles: Profile[] = serverProfiles.map((dbProfile: any) => ({
            id: dbProfile.id,
            userId: dbProfile.user_id,
            displayName: dbProfile.display_name || '',
            genderIdentity: dbProfile.gender_identity || '',
            sexualOrientation: dbProfile.sexual_orientation || '',
            bio: dbProfile.bio || '',
            age: 25, // 計算が必要な場合は年代から推定
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
          
          setProfiles(convertedProfiles);
          setIsLoading(false);
          return;
        } catch (edgeFunctionError) {
          console.error('Edge Function failed:', edgeFunctionError);
          // 最終フォールバック: ローカルモックデータ
          console.log('Using final fallback: local mock data');
          setProfiles(profiles16);
          setIsLoading(false);
          return;
        }
      }

      // Try to get profiles from database
      const dbProfiles = await profileAPI.searchProfiles({
        ageRanges: filters?.ageRanges || [],
        cities: filters?.prefectures || [],
        relationshipPurposes: filters?.relationshipPurposes || [],
        sexualOrientations: filters?.sexualOrientations || [],
        limit: 50
      });
      
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
        
        console.log('Database profiles loaded:', convertedProfiles.length);
        setProfiles(convertedProfiles);
      } else {
        // データベースが空の場合はモックデータを使用
        console.log('Database is empty, using mock data:', profiles16.length);
        setProfiles(profiles16);
      }
    } catch (err) {
      console.error('プロフィール検索エラー:', err);
      setError('プロフィールの取得に失敗しました');
      
      // エラー時はモックデータにフォールバック
      console.log('Error occurred, falling back to mock data:', profiles16.length);
      setProfiles(profiles16);
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