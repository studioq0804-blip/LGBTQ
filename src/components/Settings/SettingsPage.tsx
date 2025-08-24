import React, { useState } from 'react';
import { 
  User, 
  Shield, 
  Bell, 
  CreditCard, 
  LogOut, 
  ChevronRight,
  UserX,
  Edit3,
  Eye,
  Settings as SettingsIcon
} from 'lucide-react';
import { ProfileEditModal } from './ProfileEditModal';
import { PrivacySettingsModal } from './PrivacySettingsModal';
import { NotificationSettingsModal } from './NotificationSettingsModal';
import { BillingPage } from '../Billing/BillingPage';
import { AccountManagementModal } from './AccountManagementModal';
import { BlockedUsersList } from '../Moderation/BlockedUsersList';
import { useAuth } from '../../hooks/useAuth';

interface SettingsPageProps {
  onLogout: () => void;
}

export function SettingsPage({ onLogout }: SettingsPageProps) {
  const { profile } = useAuth();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showBillingPage, setShowBillingPage] = useState(false);

  if (showBillingPage) {
    return <BillingPage onBack={() => setShowBillingPage(false)} />;
  }

  const settingsItems = [
    {
      id: 'profile',
      title: 'プロフィール編集',
      description: '表示名、写真、自己紹介を編集',
      icon: User,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'privacy',
      title: 'プライバシー設定',
      description: '表示設定、検索設定を管理',
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'notifications',
      title: '通知設定',
      description: 'プッシュ通知、メール通知を管理',
      icon: Bell,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      id: 'billing',
      title: '課金・支払い',
      description: 'クレジット購入、支払い履歴',
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'blocked',
      title: 'ブロック済みユーザー',
      description: 'ブロックしたユーザーを管理',
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      id: 'account',
      title: 'アカウント管理',
      description: 'パスワード変更、アカウント削除',
      icon: SettingsIcon,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    }
  ];

  const handleItemClick = (itemId: string) => {
    if (itemId === 'billing') {
      setShowBillingPage(true);
    } else {
      setActiveModal(itemId);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <div className="max-w-2xl mx-auto pb-6">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <img
              src={profile?.avatarUrl}
              alt="プロフィール写真"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile?.displayName || 'ユーザー'}</h1>
              <p className="text-gray-600">{profile?.city || '未設定'} • {profile?.age || '?'}歳</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {settingsItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className="w-full p-6 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-lg ${item.bgColor} flex items-center justify-center mr-4`}>
                    <Icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            );
          })}
        </div>

        {/* ログアウトボタン */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5 mr-2" />
            ログアウト
          </button>
        </div>
      </div>

      {/* モーダル */}
      {activeModal === 'profile' && profile && (
        <ProfileEditModal 
          isOpen={true}
          profile={profile} 
          onClose={closeModal}
          onProfileUpdate={(updatedProfile) => {
            // Update localStorage with new profile data
            localStorage.setItem('rainbow-match-profile', JSON.stringify(updatedProfile));
            // Dispatch event to notify other components
            window.dispatchEvent(new Event('rainbow-profile-updated'));
            closeModal();
          }}
        />
      )}

      {activeModal === 'privacy' && (
        <PrivacySettingsModal onClose={closeModal} />
      )}

      {activeModal === 'notifications' && (
        <NotificationSettingsModal onClose={closeModal} />
      )}

      {activeModal === 'blocked' && (
        <BlockedUsersList onClose={closeModal} />
      )}

      {activeModal === 'account' && (
        <AccountManagementModal isOpen={true} onClose={closeModal} />
      )}
    </div>
  );
}