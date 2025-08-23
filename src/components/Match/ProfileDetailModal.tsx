// プロフィール詳細モーダルコンポーネント
// 個別プロフィールの詳細情報を表示

import { X, Heart, MapPin, Calendar, Tag, Users } from 'lucide-react';
import { Mail } from 'lucide-react';
import { useState } from 'react';
import type { Profile } from '../../types';
import { mockCommunities, getMockProfiles } from '../../data/mockData';
import { ChatRestrictionModal } from '../Common/ChatRestrictionModal';
import { checkChatRestriction } from '../../lib/chatRestrictions';
import { useAuth } from '../../hooks/useAuth';

interface ProfileDetailModalProps {
  profile: Profile | null;
  onClose: () => void;
  onLike: (isSuper?: boolean) => void;
  onMessage: (profile: Profile) => void;
  isLiked: boolean;
  isPassed: boolean;
}

export function ProfileDetailModal({ 
  profile, 
  onClose, 
  onLike, 
  onMessage,
  isLiked, 
  isPassed 
}: ProfileDetailModalProps) {
  const { profile: currentUserProfile } = useAuth();
  const [showRestrictionModal, setShowRestrictionModal] = useState(false);
  const [restrictionInfo, setRestrictionInfo] = useState<{title: string; message: string} | null>(null);

  // 最新のプロフィール情報を取得
  const allProfiles = getMockProfiles();
  const latestProfile = allProfiles.find(p => p.id === profile?.id) || profile;

  if (!latestProfile) return null;

  console.log('ProfileDetailModal rendering:', latestProfile.displayName, latestProfile.id);

  const calculateAge = (age: number) => `${age}歳`;

  // Get community names from IDs
  const getJoinedCommunityNames = () => {
    return latestProfile.joinedCommunities
      .map(communityId => {
        const community = mockCommunities.find(c => c.id === communityId);
        return community?.name;
      })
      .filter(Boolean) as string[];
  };

  const joinedCommunityNames = getJoinedCommunityNames();

  const handleMessageClick = () => {
    if (!currentUserProfile) {
      alert('プロフィールが設定されていません');
      return;
    }

    // チャット制限をチェック
    const restriction = checkChatRestriction(currentUserProfile, latestProfile);
    
    if (!restriction.allowed) {
      setRestrictionInfo({
        title: restriction.title || 'チャットは禁止されています',
        message: restriction.reason || 'このユーザーとのチャットは制限されています'
      });
      setShowRestrictionModal(true);
      return;
    }

    // チャット制限なし：通常のメール送信処理
    onMessage(latestProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-0 md:p-4" style={{ zIndex: 9999 }}>
      <div className="bg-white shadow-2xl w-full h-full md:max-w-md md:h-auto md:max-h-[90vh] md:rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative">
          <div className="relative bg-black flex items-center justify-center max-h-[50vh]">
            <img
              src={latestProfile.avatarUrl}
              alt={`${latestProfile.displayName}のプロフィール写真`}
              className="w-full h-auto max-h-[50vh] object-contain"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-colors"
              aria-label="閉じる"
            >
              <X className="text-white" size={20} />
            </button>

            <div className="absolute bottom-3 md:bottom-4 left-4 right-4 text-white">
              <h2 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">{latestProfile.displayName}</h2>
              <div className="flex items-center space-x-3 md:space-x-4 text-xs md:text-sm">
                {latestProfile.privacy.showAge && (
                  <div className="flex items-center space-x-1">
                    <Calendar size={14} />
                    <span>{latestProfile.ageRange || calculateAge(latestProfile.age)}</span>
                  </div>
                )}
                {latestProfile.privacy.showCity && (
                  <div className="flex items-center space-x-1">
                    <MapPin size={14} />
                    <span>{latestProfile.city}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 space-y-5 md:space-y-6 flex-1 overflow-y-auto pb-28">

          {/* Relationship Purpose */}
          {latestProfile.relationshipPurpose && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">出会いの目的</h4>
              <div className="bg-orange-50 rounded-xl p-3">
                <span className="text-orange-700 font-medium">{latestProfile.relationshipPurpose}</span>
              </div>
            </div>
          )}

          {/* Personality Traits */}
          {latestProfile.personalityTraits && latestProfile.personalityTraits.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">性格</h4>
              <div className="flex flex-wrap gap-2">
                {latestProfile.personalityTraits.map((trait, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-pink-100 text-pink-700 text-sm rounded-full font-medium"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Appearance Information */}
          {(latestProfile.height || latestProfile.bodyStyle) && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">外見</h4>
              <div className="grid grid-cols-1 gap-3">
                {latestProfile.height && latestProfile.privacy.showHeight && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 text-sm font-medium">身長</span>
                    <span className="font-semibold text-gray-900">{latestProfile.height}cm</span>
                  </div>
                )}
                {latestProfile.bodyStyle && latestProfile.privacy.showBodyStyle && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 text-sm font-medium">スタイル</span>
                    <span className="font-semibold text-gray-900">{latestProfile.bodyStyle}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bio */}
          {latestProfile.bio && latestProfile.privacy.showBio && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">自己紹介</h4>
              <p className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg">{latestProfile.bio}</p>
            </div>
          )}

          {/* Tags */}
          {latestProfile.tags.length > 0 && latestProfile.privacy.showTags && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Tag size={16} className="text-gray-400" />
                <h4 className="font-semibold text-gray-900">興味・関心</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {latestProfile.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Joined Communities */}
          {joinedCommunityNames.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Users size={16} className="text-gray-400" />
                <h4 className="font-semibold text-gray-900">参加コミュニティ</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {joinedCommunityNames.map((communityName, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium"
                  >
                    {communityName}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - Always show */}
        <div className="flex space-x-3 p-4 md:p-6 border-t border-gray-200 bg-gray-50 pb-[env(safe-area-inset-bottom)]">
          <button
            onClick={() => {
              onLike();
              onClose();
            }}
            disabled={isPassed}
            className={`flex-1 font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg ${
              isLiked 
                ? 'bg-pink-500 hover:bg-pink-600 text-white'
                : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white'
            }`}
          >
            <Heart size={20} className={isLiked ? 'fill-current' : ''} />
            <span>{isLiked ? 'いいねを解除' : 'いいね'}</span>
          </button>
          
          <button
            onClick={() => {
              handleMessageClick();
            }}
            className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
          >
            <Mail size={20} />
            <span>メール</span>
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
          targetUserName={latestProfile.displayName}
        />
      )}
    </div>
  );
}