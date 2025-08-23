// Community list component showing available groups
// Displays communities with member counts and join/leave functionality

import { Users, Plus, Check } from 'lucide-react';
import type { Community } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';

interface CommunityListProps {
  communities: Community[];
  onCommunitySelect: (communityId: string) => void;
}

export function CommunityList({ 
  communities, 
  onCommunitySelect
}: CommunityListProps) {
  const { t } = useLanguage();

  const formatMemberCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="space-y-4 pb-6">
      {communities.map((community) => (
        <div key={community.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Community Image */}
          <div className="relative h-32">
            <img
              src={community.imageUrl}
              alt={`${community.name}のカバー画像`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <h3 className="text-white font-bold text-lg">{community.name}</h3>
              <div className="flex items-center space-x-1 text-white/90 text-sm">
                <Users size={14} />
                <span>{formatMemberCount(community.memberCount)} メンバー</span>
              </div>
            </div>
          </div>

          {/* Community Content */}
          <div className="p-4">
            <p className="text-gray-600 leading-relaxed mb-4">{community.description}</p>
            
            <div className="flex items-center justify-between">
              <button
                onClick={() => onCommunitySelect(community.id)}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
              >
                コミュニティを見る
              </button>
              
              {community.isJoined ? (
                <button
                  onClick={() => console.log('Leave community:', community.id)}
                  className="flex items-center space-x-2 bg-green-100 hover:bg-red-100 text-green-700 hover:text-red-700 font-medium py-2 px-4 rounded-lg transition-all duration-200"
                  aria-label={`${community.name}を退会`}
                >
                  <Check size={16} />
                  <span>参加中</span>
                </button>
              ) : (
                <button
                  onClick={() => console.log('Join community:', community.id)}
                  className="flex items-center space-x-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium py-2 px-4 rounded-lg transition-colors"
                  aria-label={`${community.name}に参加`}
                >
                  <Plus size={16} />
                  <span>参加する</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}