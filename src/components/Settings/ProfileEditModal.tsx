import { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Camera, 
  Upload, 
  User, 
  MapPin, 
  Calendar,
  Heart,
  Tag,
  FileText,
  Ruler,
  Users
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { profileAPI } from '../../lib/supabase/api';
import { 
  GENDER_IDENTITY_OPTIONS, 
  SEXUAL_ORIENTATION_OPTIONS, 
  PREFECTURES, 
  INTEREST_TAGS,
  RELATIONSHIP_PURPOSE_OPTIONS,
  PERSONALITY_TRAITS,
  BODY_STYLE_OPTIONS
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
    genderIdentity: '',
    sexualOrientation: '',
    bio: '',
    age: 25,
    ageRange: '',
    city: '',
    height: 170,
    bodyStyle: '',
    relationshipPurpose: '',
    personalityTraits: [] as string[],
    tags: [] as string[],
    avatarUrl: '',
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
  });
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreset, setAvatarPreset] = useState<AvatarPreset>('male');
  const [step, setStep] = useState(1);

  // フォームデータを初期化
  useEffect(() => {
    if (profile && isOpen) {
      setFormData({
        displayName: profile.displayName || '',
        genderIdentity: profile.genderIdentity || '',
        sexualOrientation: profile.sexualOrientation || '',
        bio: profile.bio || '',
        age: profile.age || 25,
        ageRange: profile.ageRange || '',
        city: profile.city || '',
        height: profile.height || 170,
        bodyStyle: profile.bodyStyle || '',
        relationshipPurpose: profile.relationshipPurpose || '',
        personalityTraits: profile.personalityTraits || [],
        tags: profile.tags || [],
        avatarUrl: profile.avatarUrl || '',
        privacy: profile.privacy || {
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
      });

      // アバタープリセットを復元
      const savedPreset = localStorage.getItem('rainbow-match-avatar-preset') as AvatarPreset;
      if (savedPreset) {
        setAvatarPreset(savedPreset);
      }
    }
  }, [profile, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePrivacyChange = (field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      privacy: { ...prev.privacy, [field]: value }
    }));
  };

  const handleArrayToggle = (field: 'personalityTraits' | 'tags', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleAvatarPresetChange = (preset: AvatarPreset) => {
    setAvatarPreset(preset);
    localStorage.setItem('rainbow-match-avatar-preset', preset);
    
    // プリセットアバターのURLを生成
    const presetUrl = getPresetAvatarDataUrl(preset, 512);
    handleInputChange('avatarUrl', presetUrl);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック (5MB制限)
    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズは5MB以下にしてください');
      return;
    }

    try {
      setIsLoading(true);
      const avatarUrl = await profileAPI.uploadAvatar(file);
      handleInputChange('avatarUrl', avatarUrl);
      handlePrivacyChange('hidePhoto', false);
    } catch (error) {
      console.error('Avatar upload error:', error);
      alert('画像のアップロードに失敗しました');
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
        genderIdentity: formData.genderIdentity,
        sexualOrientation: formData.sexualOrientation,
        bio: formData.bio.trim(),
        age: formData.age,
        ageRange: formData.ageRange,
        city: formData.city,
        height: formData.height,
        bodyStyle: formData.bodyStyle,
        relationshipPurpose: formData.relationshipPurpose,
        personalityTraits: formData.personalityTraits,
        tags: formData.tags,
        avatarUrl: formData.avatarUrl,
        privacy: formData.privacy
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
          privacy_settings: formData.privacy
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

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <User className="text-purple-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">プロフィール編集</h2>
              <p className="text-sm text-gray-600">ステップ {step} / 3</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="閉じる"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <User className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">基本情報</h3>
                  <p className="text-gray-600">あなたの基本的な情報を入力してください</p>
                </div>

                {/* Avatar Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    プロフィール写真
                  </label>
                  
                  {/* Photo Options */}
                  <div className="space-y-4">
                    {/* Preset Avatars */}
                    <div>
                      <p className="text-sm text-gray-600 mb-3">プリセットアバター（推奨）</p>
                      <div className="flex justify-center space-x-4">
                        {(['male', 'female', 'bisexual'] as AvatarPreset[]).map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleAvatarPresetChange(preset)}
                            className={`w-16 h-16 rounded-full border-4 transition-all ${
                              avatarPreset === preset
                                ? 'border-purple-500 scale-110'
                                : 'border-gray-300 hover:border-purple-300'
                            }`}
                          >
                            <img
                              src={getPresetAvatarDataUrl(preset, 64)}
                              alt={`${preset}プリセット`}
                              className="w-full h-full rounded-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Photo Upload */}
                    <div>
                      <p className="text-sm text-gray-600 mb-3">カスタム写真をアップロード</p>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors">
                        <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                        <label className="text-purple-600 font-semibold hover:text-purple-700 cursor-pointer">
                          写真をアップロード
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-gray-500 text-sm mt-1">JPG, PNG (5MB以下)</p>
                      </div>
                    </div>

                    {/* Hide Photo Option */}
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.privacy.hidePhoto}
                        onChange={(e) => handlePrivacyChange('hidePhoto', e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">写真を非表示にする（プリセットアバターを使用）</span>
                    </label>
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
              </div>
            )}

            {/* Step 2: Identity & Preferences */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Heart className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">アイデンティティ</h3>
                  <p className="text-gray-600">あなたらしさを表現してください</p>
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

                {/* Height */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    身長 (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 170)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    min="140"
                    max="220"
                  />
                </div>

                {/* Body Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    体型
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
                </div>
              </div>
            )}

            {/* Step 3: Details & Bio */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Tag className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">詳細情報</h3>
                  <p className="text-gray-600">あなたの魅力を伝えましょう</p>
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

                {/* Personality Traits */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    性格（複数選択可）
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PERSONALITY_TRAITS.map((trait) => (
                      <button
                        key={trait}
                        type="button"
                        onClick={() => handleArrayToggle('personalityTraits', trait)}
                        className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                          formData.personalityTraits.includes(trait)
                            ? 'bg-pink-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {trait}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interest Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    興味・関心（複数選択可）
                  </label>
                  <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                    {INTEREST_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleArrayToggle('tags', tag)}
                        className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                          formData.tags.includes(tag)
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    選択済み: {formData.tags.length}個
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={step === 1 ? onClose : handleBack}
              className="px-6 py-2 text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors font-medium"
            >
              {step === 1 ? 'キャンセル' : '戻る'}
            </button>
            
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
              >
                次へ
              </button>
            ) : (
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
            )}
          </div>
        </form>
      </div>
    </div>
  );
}