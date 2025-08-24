import { useState, useEffect } from 'react';
import { X, Save, Camera, Upload } from 'lucide-react';
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
  const [uploadProgress, setUploadProgress] = useState(0);

  // フォームデータを初期化
  useEffect(() => {
    if (profile && isOpen) {
      setFormData({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
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
        : [...prev.tags, tag].slice(0, 5) // 最大5個
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
    localStorage.setItem('rainbow-match-avatar-preset', preset);
  };

  const handlePhotoToggle = (hidePhoto: boolean) => {
    setFormData(prev => ({ ...prev, hidePhoto }));
    if (hidePhoto) {
      // 写真を非表示にする場合、プリセットアバターを設定
      const presetUrl = getPresetAvatarDataUrl(selectedPreset, 512);
      setFormData(prev => ({ ...prev, avatarUrl: presetUrl }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

    setIsLoading(true);
    setUploadProgress(0);
    
    try {
      console.log('Uploading avatar file:', file.name, file.size);
      
      // プログレス表示のシミュレーション
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);
      
      const avatarUrl = await profileAPI.uploadAvatar(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      console.log('Avatar upload successful, URL:', avatarUrl);
      setFormData(prev => ({ ...prev, avatarUrl, hidePhoto: false }));
      
      setTimeout(() => setUploadProgress(0), 1000);
      alert('写真をアップロードしました！');
    } catch (error) {
      console.error('Avatar upload error:', error);
      alert('画像のアップロードに失敗しました');
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName.trim()) {
      alert('表示名を入力してください');
      return;
    }

    setIsLoading(true);
    try {
      const updatedProfile: Profile = {
        ...profile,
        displayName: formData.displayName.trim(),
        bio: formData.bio.trim(),
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
        console.log('Saving profile to database:', updatedProfile);
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
        console.error('Database update failed, saving locally only:', dbError);
        alert('データベース保存に失敗しましたが、ローカルに保存されました');
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

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Avatar Section */}
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                {formData.hidePhoto ? (
                  <img
                    src={getPresetAvatarDataUrl(selectedPreset, 512)}
                    alt="アバター"
                    className="w-full h-full rounded-2xl object-cover border-4 border-gray-200"
                  />
                ) : (
                  <img
                    src={formData.avatarUrl || getPresetAvatarDataUrl(selectedPreset, 512)}
                    alt="プロフィール写真"
                    className="w-full h-full rounded-2xl object-cover border-4 border-gray-200"
                  />
                )}
                
                {!formData.hidePhoto && (
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-700 transition-colors cursor-pointer shadow-lg"
                  >
                    <Camera size={16} />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Upload Progress */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">アップロード中... {uploadProgress}%</p>
                </div>
              )}

              <div className="mb-4">
                <label className="flex items-center justify-center space-x-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hidePhoto}
                    onChange={(e) => handlePhotoToggle(e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span>写真を非表示にする</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.hidePhoto ? 'アバターが表示されます（いつでも切替可能）' : '写真のかわりにアバターが表示されます（いつでも切替可能）'}
                </p>
              </div>

              {/* Avatar Type Dropdown - Only show when photo is hidden */}
              {formData.hidePhoto && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    アバタータイプ
                  </label>
                  <select
                    value={selectedPreset}
                    onChange={(e) => handlePresetSelect(e.target.value as AvatarPreset)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  >
                    <option value="male">男性</option>
                    <option value="female">女性</option>
                    <option value="bisexual">バイ</option>
                  </select>
                </div>
              )}
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
                placeholder="あなたの名前"
                maxLength={50}
                required
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {formData.displayName.length}/50
              </div>
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

            {/* Age Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                年代 *
              </label>
              <select
                value={formData.ageRange}
                onChange={(e) => handleInputChange('ageRange', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                required
              >
                <option value="">選択してください</option>
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
              >
                <option value="">選択してください</option>
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
              <div className="relative">
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 170)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  min="100"
                  max="250"
                  placeholder="170"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                  cm
                </span>
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
              >
                <option value="">選択してください</option>
                {BODY_STYLE_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
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
              >
                <option value="">選択してください</option>
                {RELATIONSHIP_PURPOSE_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Gender Identity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                性自認
              </label>
              <select
                value={formData.genderIdentity}
                onChange={(e) => handleInputChange('genderIdentity', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              >
                <option value="">選択してください</option>
                {GENDER_IDENTITY_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Sexual Orientation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                性的指向
              </label>
              <select
                value={formData.sexualOrientation}
                onChange={(e) => handleInputChange('sexualOrientation', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              >
                <option value="">選択してください</option>
                {SEXUAL_ORIENTATION_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Personality Traits */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                性格 (最大5個)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PERSONALITY_TRAITS.map((trait) => (
                  <button
                    key={trait}
                    type="button"
                    onClick={() => handlePersonalityToggle(trait)}
                    className={`p-3 rounded-xl text-sm font-medium transition-colors ${
                      formData.personalityTraits.includes(trait)
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {trait}
                  </button>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                選択済み: {formData.personalityTraits.length}/5
              </div>
            </div>

            {/* Interest Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                興味・関心ごと (最大5個)
              </label>
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {INTEREST_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.tags.includes(tag)
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                選択済み: {formData.tags.length}/5
              </div>
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