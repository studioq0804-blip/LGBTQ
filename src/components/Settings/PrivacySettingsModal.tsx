// Privacy settings modal for controlling profile visibility
// Allows users to choose which profile information to display to others

import { useState } from 'react';
import { X, Save, Shield, Eye, EyeOff } from 'lucide-react';
import type { Profile } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';

interface PrivacySettingsModalProps {
  onClose: () => void;
}

export function PrivacySettingsModal({ onClose }: PrivacySettingsModalProps) {
  const { t } = useLanguage();
  const [profile] = useState<Profile>({
    id: 'current-user',
    userId: 'current-user',
    displayName: 'テストユーザー',
    genderIdentity: 'ノンバイナリー',
    sexualOrientation: 'パンセクシュアル',
    bio: 'よろしくお願いします！🌈',
    age: 25,
    city: '東京都',
    tags: ['アート', '映画', 'LGBTQ+'],
    joinedCommunities: [],
    photos: [],
    avatarUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isVisible: true,
    lastActive: new Date().toISOString(),
    privacy: {
      showGenderIdentity: true,
      showSexualOrientation: true,
      showAge: true,
      showCity: true,
      showTags: true,
      showBio: true
    }
  });
  
  const [privacySettings, setPrivacySettings] = useState(profile.privacy);

  const handleToggle = (field: keyof Profile['privacy']) => {
    setPrivacySettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Privacy settings updated:', privacySettings);
    onClose();
  };

  const privacyOptions = [
    {
      key: 'showGenderIdentity' as const,
      label: '性自認',
      description: 'あなたの性自認について',
      value: profile.genderIdentity
    },
    {
      key: 'showSexualOrientation' as const,
      label: '性的指向',
      description: 'あなたの性的指向について',
      value: profile.sexualOrientation
    },
    {
      key: 'showAge' as const,
      label: '年齢',
      description: 'あなたの年齢',
      value: profile.age ? `${profile.age}歳` : ''
    },
    {
      key: 'showCity' as const,
      label: '都道府県',
      description: 'お住まいの地域',
      value: profile.city
    },
    {
      key: 'showTags' as const,
      label: '趣味・関心ごと',
      description: 'あなたの興味や趣味',
      value: profile.tags.join(', ')
    },
    {
      key: 'showBio' as const,
      label: '自己紹介',
      description: 'プロフィールの自己紹介文',
      value: profile.bio
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">プライバシー設定</h2>
              <p className="text-sm text-gray-600">表示する情報を選択してください</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Shield className="text-blue-600 mt-0.5" size={16} />
                <div>
                  <p className="text-blue-800 text-sm font-medium mb-1">プライバシーについて</p>
                  <p className="text-blue-700 text-xs leading-relaxed">
                    オフにした項目は他のユーザーに表示されません。いつでも変更できます。
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {privacyOptions.map((option) => {
                const isEnabled = privacySettings[option.key];
                const hasValue = option.value && option.value.toString().trim().length > 0;
                
                return (
                  <div key={option.key} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{option.label}</h4>
                          {isEnabled ? (
                            <Eye className="text-green-600" size={16} />
                          ) : (
                            <EyeOff className="text-gray-400" size={16} />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{option.description}</p>
                        {hasValue && (
                          <p className="text-sm text-gray-800 mt-2 font-medium">
                            現在の値: {option.value}
                          </p>
                        )}
                        {!hasValue && (
                          <p className="text-sm text-gray-400 mt-2 italic">
                            未設定（プロフィール編集で設定してください）
                          </p>
                        )}
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleToggle(option.key)}
                        disabled={!hasValue}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          isEnabled && hasValue
                            ? 'bg-blue-600'
                            : 'bg-gray-200'
                        } ${!hasValue ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isEnabled && hasValue ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {isEnabled && hasValue ? (
                        <span className="text-green-600 font-medium">✓ 他のユーザーに表示されます</span>
                      ) : !hasValue ? (
                        <span className="text-gray-400">値が設定されていません</span>
                      ) : (
                        <span className="text-gray-500">他のユーザーには表示されません</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors font-medium"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
            >
              <Save size={16} />
              <span>{t('save')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}