import { useState, useEffect } from 'react';
import { X, Save, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { profileAPI } from '../../lib/supabase/api';
import { 
  PREFECTURES, 
  INTEREST_TAGS, 
  GENDER_IDENTITY_OPTIONS, 
  SEXUAL_ORIENTATION_OPTIONS,
  RELATIONSHIP_PURPOSE_OPTIONS,
  PERSONALITY_TRAITS,
  BODY_STYLE_OPTIONS,
  AGE_RANGE_OPTIONS
} from '../../lib/constants';
import { getPresetAvatarDataUrl, type AvatarPreset } from '../../lib/avatar';
import type { Profile } from '../../types';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  onProfileUpdate: (updatedProfile: Profile) => void;
}

export function ProfileEditModal({ isOpen, onClose, profile, onProfileUpdate }: ProfileEditModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    age: 25,
    ageRange: '',
    city: '',
    height: 170,
    bodyStyle: '',
    relationshipPurpose: '',
    genderIdentity: '',
    sexualOrientation: '',
    personalityTraits: [] as string[],
    tags: [] as string[],
    avatarUrl: '',
    hidePhoto: false
  });
  const [selectedPreset, setSelectedPreset] = useState<AvatarPreset>('male');
  const [isLoading, setIsLoading] = useState(false);

  // フォームデータを初期化
  useEffect(() => {
    if (profile && isOpen) {
      setFormData({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        age: profile.age || 25,
        ageRange: profile.ageRange || '',
        city: profile.city || '',
        height: profile.height || 170,
        bodyStyle: profile.bodyStyle || '',
        relationshipPurpose: profile.relationshipPurpose || '',
        genderIdentity: profile.genderIdentity || '',
        sexualOrientation: profile.sexualOrientation || '',
        personalityTraits: profile.personalityTraits || [],
        tags: profile.tags || [],
        avatarUrl: profile.avatarUrl || '',
        hidePhoto: profile.privacy?.hidePhoto || false
      });
      
      // 保存されたプリセットを読み込み
      const savedPreset = localStorage.getItem('rainbow-match-avatar-preset') as AvatarPreset;
      if (savedPreset) {
        setSelectedPreset(savedPreset);
      }
    }
  }, [profile, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag].slice(0, 8) // 最大8個
    }));
  };

  const handlePersonalityToggle = (trait: string) => {
    setFormData(prev => ({
      ...prev,
      personalityTraits: prev.personalityTraits.includes(trait)
        ? prev.personalityTraits.filter(t => t !== trait)
        : [...prev.personalityTraits, trait].slice(0, 5) // 最大5個
    }));
  };

  const handlePresetSelect = (preset: AvatarPreset) => {
    setSelectedPreset(preset);
    const presetUrl = getPresetAvatarDataUrl(preset, 512);
    setFormData(prev => ({ ...prev, avatarUrl: presetUrl }));
    localStorage.setItem('rainbow-match-avatar-preset', preset);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName.trim()) {
      alert('名前を入力してください');
      return;
    }

    setIsLoading(true);
    try {
      const updatedProfile: Profile = {
        ...profile,
        displayName: formData.displayName.trim(),
        bio: formData.bio.trim(),
        age: formData.age,
        ageRange: formData.ageRange,
        city: formData.city,
        height: formData.height,
        bodyStyle: formData.bodyStyle,
        relationshipPurpose: formData.relationshipPurpose,
        genderIdentity: formData.genderIdentity,
        sexualOrientation: formData.sexualOrientation,
        personalityTraits: formData.personalityTraits,
        tags: formData.tags,
        avatarUrl: formData.avatarUrl,
        privacy: {
          ...profile.privacy,
          hidePhoto: formData.hidePhoto
        }
      };

      // データベースに保存を試行
      try {
        await profileAPI.updateProfile({
          user_id: profile.userId,
          display_name: formData.displayName.trim(),
          bio: formData.bio.trim(),
          age_range: formData.ageRange,
          city: formData.city,
          height: formData.height,
          body_style: formData.bodyStyle,
          relationship_purpose: formData.relationshipPurpose,
          personality_traits: formData.personalityTraits,
          tags: formData.tags,
          avatar_url: formData.avatarUrl,
          privacy_settings: {
            ...profile.privacy,
            hidePhoto: formData.hidePhoto
          }
        });
        console.log('Profile updated in database successfully');
      } catch (dbError) {
        console.log('Database update failed, saving locally only:', dbError);
      }

      // ローカルストレージに保存
      localStorage.setItem('rainbow-match-profile', JSON.stringify(updatedProfile));
      
      // 他のコンポーネントに更新を通知
      window.dispatchEvent(new Event('rainbow-profile-updated'));
      
      onProfileUpdate(updatedProfile);
      onClose();
      
      alert('プロフィールを更新しました！');
    } catch (error) {
      console.error('プロフィール更新エラー:', error);
      alert('プロフィールの更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

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

        {/* Form Content - Single scrollable page */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Avatar Selection */}
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 relative">
                <img
                  src={formData.avatarUrl || getPresetAvatarDataUrl(selectedPreset, 512)}
                  alt="プロフィール写真"
                  className="w-full h-full rounded-full object-cover border-4 border-purple-200"
                />
              </div>

              {/* Preset Options */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {(['male', 'female', 'bisexual'] as AvatarPreset[]).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`p-3 rounded-xl border-2 transition-colors ${
                      selectedPreset === preset
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-200 flex items-center justify-center">
                      <User size={20} className="text-gray-500" />
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      {preset === 'male' ? '男性' : preset === 'female' ? '女性' : 'バイ'}
                    </span>
                  </button>
                ))}
              </div>

              {/* Hide Photo Option */}
              <label className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={formData.hidePhoto}
                  onChange={(e) => handleInputChange('hidePhoto', e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span>写真を非表示にする</span>
              </label>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                名前
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="あなたの名前"
                maxLength={20}
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                年齢
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 25)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                min="18"
                max="100"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                自己紹介
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
                rows={4}
                maxLength={300}
                placeholder="あなたについて教えてください..."
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {formData.bio.length}/300
              </div>
            </div>

            {/* Interest Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                趣味・興味（カンマ区切り）
              </label>
              <input
                type="text"
                value={formData.tags.join(', ')}
                onChange={(e) => {
                  const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
                  handleInputChange('tags', tags.slice(0, 8));
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="映画, 読書, 旅行..."
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                場所
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="東京, 日本"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors font-medium"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.displayName.trim()}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>保存中...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>保存</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}