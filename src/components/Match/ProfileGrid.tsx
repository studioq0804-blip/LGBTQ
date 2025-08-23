import { useEffect, useRef, useState } from 'react';
import { Heart, MapPin, Users } from 'lucide-react';
import type { Profile, MatchFilters } from '../../types';
import { mockCommunities, profiles16 } from '../../data/mockData';
import { getPresetAvatarDataUrl, type AvatarPreset } from '../../lib/avatar';

interface ProfileGridProps {
  profiles: Profile[];
  likedProfiles: Set<string>;
  passedProfiles: Set<string>;
  filters: MatchFilters;
  onLike: (profileId: string, isSuper?: boolean) => void;
  onProfileClick: (profile: Profile) => void;
  currentUserId?: string;
}

export function ProfileGrid({
  profiles,
  likedProfiles,
  passedProfiles,
  filters,
  onLike,
  onProfileClick,
  currentUserId,
}: ProfileGridProps) {
  console.log('ProfileGrid received profiles:', profiles.length);
  console.log('First profile:', profiles[0]);
  
  const STRICT = (import.meta as any)?.env?.VITE_STRICT_MOCK_PROFILES === 'true';
  // 更新後の自分のカードを注入するための一時状態（保存完了イベントで設定）
  const [injectedCurrent, setInjectedCurrent] = useState<Profile | null>(null);

  // デバッグ: 再レンダー回数と主要propsを観測
  const renderCount = useRef(0);
  renderCount.current += 1;
  console.log('[ProfileGrid render]', {
    renderCount: renderCount.current,
    profilesLen: profiles.length,
    head: profiles[0] ? { id: profiles[0].id, userId: profiles[0].userId, hidePhoto: profiles[0]?.privacy?.hidePhoto } : null,
    currentUserId,
    injectedCurrent: injectedCurrent ? { id: injectedCurrent.id, userId: injectedCurrent.userId, hidePhoto: injectedCurrent?.privacy?.hidePhoto } : null,
  });

  useEffect(() => {
    console.log('[ProfileGrid props change] profiles pointer/length', {
      profilesLen: profiles.length,
      head: profiles[0] ? { id: profiles[0].id, userId: profiles[0].userId, hidePhoto: profiles[0]?.privacy?.hidePhoto } : null,
    });
  }, [profiles]);

  // プロファイル配列内の userId 重複を検出して警告
  useEffect(() => {
    if (!profiles?.length) return;
    const counts = new Map<string, number>();
    for (const p of profiles) {
      counts.set(p.userId, (counts.get(p.userId) || 0) + 1);
    }
    const dups = Array.from(counts.entries()).filter(([, c]) => c > 1).map(([u, c]) => ({ userId: u, count: c }));
    if (dups.length > 0) {
      console.warn('[ProfileGrid] userId重複検出', { duplicates: dups, total: profiles.length });
    }
  }, [profiles]);

  useEffect(() => {
    console.log('[ProfileGrid props change] currentUserId', { currentUserId });
  }, [currentUserId]);


  // 編集→保存までは自分の既存カードを常に非表示。保存完了イベントで最新プロフィールを注入表示。
  useEffect(() => {
    const onUpdated = () => {
      try {
        const key = 'rainbow-match-profile';
        const me = JSON.parse(localStorage.getItem(key) || 'null');
        if (me) {
          console.log('[ProfileGrid] 受信: rainbow-profile-updated -> injectedCurrent 設定', {
            userId: me.userId,
            hidePhoto: me?.privacy?.hidePhoto
          });
          setInjectedCurrent(me);
        } else {
          setInjectedCurrent(null);
        }
      } catch (e) {
        console.warn('[ProfileGrid] 注入用プロフィールの取得に失敗', e);
        setInjectedCurrent(null);
      }
    };
    window.addEventListener('rainbow-profile-updated', onUpdated as EventListener);
    // 初回マウント時にも即座に読み込む
    onUpdated();
    return () => window.removeEventListener('rainbow-profile-updated', onUpdated as EventListener);
  }, []);

  console.log('🔍 マッチング対象プロフィール数:', profiles.length);
  
  // Filter profiles based on current filters
  // まず、常に現在ユーザーの既存カードを除外
  const baseProfiles = profiles.filter(profile => {
    if (currentUserId && profile.userId === currentUserId) return false;
    // Skip only passed profiles (keep liked profiles visible)
    if (passedProfiles.has(profile.id)) {
      return false;
    }

    // Show liked only filter
    if (filters.showLikedOnly && !likedProfiles.has(profile.id)) {
      return false;
    }

    // Age filter
    if (profile.age && (profile.age < filters.ageRange[0] || profile.age > filters.ageRange[1])) {
      return false;
    }

    // Sexual orientation filter
    if (filters.sexualOrientations.length > 0) {
      const userOrientation = profile.sexualOrientation || '';
      const matchesOrientation = filters.sexualOrientations.some(filterOrientation => 
        userOrientation.includes(filterOrientation)
      );
      if (!matchesOrientation) return false;
    }

    // Relationship purpose filter
    if (filters.relationshipPurposes.length > 0 && profile.relationshipPurpose && !filters.relationshipPurposes.includes(profile.relationshipPurpose)) {
      return false;
    }

    // Age range filter
    if (filters.ageRanges.length > 0 && profile.ageRange && !filters.ageRanges.includes(profile.ageRange)) {
      return false;
    }

    // Prefecture filter
    if (filters.prefectures.length > 0 && profile.city && !filters.prefectures.includes(profile.city)) {
      return false;
    }

    return true;
  });

  // 保存完了後に受け取った最新の自分のカードを先頭に注入
  // ただし、同一 userId が既に baseProfiles に存在する場合は二重注入しない
  const withInjection = (() => {
    if (!STRICT && injectedCurrent) {
      const exists = baseProfiles.some(p => p.userId === injectedCurrent.userId);
      if (exists) return baseProfiles;
      return [injectedCurrent, ...baseProfiles];
    }
    return baseProfiles;
  })();

  // 表示直前の最終 userId ベースの重複排除（防御的）
  const filteredProfiles = (() => {
    const seen = new Set<string>();
    const deduped = withInjection.filter(p => {
      if (seen.has(p.userId)) return false;
      seen.add(p.userId);
      return true;
    });
    if (deduped.length !== withInjection.length) {
      console.warn('[ProfileGrid] 表示直前に重複を排除', {
        before: withInjection.length,
        after: deduped.length
      });
    }
    return deduped;
  })();


  // 参加コミュニティ名を取得
  const getCommunityNames = (communityIds: string[]) => {
    return communityIds
      .map(id => mockCommunities.find(c => c.id === id)?.name)
      .filter(Boolean) as string[];
  };

  console.log('🎯 フィルター後のプロフィール数:', filteredProfiles.length);

  // 性的指向の分類タブ: gay | lesbian | other
  type OrientationTab = 'gay' | 'lesbian' | 'other';
  const [activeTab, setActiveTab] = useState<OrientationTab>('gay');

  const classify = (p: Profile): OrientationTab => {
    const o = (p.sexualOrientation || '').trim();
    if (o.includes('ゲイ')) return 'gay';
    if (o.includes('レズ')) return 'lesbian';
    // その他: バイ、パン、クエスチョニング、アセク、未設定 など
    return 'other';
  };

  const categoryCounts = (() => {
    let gay = 0, lesbian = 0, other = 0;
    for (const p of withInjection) {
      const c = classify(p);
      if (c === 'gay') gay++;
      else if (c === 'lesbian') lesbian++;
      else other++;
    }
    return { gay, lesbian, other };
  })();

  const categoryFilteredProfiles = withInjection.filter(p => classify(p) === activeTab);

  return (
    <div className="space-y-6 pb-6">

      {/* 分類タブ */}
      <div className="flex items-center gap-2">
        {([
          { key: 'gay', label: 'ゲイ', count: categoryCounts.gay },
          { key: 'lesbian', label: 'レズ', count: categoryCounts.lesbian },
          { key: 'other', label: 'その他', count: categoryCounts.other },
        ] as Array<{key: OrientationTab; label: string; count: number}>).map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors
              ${activeTab === key
                ? 'bg-pink-600 text-white border-pink-600'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
            aria-pressed={activeTab === key ? 'true' : 'false'}
          >
            <span>{label}</span>
            <span
              className={`ml-2 inline-flex items-center justify-center min-w-5 px-1.5 h-5 text-xs rounded-full ${
                activeTab === key ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-700'
               }`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* プロフィールグリッド - 3列縦型カード */}
      {categoryFilteredProfiles.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Heart className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            表示できるプロフィールがありません
          </h3>
          <p className="text-gray-500">
            フィルター条件やタブを変更してみてください
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categoryFilteredProfiles.map((profile) => {
            const isCurrentUser = currentUserId && profile.userId === currentUserId;
            const preset = isCurrentUser 
              ? (localStorage.getItem('rainbow-match-avatar-preset') as AvatarPreset) || 'male'
              : 'male';
            
            // 写真非表示設定または写真がない場合はプリセットアバターを使用
            const shouldHidePhoto = profile.privacy?.hidePhoto || !profile.avatarUrl;
            const avatarSrc = shouldHidePhoto ? getPresetAvatarDataUrl(preset, 512) : profile.avatarUrl;
            const isLiked = likedProfiles.has(profile.id);
            
            return (
              <div
                key={profile.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('ProfileGrid: Card clicked', profile.displayName, profile.id);
                  onProfileClick(profile);
                }}
              >
                {/* 上部: メイン画像 */}
                <div className="relative aspect-[4/5] bg-gradient-to-br from-pink-100 to-purple-100 overflow-hidden">
                  <img
                    src={avatarSrc}
                    alt={profile.displayName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  {/* 性的嗜好バッジ (G/L/その他=O) - sexualOrientation未設定でもO表示 */}
                  {(() => {
                    const o = (profile.sexualOrientation || '').trim();
                    const isGay = o.includes('ゲイ');
                    const isLesbian = o.includes('レズ');
                    const letter = isGay ? 'G' : isLesbian ? 'L' : 'O';
                    const color = isGay ? 'bg-pink-600' : isLesbian ? 'bg-purple-600' : 'bg-gray-700';
                    const label = o || 'その他';
                    return (
                      <div
                        className={`absolute top-2 left-2 ${color} text-white text-xs font-bold px-2 py-1 rounded-full shadow`}
                        title={label}
                        aria-label={`性的嗜好: ${label}`}
                      >
                        {letter}
                      </div>
                    );
                  })()}

                  {/* 画像下部の情報オーバーレイ: 表示名・出身地・年代 */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white">
                    {/* 表示名 */}
                    <h4 className="font-bold text-lg mb-1 truncate" title={profile.displayName}>
                      {profile.displayName}
                    </h4>
                    
                    {/* 都道府県 */}
                    {profile.city && profile.privacy?.showCity && (
                      <div className="flex items-center mb-1">
                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="text-sm truncate" title={profile.city}>
                          {profile.city}
                        </span>
                      </div>
                    )}
                    
                    {/* 出会いの目的 */}
                    {profile.relationshipPurpose && (
                      <div className="inline-block">
                        <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full font-medium">
                          {profile.relationshipPurpose}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Like Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('ProfileGrid: Like button clicked', profile.id);
                      onLike(profile.id, false);
                    }}
                    className={`absolute bottom-2 right-2 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all backdrop-blur-sm border ${
                      isLiked
                        ? 'bg-pink-500 hover:bg-pink-600 border-transparent'
                        : 'bg-white border-pink-500 hover:bg-pink-50'
                    }`}
                    aria-label={isLiked ? 'いいねを解除' : 'いいね'}
                    aria-pressed={isLiked ? 'true' : 'false'}
                    title={isLiked ? 'クリックでいいねを解除' : 'いいね'}
                    data-state={isLiked ? 'on' : 'off'}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'text-white fill-current' : 'text-pink-500'}`} />
                  </button>
                </div>

                {/* Relationship Purpose */}
                {profile.personalityTraits && profile.personalityTraits.length > 0 && (
                  <div className="mb-2">
                    <div className="flex flex-wrap gap-1">
                      {profile.personalityTraits.slice(0, 2).map((trait, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full font-medium"
                        >
                          {trait}
                        </span>
                      ))}
                      {profile.personalityTraits.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{profile.personalityTraits.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* 下部: 詳細情報 */}
                <div className="p-4 space-y-3">
                  {/* 年代 */}
                  {profile.ageRange && profile.privacy?.showAge && (
                    <div className="text-sm text-gray-600 font-medium">
                      {profile.ageRange}
                    </div>
                  )}

                  {/* 自己紹介メッセージ */}
                  {profile.bio && profile.privacy?.showBio && (
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                      {profile.bio}
                    </p>
                  )}

                  {/* 趣味タグ */}
                  {profile.tags.length > 0 && profile.privacy?.showTags && (
                    <div className="flex flex-wrap gap-1">
                      {profile.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {profile.tags.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{profile.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {/* コミュニティ */}
                  {(() => {
                    const communityNames = getCommunityNames(profile.joinedCommunities);
                    return communityNames.length > 0 && (
                      <div>
                        <div className="flex items-center space-x-1 mb-1">
                          <Users className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">コミュニティ</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {communityNames.slice(0, 1).map((name, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium truncate max-w-full"
                            >
                               {name.length > 12 ? `${name.substring(0, 12)}...` : name}
                            </span>
                          ))}
                          {communityNames.length > 1 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{communityNames.length - 1}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}