// 認証管理フック
// ログイン、サインアップ、KYC、プロフィール管理を統合

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Profile } from '../types';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isKYCCompleted: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    isAuthenticated: false,
    isKYCCompleted: false,
    isLoading: true
  });

  // ローカルストレージから状態を読み込む共通関数
  const syncFromStorage = useCallback(() => {
    try {
      const storedUser = localStorage.getItem('rainbow-match-user');
      const storedProfile = localStorage.getItem('rainbow-match-profile');
      const storedKYC = localStorage.getItem('rainbow-match-kyc-completed');

      if (storedUser && storedProfile) {
        const user = JSON.parse(storedUser);
        const profile = JSON.parse(storedProfile);
        const isKYCCompleted = storedKYC === 'true';

        setAuthState({
          user,
          profile,
          isAuthenticated: true,
          isKYCCompleted,
          isLoading: false
        });
      } else {
        setAuthState(prev => ({
          ...prev,
          user: null,
          profile: null,
          isAuthenticated: false,
          isKYCCompleted: false,
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('認証状態の復元に失敗:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // 初期化およびイベント購読で同期
  useEffect(() => {
    const handler = () => syncFromStorage();
    // 初期同期
    syncFromStorage();
    // 同一タブ内の任意の認証更新
    window.addEventListener('rainbow-auth-updated', handler as EventListener);
    // 他タブの変更も反映
    window.addEventListener('storage', handler as EventListener);
    return () => {
      window.removeEventListener('rainbow-auth-updated', handler as EventListener);
      window.removeEventListener('storage', handler as EventListener);
    };
  }, [syncFromStorage]);

  // サインアップ（OTP送信）
  const signup = useCallback(async (email: string) => {
    try {
      // Supabase auth signup
      const { error } = await supabase.auth.signUp({
        email,
        password: 'temp-password-123', // In real app, generate secure password
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) {
        console.error('Supabase signup error:', error);
        // Continue with demo mode for development
      }
      
      // デモ用: 常に成功
      console.log('OTP sent to:', email);
      return { ok: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { ok: false, error: 'サインアップに失敗しました' };
    }
  }, []);

  // OTP認証
  const verifySignup = useCallback(async (email: string, code: string) => {
    try {
      // デモ用: 123456で認証成功
      if (code === '123456') {
        return { ok: true };
      }
      return { ok: false, error: '認証コードが正しくありません' };
    } catch (error) {
      return { ok: false, error: '認証に失敗しました' };
    }
  }, []);

  // ログイン用OTP送信
  const sendLoginOTP = useCallback(async (email: string) => {
    try {
      // デモ用: 常に成功
      console.log('Login OTP sent to:', email);
      return { ok: true };
    } catch (error) {
      console.error('Send login OTP error:', error);
      return { ok: false, error: 'OTP送信に失敗しました' };
    }
  }, []);

  // ログイン
  const login = useCallback(async (email: string, code: string, trustDevice: boolean = false) => {
    try {
      console.log('Login attempt:', { email, code, trustDevice });
      
      // Try Supabase auth first
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: 'temp-password-123'
        });
        
        if (data.user && !error) {
          console.log('Supabase login successful:', data.user);
          
          // Get or create profile
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .single();
          
          let profile: Profile;
          if (existingProfile) {
            profile = convertDbProfileToApp(existingProfile);
          } else {
            profile = createDefaultProfile(data.user.id);
          }
          
          const user: User = {
            id: data.user.id,
            email: data.user.email || email,
            isVerified: true,
            createdAt: data.user.created_at
          };
          
          // Save to localStorage for consistency
          localStorage.setItem('rainbow-match-user', JSON.stringify(user));
          localStorage.setItem('rainbow-match-profile', JSON.stringify(profile));
          localStorage.setItem('rainbow-match-kyc-completed', 'true');
          
          setAuthState({
            user,
            profile,
            isAuthenticated: true,
            isKYCCompleted: true,
            isLoading: false
          });
          
          window.dispatchEvent(new Event('rainbow-auth-updated'));
          return { ok: true };
        }
      } catch (supabaseError) {
        console.log('Supabase login failed, using demo mode:', supabaseError);
      }
      
      // デモ用: 123456で認証成功
      if (code === '123456') {
        const user: User = {
          id: `user-${Date.now()}`,
          email,
          isVerified: true,
          createdAt: new Date().toISOString()
        };

        // 既存プロフィールがあるかチェック
        const existingProfile = localStorage.getItem('rainbow-match-profile');
        let profile: Profile;

        if (existingProfile) {
          try {
            profile = JSON.parse(existingProfile);
            // userIdを現在のユーザーIDに更新
            profile.userId = user.id;
          } catch (parseError) {
            console.error('Existing profile parse error:', parseError);
            // パースエラーの場合はデフォルトプロフィールを作成
            profile = createDefaultProfile(user.id);
          }
        } else {
          // デフォルトプロフィールを作成
          profile = createDefaultProfile(user.id);
        }

        // ローカルストレージに保存
        localStorage.setItem('rainbow-match-user', JSON.stringify(user));
        localStorage.setItem('rainbow-match-profile', JSON.stringify(profile));
        localStorage.setItem('rainbow-match-kyc-completed', 'true');
        
        console.log('Login successful, user created:', user);
        console.log('Profile created:', profile);

        if (trustDevice) {
          localStorage.setItem('rainbow-match-trusted-device', 'true');
        }

        setAuthState({
          user,
          profile,
          isAuthenticated: true,
          isKYCCompleted: true,
          isLoading: false
        });
        
        // 他のフックインスタンスにも更新を通知
        window.dispatchEvent(new Event('rainbow-auth-updated'));

        console.log('Auth state updated successfully');

        return { ok: true };
      }
      
      console.log('Login failed: invalid code');
      return { ok: false, error: '認証コードが正しくありません' };
    } catch (error) {
      console.error('Login error:', error);
      return { ok: false, error: 'ログインに失敗しました' };
    }
  }, []);

  // Convert database profile to app format
  const convertDbProfileToApp = (dbProfile: any): Profile => {
    return {
      id: dbProfile.id,
      userId: dbProfile.user_id,
      displayName: dbProfile.display_name || 'ユーザー',
      genderIdentity: dbProfile.gender_identity || '',
      sexualOrientation: dbProfile.sexual_orientation || '',
      bio: dbProfile.bio || '',
      age: 25, // Default age
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
      isVisible: dbProfile.is_visible !== false,
      lastActive: dbProfile.last_active || new Date().toISOString(),
      privacy: dbProfile.privacy_settings || {
        showAge: true,
        showCity: true,
        showHeight: true,
        showBodyStyle: true,
        showTags: true,
        showBio: true,
        hidePhoto: false
      }
    };
  };

  // デフォルトプロフィール作成ヘルパー
  const createDefaultProfile = (userId: string): Profile => {
    return {
      id: `profile-${Date.now()}`,
      userId: userId,
      displayName: 'デモユーザー',
      genderIdentity: 'ノンバイナリー',
      sexualOrientation: 'パンセクシュアル',
      bio: 'よろしくお願いします！🌈',
      age: 25,
      ageRange: '20代前半（20-24歳）',
      city: '東京都',
      height: 170,
      bodyStyle: '平均的',
      relationshipPurpose: '友人',
      personalityTraits: ['陽気', '話し上手'],
      tags: ['アート', 'LGBTQ+'],
      joinedCommunities: [],
      photos: [],
      avatarUrl: '',
      isVisible: true,
      lastActive: new Date().toISOString(),
      privacy: {
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
    };
  };

  // KYC完了
  const completeKYC = useCallback(async (kycData: any) => {
    try {
      // ユーザーが存在しない場合は作成
      let user = authState.user;
      if (!user) {
        user = {
          id: `user-${Date.now()}`,
          email: sessionStorage.getItem('signup-email') || 'demo@example.com',
          isVerified: true,
          createdAt: new Date().toISOString()
        };
      }

      // プロフィールデータを作成
      const profile: Profile = {
        id: `profile-${Date.now()}`,
        userId: user.id,
        displayName: kycData.displayName || 'デモユーザー',
        genderIdentity: 'ノンバイナリー',
        sexualOrientation: 'パンセクシュアル',
        bio: 'よろしくお願いします！🌈',
        age: 25,
        ageRange: '20代前半（20-24歳）',
        city: kycData.city || '東京都',
        height: 170,
        bodyStyle: '平均的',
        relationshipPurpose: '友人',
        personalityTraits: ['陽気', '話し上手'],
        tags: ['アート', 'LGBTQ+'],
        joinedCommunities: [],
        photos: [],
        avatarUrl: '',
        isVisible: true,
        lastActive: new Date().toISOString(),
        privacy: {
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
      };

      // ローカルストレージに保存
      localStorage.setItem('rainbow-match-user', JSON.stringify(user));
      localStorage.setItem('rainbow-match-profile', JSON.stringify(profile));
      localStorage.setItem('rainbow-match-kyc-completed', 'true');

      setAuthState({
        user,
        profile,
        isAuthenticated: true,
        isKYCCompleted: true,
        isLoading: false
      });

      // 他のフックインスタンスにも更新を通知
      window.dispatchEvent(new Event('rainbow-auth-updated'));

      return { ok: true };
    } catch (error) {
      console.error('KYC完了エラー:', error);
      return { ok: false, error: 'KYC完了に失敗しました' };
    }
  }, [authState.user]);

  // ログアウト
  const logout = useCallback(async () => {
    try {
      // Supabase logout
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Supabase logout error:', error);
    }
    
    // ローカルストレージをクリア
    localStorage.removeItem('rainbow-match-user');
    localStorage.removeItem('rainbow-match-profile');
    localStorage.removeItem('rainbow-match-kyc-completed');
    localStorage.removeItem('rainbow-match-trusted-device');
    
    setAuthState({
      user: null,
      profile: null,
      isAuthenticated: false,
      isKYCCompleted: false,
      isLoading: false
    });

    // 他のフックインスタンスにも更新を通知
    window.dispatchEvent(new Event('rainbow-auth-updated'));
  }, []);

  return {
    ...authState,
    signup,
    verifySignup,
    sendLoginOTP,
    login,
    completeKYC,
    logout
  };
}