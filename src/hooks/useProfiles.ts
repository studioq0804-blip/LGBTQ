// プロフィール管理フック
// Supabaseとの統合でリアルタイムプロフィール管理

import { useState, useEffect, useCallback } from 'react';
import { profileAPI, matchingAPI } from '../lib/supabase/api';
import { supabase } from '../lib/supabase/client';
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
      // Try to get profiles from database
      console.log('Fetching profiles from Supabase...');
      
      const { data: dbProfiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_visible', true)
        .limit(50);
      
      if (error) {
        console.error('Database query error:', error);
        throw error;
      }
      
      if (dbProfiles && dbProfiles.length > 0) {
        // データベース形式からアプリ形式に変換
        const convertedProfiles: Profile[] = dbProfiles.map(dbProfile => ({
          id: dbProfile.id,
          userId: dbProfile.user_id,
          displayName: dbProfile.display_name || 'ユーザー',
          genderIdentity: '', // Removed from database
          sexualOrientation: '', // Removed from database
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
          lastActive: dbProfile.last_active || new Date().toISOString(),
          privacy: dbProfile.privacy_settings || {
            showAge: true,
            showCity: true,
            showHeight: true,
            showBodyStyle: true,
            showTags: true,
            showBio: true
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
        // Database is empty, use mock data
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
      setError(`プロフィールの取得に失敗しました: ${err.message}`);
      
      // Fallback to mock data on error
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