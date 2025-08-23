import { Heart, MapPin, Calendar, Tag, Users } from 'lucide-react';
import type { Profile } from '../../types';
import { mockCommunities } from '../../data/mockData';

interface ProfileCardProps {
  profile: Profile;
  onLike: (profileId: string, isSuper?: boolean) => void;
  onPass: (profileId: string) => void;
  onProfileClick: (profile: Profile) => void;
  isLiked: boolean;
  isPassed: boolean;
}

export function ProfileCard({ 
  profile, 
  onLike, 
  onPass, 
  onProfileClick,
  isLiked, 
  isPassed 
}: ProfileCardProps) {
  const calculateAge = (age: number) => `${age}歳`;

  // Get community names from IDs
  const getCommunityNames = (communityIds: string[]) => {
    return communityIds
      .map(id => mockCommunities.find(c => c.id === id)?.name)
      .filter(Boolean) as string[];
  };

  const communityNames = getCommunityNames(profile.joinedCommunities);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-sm mx-auto">
      {/* Profile Image */}
      <div className="relative aspect-[4/5] bg-gradient-to-br from-pink-100 to-purple-100">
        <img
          src={profile.avatarUrl}
          alt={`${profile.displayName}のプロフィール写真`}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => onProfileClick(profile)}
          loading="lazy"
        />
        
        {/* Action Buttons */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-4">
          <button
            onClick={() => onPass(profile.id)}
            disabled={isPassed}
            className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
              isPassed
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-white hover:bg-gray-50 hover:scale-110'
            }`}
            aria-label="あとで"
          >
            <span className="text-2xl">👋</span>
          </button>
          
          <button
            onClick={() => onLike(profile.id, false)}
            disabled={isLiked}
            className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
              isLiked
                ? 'bg-pink-500 cursor-not-allowed'
                : 'bg-white hover:bg-pink-50 hover:scale-110'
            }`}
            aria-label="いいね"
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'text-white fill-current' : 'text-pink-500'}`} />
          </button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="p-6 space-y-4">
        {/* Name and Age */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">{profile.displayName}</h3>
          <div className="flex items-center space-x-4 text-gray-600">
            {profile.privacy.showAge && (
              <div className="flex items-center space-x-1">
                <Calendar size={16} />
                <span>{profile.ageRange || calculateAge(profile.age)}</span>
              </div>
            )}
            {profile.privacy.showCity && (
              <div className="flex items-center space-x-1">
                <MapPin size={16} />
                <span>{profile.city}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && profile.privacy.showBio && (
          <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
        )}

        {/* Tags */}
        {profile.tags.length > 0 && profile.privacy.showTags && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Tag size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-600">興味・関心</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.tags.slice(0, 4).map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
              {profile.tags.length > 4 && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  +{profile.tags.length - 4}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Communities */}
        {communityNames.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Users size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-600">参加コミュニティ</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {communityNames.slice(0, 2).map((name, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium"
                >
                  {name}
                </span>
              ))}
              {communityNames.length > 2 && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  +{communityNames.length - 2}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}