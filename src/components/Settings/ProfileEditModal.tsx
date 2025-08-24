import { useState, useEffect } from 'react';
import { X, Save, Camera, Upload } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { profileAPI } from '../../lib/supabase/api';
import { PREFECTURES, INTEREST_TAGS } from '../../lib/constants';
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
    city: '',
    tags: [] as string[]
  });
  const [isLoading, setIsLoading] = useState(false);

  // フォームデータを初期化
  useEffect(() => {
    if (profile && isOpen) {
      setFormData({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        age: profile.age || 25,
        city: profile.city || '',
        tags: profile.tags || []
      });
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
        : [...prev.tags, tag]
    }));
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
      // アバターURLは直接プロフィールに保存
      const updatedProfile = { ...profile, avatarUrl };
      localStorage.setItem('rainbow-match-profile', JSON.stringify(updatedProfile));
      onProfileUpdate(updatedProfile);
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
        city: formData.city,
        tags: formData.tags
      };

      // データベースに保存を試行
      try {
        await profileAPI.updateProfile({
          user_id: profile.userId,
          display_name: formData.displayName.trim(),
          bio: formData.bio.trim(),
          city: formData.city,
          tags: formData.tags
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Avatar Upload */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt="プロフィール写真"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-8 h-8 text-gray-400" />
                  )}
                </div>
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
                placeholder="表示名を入力"
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
                onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
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