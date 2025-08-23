// Profile editing modal with inclusive form fields
// Allows users to update their identity information with comprehensive options

import { useState } from 'react';
import { X, Save, Camera } from 'lucide-react';
import { profileAPI } from '../../lib/supabase';
import type { Profile } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import { PREFECTURES, INTEREST_TAGS, BODY_STYLE_OPTIONS, RELATIONSHIP_PURPOSE_OPTIONS, PERSONALITY_TRAITS, AGE_RANGE_OPTIONS } from '../../lib/constants';
import { getPresetAvatarDataUrl, type AvatarPreset } from '../../lib/avatar';

interface ProfileEditModalProps {
  profile: Profile;
  onClose: () => void;
}

export function ProfileEditModal({ profile, onClose }: ProfileEditModalProps) {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
    hidePhoto: profile.privacy?.hidePhoto || false,
    avatarPreset: (localStorage.getItem('rainbow-match-avatar-preset') as AvatarPreset) || 'male',
    bio: profile.bio,
    age: profile.age,
    ageRange: (profile as any).ageRange || '',
    city: profile.city,
    height: profile.height || '',
    bodyStyle: profile.bodyStyle || '',
    relationshipPurpose: profile.relationshipPurpose || '',
    customBodyStyle: '',
    personalityTraits: profile.personalityTraits || [],
    tags: profile.tags,
    joinedCommunities: profile.joinedCommunities
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const finalData = {
        display_name: formData.displayName,
        bio: formData.bio,
        age_range: formData.ageRange,
        city: formData.city,
        height: formData.height || null,
        body_style: formData.bodyStyle === 'その他' ? formData.customBodyStyle : formData.bodyStyle,
        relationship_purpose: formData.relationshipPurpose,
        personality_traits: formData.personalityTraits,
        tags: formData.tags,
        avatar_url: formData.hidePhoto ? '' : (formData.avatarUrl || ''),
        privacy_settings: {
          ...profile.privacy,
          hidePhoto: formData.hidePhoto
        }
      };
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      let dbProfile = finalData;
      
      if (supabaseUrl && supabaseAnonKey && 
          supabaseUrl !== 'https://your-project.supabase.co' && 
          supabaseAnonKey !== 'your-anon-key') {
        try {
          // Supabaseでプロフィールを更新
          dbProfile = await profileAPI.updateProfile(finalData);
        } catch (supabaseError) {
          console.log('Supabase update failed, using local fallback');
          // フォールバック: ローカルデータを使用
        }
      }
      
      // アプリ形式に変換
      const updatedProfile: Profile = {
        ...profile,
        displayName: dbProfile.display_name || profile.displayName,
        bio: dbProfile.bio || '',
        ageRange: dbProfile.age_range || '',
        city: dbProfile.city || '',
        height: dbProfile.height,
        bodyStyle: dbProfile.body_style || '',
        relationshipPurpose: dbProfile.relationship_purpose || '',
        personalityTraits: dbProfile.personality_traits || [],
        tags: dbProfile.tags || [],
        avatarUrl: dbProfile.avatar_url || '',
        lastActive: new Date().toISOString(),
        privacy: {
          ...profile.privacy,
          ...(dbProfile.privacy_settings || {}),
          hidePhoto: formData.hidePhoto
        }
      };
      
      // ローカルストレージを更新
      localStorage.setItem('rainbow-match-profile', JSON.stringify(updatedProfile));
      
      // アバタープリセットの永続化
      localStorage.setItem('rainbow-match-avatar-preset', formData.avatarPreset as AvatarPreset);
      
      // 一覧更新用のカスタムイベントを発火
      window.dispatchEvent(new CustomEvent('rainbow-profile-updated', { detail: { id: profile.id } }));

      onClose();
    } catch (error) {
      console.error('プロフィール更新エラー:', error);
      alert('プロフィールの更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePersonalityToggle = (trait: string) => {
    setFormData(prev => ({
      ...prev,
      personalityTraits: prev.personalityTraits.includes(trait)
        ? prev.personalityTraits.filter(t => t !== trait)
        : prev.personalityTraits.length < 5 ? [...prev.personalityTraits, trait] : prev.personalityTraits
    }));
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : prev.tags.length < 5 ? [...prev.tags, tag] : prev.tags
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // ファイルサイズチェック (5MB制限)
      if (file.size > 5 * 1024 * 1024) {
        alert('ファイルサイズは5MB以下にしてください');
        return;
      }

      // ファイル形式チェック
      if (!file.type.startsWith('image/')) {
        alert('画像ファイルを選択してください');
        return;
      }
      try {
        const publicUrl = await profileAPI.uploadAvatar(file);
        setFormData(prev => ({ ...prev, avatarUrl: publicUrl, hidePhoto: false }));
      } catch (err) {
        console.error('Upload failed:', err);
        alert('画像のアップロードに失敗しました');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">プロフィール編集</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="閉じる"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Avatar */}
            <div className="text-center">
              <div className="relative inline-block">
                <img
                  src={formData.hidePhoto || !formData.avatarUrl ? getPresetAvatarDataUrl(formData.avatarPreset as AvatarPreset, 192) : formData.avatarUrl}
                  alt={formData.hidePhoto || !formData.avatarUrl ? 'アバター' : 'プロフィール写真'}
                  className="w-48 h-48 rounded-2xl object-cover border-4 border-gray-200"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <label
                  htmlFor="photo-upload"
                  className="absolute bottom-2 right-2 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-colors cursor-pointer"
                  aria-label="写真をアップロード"
                  title="写真をアップロード"
                >
                  <Camera size={20} />
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="mt-3 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, hidePhoto: !prev.hidePhoto }))}
                  className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors ${formData.hidePhoto ? 'bg-gray-800 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                  role="switch"
                  aria-checked={formData.hidePhoto}
                >
                  {formData.hidePhoto ? '写真を表示する' : '写真を非表示にする'}
                </button>
                {formData.avatarUrl && !formData.hidePhoto && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, avatarUrl: '' }))}
                    className="px-3 py-1 rounded-lg text-sm font-medium border bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  >
                    写真を削除
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {formData.hidePhoto || !formData.avatarUrl ? '写真の代わりにアバターが表示されます（いつでも切替可能）' : 'クリックして写真を変更（5MB以下）'}
              </p>
              {/* プリセットアバター選択（男性/女性/バイセクシャル） */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">アバタータイプ</label>
                <select
                  value={formData.avatarPreset}
                  onChange={(e) => setFormData(prev => ({ ...prev, avatarPreset: e.target.value as AvatarPreset }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  title="アバタータイプを選択"
                >
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                  <option value="bisexual">バイセクシャル</option>
                </select>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                表示名 *
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="例: あきら"
                required
                maxLength={50}
                title="表示名を入力"
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {formData.displayName.length}/50
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('bio')}
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
                rows={4}
                maxLength={500}
                placeholder="自分について教えてください..."
                title="自己紹介を入力"
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {formData.bio.length}/500
              </div>
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                年代 *
              </label>
              <select
                value={formData.ageRange || ''}
                onChange={(e) => handleInputChange('ageRange', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                required
                title="年代を選択"
              >
                <option value="">年代を選択してください</option>
                {AGE_RANGE_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                18歳以上の年代を選択してください
              </p>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                都道府県
              </label>
              <select
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                title="都道府県を選択"
              >
                <option value="">都道府県を選択してください</option>
                {PREFECTURES.map(prefecture => (
                  <option key={prefecture} value={prefecture}>{prefecture}</option>
                ))}
              </select>
            </div>

            {/* Height */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                身長
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={formData.height || ''}
                  onChange={(e) => handleInputChange('height', parseInt(e.target.value) || '')}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  min="100"
                  max="250"
                  placeholder="例: 170"
                  title="身長を入力"
                />
                <span className="text-gray-600 font-medium">cm</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                任意項目です。100-250cmの範囲で入力してください
              </p>
            </div>

            {/* Body Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                スタイル・体型
              </label>
              <select
                value={formData.bodyStyle}
                onChange={(e) => handleInputChange('bodyStyle', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                title="体型を選択"
              >
                <option value="">選択してください（任意）</option>
                {BODY_STYLE_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              
              {formData.bodyStyle === 'その他' && (
                <input
                  type="text"
                  value={formData.customBodyStyle}
                  onChange={(e) => handleInputChange('customBodyStyle', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors mt-2"
                  placeholder="自由記述してください"
                  maxLength={30}
                />
              )}
              
              <p className="text-xs text-gray-500 mt-1">
                この情報は任意です。プライバシー設定で非表示にもできます。
              </p>
            </div>

            {/* Relationship Purpose */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                出会いの目的
              </label>
              <select
                value={formData.relationshipPurpose}
                onChange={(e) => handleInputChange('relationshipPurpose', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                title="出会いの目的を選択"
              >
                <option value="">選択してください（任意）</option>
                {RELATIONSHIP_PURPOSE_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                どのような関係を求めているかを選択してください
              </p>
            </div>

            {/* Personality Traits */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                性格 (最大5個)
              </label>
              <div className="flex flex-wrap gap-2">
                {PERSONALITY_TRAITS.map(trait => (
                  <button
                    key={trait}
                    type="button"
                    onClick={() => handlePersonalityToggle(trait)}
                    disabled={!formData.personalityTraits.includes(trait) && formData.personalityTraits.length >= 5}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.personalityTraits.includes(trait)
                        ? 'bg-pink-100 text-pink-700 border-2 border-pink-300'
                        : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {trait}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                選択済み: {formData.personalityTraits.length}/5
              </p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                興味・関心ごと (最大5個)
              </label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    disabled={!formData.tags.includes(tag) && formData.tags.length >= 5}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      formData.tags.includes(tag)
                        ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                        : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                選択済み: {formData.tags.length}/5
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2 text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors font-medium"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.displayName.trim()}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>保存中...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{t('save')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}