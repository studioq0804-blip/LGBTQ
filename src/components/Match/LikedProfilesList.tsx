import { useState } from 'react';
import { Heart, Clock, MessageCircle, ArrowLeft, Mail } from 'lucide-react';
import type { Profile } from '../../types';
import { getMockProfiles } from '../../data/mockData';
import { useLanguage } from '../../hooks/useLanguage';
import { ChatRestrictionModal } from '../Common/ChatRestrictionModal';
import { checkChatRestriction } from '../../lib/chatRestrictions';
import { useAuth } from '../../hooks/useAuth';

interface LikedProfilesListProps {
  likedProfiles: Profile[];
  onProfileClick: (profile: Profile) => void;
  onStartChat: (profile: Profile) => void;
}

export function LikedProfilesList({ likedProfiles, onProfileClick, onStartChat }: LikedProfilesListProps) {
  const { t } = useLanguage();
  const { profile: currentUserProfile } = useAuth();
  const [filter, setFilter] = useState<'all' | 'matched' | 'pending'>('all');
  const [showRestrictionModal, setShowRestrictionModal] = useState(false);
  const [restrictionInfo, setRestrictionInfo] = useState<{title: string; message: string; targetName: string} | null>(null);
  
  // 最新のプロフィールデータを取得
  const allProfiles = getMockProfiles();
  
  // いいねしたプロフィールの最新情報を取得
  const updatedLikedProfiles = likedProfiles.map(likedProfile => {
    const latestProfile = allProfiles.find(p => p.id === likedProfile.id);
    return latestProfile || likedProfile;
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return '1時間以内';
    if (diffInHours < 24) return `${diffInHours}時間前`;
    return `${Math.floor(diffInHours / 24)}日前`;
  };

  // フィルタリング（実際のアプリではマッチ状態を確認）
  const filteredProfiles = updatedLikedProfiles.filter(profile => {
    if (filter === 'matched') {
      // 実際のアプリではマッチ状態をチェック
      return Math.random() > 0.6; // デモ用：40%がマッチ済み
    }
    if (filter === 'pending') {
      return Math.random() > 0.4; // デモ用：60%が保留中
    }
    return true;
  });

  const handleStartChat = (profile: Profile) => {
    if (!currentUserProfile) {
      alert('プロフィールが設定されていません');
      return;
    }

    // チャット制限をチェック
    const restriction = checkChatRestriction(currentUserProfile, profile);
    
    if (!restriction.allowed) {
      setRestrictionInfo({
        title: restriction.title || 'チャットは禁止されています',
        message: restriction.reason || 'このユーザーとのチャットは制限されています',
        targetName: profile.displayName
      });
      setShowRestrictionModal(true);
      return;
    }

    // チャット制限なし：通常のチャット開始処理
    onStartChat(profile);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">いいねした人</h1>
            <p className="text-sm text-gray-600">{updatedLikedProfiles.length}人にいいねしました</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            すべて ({updatedLikedProfiles.length})
          </button>
          <button
            onClick={() => setFilter('matched')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'matched'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            マッチ済み
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            返事待ち
          </button>
        </div>
      </div>

      {/* Chat Restriction Modal */}
      {showRestrictionModal && restrictionInfo && (
        <ChatRestrictionModal
          isOpen={showRestrictionModal}
          onClose={() => setShowRestrictionModal(false)}
          title={restrictionInfo.title}
          message={restrictionInfo.message}
          currentUserName={currentUserProfile?.displayName || 'あなた'}
          targetUserName={restrictionInfo.targetName}
        />
      )}

      {/* Profiles List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredProfiles.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {filter === 'matched' ? 'マッチした人はまだいません' : 
               filter === 'pending' ? '返事待ちの人はいません' : 
               'まだ誰にもいいねしていません'}
            </h3>
            <p className="text-gray-500">
              {filter === 'all' ? 'マッチング画面でいいねしてみましょう' : 'もう少し待ってみてください'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProfiles.map((profile) => {
              const isMatched = Math.random() > 0.6; // デモ用
              
              return (
                <div 
                  key={profile.id} 
                  className="bg-white rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onProfileClick(profile)}
                >
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="relative">
                      <img
                        src={profile.avatarUrl}
                        alt={`${profile.displayName}のプロフィール写真`}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      {isMatched && (
                        <div className="absolute -bottom-1 -right-1 bg-pink-500 text-white rounded-full p-1">
                          <Heart size={12} className="fill-current" />
                        </div>
                      )}
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {profile.displayName}
                        </h3>
                        <div className="flex items-center space-x-1 text-gray-500 text-sm">
                          <Clock size={12} />
                          <span>{formatTime(profile.lastActive)}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {profile.ageRange || `${profile.age}歳`} • {profile.city}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isMatched 
                            ? 'bg-pink-100 text-pink-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {isMatched ? 'マッチ済み' : '返事待ち'}
                        </span>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartChat(profile);
                          }}
                          className="flex items-center space-x-1 bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm font-medium py-1 px-3 rounded-lg transition-colors"
                          title="メールを送る"
                        >
                          <Mail size={14} />
                          <span>メール</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}