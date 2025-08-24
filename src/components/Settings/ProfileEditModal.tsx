import { useState, useEffect } from 'react';
import { X, Save, Camera, Upload, User, Heart, MapPin } from 'lucide-react';
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
  const [step, setStep] = useState(1);
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
      setFormData(prev => ({ ...prev, avatarUrl }));
    } catch (error) {
      console.error('Avatar upload error:', error);
      alert('画像のアップロードに失敗しました');
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
        <div className="px-6 py-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <User className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">基本情報</h3>
                <p className="text-gray-600">あなたの基本的な情報を入力してください</p>
              </div>

              {/* Avatar Selection */}
              <div className="text-center">
                <h4 className="font-medium text-gray-900 mb-4">プロフィール写真</h4>
                
                {/* Current Avatar */}
                <div className="w-24 h-24 mx-auto mb-4 relative">
                  <img
                    src={formData.avatarUrl || getPresetAvatarDataUrl(selectedPreset, 512)}
                    alt="プロフィール写真"
                    className="w-full h-full rounded-full object-cover border-4 border-purple-200"
                  />
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-pink-600 transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
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
                      <img
                        src={getPresetAvatarDataUrl(preset, 64)}
                        alt={`${preset}プリセット`}
                        className="w-12 h-12 rounded-full mx-auto mb-2"
                      />
                      <span className="text-xs font-medium text-gray-700 capitalize">
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
                  表示名 *
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="あなたの名前"
                  required
                  maxLength={20}
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  年齢 *
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 25)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  min="18"
                  max="100"
                  required
                />
              </div>

              {/* Age Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  年代区分
                </label>
                <select
                  value={formData.ageRange}
                  onChange={(e) => handleInputChange('ageRange', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                >
                  <option value="">年代を選択してください</option>
                  {AGE_RANGE_OPTIONS.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Identity */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">アイデンティティ</h3>
                <p className="text-gray-600">あなたのアイデンティティについて教えてください</p>
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

              {/* Personality Traits */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  性格（最大5個）
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PERSONALITY_TRAITS.map((trait) => (
                    <button
                      key={trait}
                      type="button"
                      onClick={() => handlePersonalityToggle(trait)}
                      className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.personalityTraits.includes(trait)
                          ? 'bg-pink-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {trait}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  選択済み: {formData.personalityTraits.length}/5
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">詳細情報</h3>
                <p className="text-gray-600">追加の詳細情報を入力してください</p>
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

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  都道府県
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
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
                  <option value="">体型を選択してください</option>
                  {BODY_STYLE_OPTIONS.map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>

              {/* Interest Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  興味・関心（最大8個）
                </label>
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {INTEREST_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
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
                  選択済み: {formData.tags.length}/8
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
              onClick={handleSubmit}
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
      </div>
    </div>
  );
}