import { useState, useEffect, useMemo } from 'react';
import { Heart, Mail, Users, User, Filter, Bell, Coins } from 'lucide-react';
import { LoginForm } from './components/Auth/LoginForm';
import { SignupForm } from './components/Auth/SignupForm';
import { KYCForm } from './components/Auth/KYCForm';
import { ProfileGrid } from './components/Match/ProfileGrid';
import { ChatList } from './components/Chat/ChatList';
import { ChatWindow } from './components/Chat/ChatWindow';
import { CommunityList } from './components/Community/CommunityList';
import { CommunityDetail } from './components/Community/CommunityDetail';
import { SettingsPage } from './components/Settings/SettingsPage';
import { FilterModal } from './components/Match/FilterModal';
import { NotificationCenter } from './components/Notifications/NotificationCenter';
import { LowBalanceAlert } from './components/Billing/LowBalanceAlert';
import { PurchaseModal } from './components/Billing/PurchaseModal';
import { LikedProfilesList } from './components/Match/LikedProfilesList';
import { ProfileDetailModal } from './components/Match/ProfileDetailModal';
import { ChatRestrictionModal } from './components/Common/ChatRestrictionModal';
import { useAuth } from './hooks/useAuth';
import { useProfiles } from './hooks/useProfiles';
import { useChatThreads } from './hooks/useChatThreads';
import { useNotifications } from './hooks/useNotifications';
import { useBilling } from './hooks/useBilling';
import { mockCommunities, mockChatThreads, profiles16 } from './data/mockData';
import { PRICING } from './lib/constants';
import { checkChatRestriction } from './lib/chatRestrictions';
import type { Profile, MatchFilters } from './types';

type Tab = 'discover' | 'likes' | 'chat' | 'community' | 'settings';

function App() {
  const { user, isAuthenticated, isKYCCompleted, completeKYC, logout } = useAuth();
  const { profiles, searchProfiles, sendLike, applyLocalProfileUpdate } = useProfiles();
  const { createThread: createChatThread } = useChatThreads();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(user?.id || '');
  const { balance, deductCredits, createCheckoutSession, completePurchase } = useBilling(user?.id || '');
  
  console.log('App profiles state:', profiles.length);
  console.log('Available mock profiles:', profiles16.length);
  
  const [activeTab, setActiveTab] = useState<Tab>('discover');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showKYC, setShowKYC] = useState(() => {
    // セッションストレージをチェックして、サインアップ完了後はKYCを表示
    return sessionStorage.getItem('signup-completed') === 'true';
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showProfileDetail, setShowProfileDetail] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [likedProfiles, setLikedProfiles] = useState<Set<string>>(new Set());
  const [passedProfiles, setPassedProfiles] = useState<Set<string>>(new Set());
  const [showLowBalanceAlert, setShowLowBalanceAlert] = useState(false);
  const [showChatRestriction, setShowChatRestriction] = useState(false);
  const [chatRestrictionInfo, setChatRestrictionInfo] = useState<{title: string; message: string; targetName: string} | null>(null);
  const [filters, setFilters] = useState<MatchFilters>({
    ageRange: [18, 50],
    maxDistance: 50,
    relationshipPurposes: [],
    ageRanges: [],
    prefectures: [],
    sexualOrientations: [],
    showLikedOnly: false
  });

  // 認証後のKYC確認
  useEffect(() => {
    if (isAuthenticated && !isKYCCompleted) {
      setShowKYC(true);
    }
  }, [isAuthenticated, isKYCCompleted]);

  // フィルター変更時にプロフィール再検索
  useEffect(() => {
    if (isAuthenticated && isKYCCompleted) {
      searchProfiles(filters);
    }
  }, [filters, isAuthenticated, isKYCCompleted, searchProfiles]);
  // 低残高アラート表示制御
  useEffect(() => {
    if (balance.messageCredits <= balance.lowBalanceThreshold) {
      setShowLowBalanceAlert(true);
    }
  }, [balance]);

  // プロフィール更新イベントを購読して即時反映＋一覧を再取得
  useEffect(() => {
    const handler = () => {
      console.log('[profile-updated] 受信: rainbow-profile-updated');
      try {
        const local = localStorage.getItem('rainbow-match-profile');
        console.log('[profile-updated] localStorage.rainbow-match-profile:', local);
        if (local) {
          const updated = JSON.parse(local);
          console.log('[profile-updated] 解析済みプロフィール:', {
            id: updated.id,
            userId: updated.userId,
            hidePhoto: updated?.privacy?.hidePhoto
          });
          // 即時にUIへ適用
          applyLocalProfileUpdate(updated);
          console.log('[profile-updated] applyLocalProfileUpdate 呼び出し完了');
        }
      } catch (e) {
        console.warn('[profile-updated] localStorage読み込み/解析に失敗:', e);
      }
      // その後に再フェッチで整合性担保
      console.log('[profile-updated] searchProfiles を再実行', { filters });
      searchProfiles(filters);
    };
    window.addEventListener('rainbow-profile-updated', handler as EventListener);
    return () => {
      window.removeEventListener('rainbow-profile-updated', handler as EventListener);
    };
  }, [filters, searchProfiles, applyLocalProfileUpdate]);


  // 念のため userId ベースで重複排除（上流で排除済みだが防御的に）
  const dedupedProfiles = useMemo(() => {
    if (!profiles?.length) return profiles;
    const seen = new Set<string>();
    const result: Profile[] = [];
    for (const p of profiles) {
      if (!seen.has(p.userId)) {
        seen.add(p.userId);
        result.push(p);
      }
    }
    if (result.length !== profiles.length) {
      console.warn('[App] userId重複を排除', { before: profiles.length, after: result.length });
    }
    return result;
  }, [profiles]);

  // 現在のユーザーのプロフィールを先頭に並べ替え（フィルタ結果を尊重）
  const prioritizedProfiles = useMemo(() => {
    if (!user?.id || !dedupedProfiles?.length) return dedupedProfiles;
    const idx = dedupedProfiles.findIndex(p => p.userId === user.id);
    if (idx <= 0) return dedupedProfiles; // 既に先頭 or 見つからない
    const copy = [...dedupedProfiles];
    const [me] = copy.splice(idx, 1);
    return [me, ...copy];
  }, [dedupedProfiles, user?.id]);


  const handleLike = async (profileId: string, isSuper: boolean = false) => {
    // いいね済みの場合は解除
    if (likedProfiles.has(profileId)) {
      setLikedProfiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(profileId);
        return newSet;
      });
      console.log('いいねを解除しました:', profileId);
      return;
    }

    const requiredCredits = isSuper ? PRICING.SUPER_LIKE_COST : 1;
    
    if (balance.messageCredits < requiredCredits) {
      setShowPurchaseModal(true);
      return;
    }

    try {
      // データベースにいいねを保存
      const targetProfile = profiles.find(p => p.id === profileId);
      if (targetProfile) {
        await sendLike(targetProfile.userId, isSuper);
      }
      
      await deductCredits(requiredCredits);
      setLikedProfiles(prev => new Set([...prev, profileId]));
      
      // マッチング通知をシミュレート（10%の確率）
      if (Math.random() < 0.1) {
        console.log('マッチしました！');
      }
    } catch (error) {
      console.error('いいね処理でエラーが発生しました:', error);
    }
  };

  // pass機能は詳細モーダルからは使用しないため一旦未使用

  const handleProfileClick = (profile: Profile) => {
    console.log('Profile clicked:', profile.displayName, profile.id);
    setSelectedProfile(profile);
    setShowProfileDetail(true);
  };

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const handleCommunitySelect = (communityId: string) => {
    setSelectedCommunityId(communityId);
  };

  const handleStartChat = (profile: Profile) => {
    console.log('🚀 チャット開始:', profile.userId);
    
    // 現在のユーザープロフィールを取得
    const currentUserProfile = JSON.parse(localStorage.getItem('rainbow-match-profile') || 'null');
    if (!currentUserProfile) {
      alert('プロフィールが設定されていません');
      return;
    }

    // チャット制限をチェック
    const restriction = checkChatRestriction(currentUserProfile, profile);
    
    if (!restriction.allowed) {
      setChatRestrictionInfo({
        title: restriction.title || 'チャットは禁止されています',
        message: restriction.reason || 'このユーザーとのチャットは制限されています',
        targetName: profile.displayName
      });
      setShowChatRestriction(true);
      return;
    }

    // チャットIDを生成
    const chatId = `chat-${Date.now()}`;
    
    // チャット情報をローカルストレージに保存
    const chatData = {
      id: chatId,
      otherUser: profile,
      createdAt: new Date().toISOString()
    };
    
    try {
      localStorage.setItem(`chat-${chatId}`, JSON.stringify(chatData));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        // ローカルストレージの容量が不足している場合、古いチャットデータを削除
        console.warn('ローカルストレージの容量が不足しています。古いデータを削除します。');
        cleanupOldChatData();
        
        // 再試行
        try {
          localStorage.setItem(`chat-${chatId}`, JSON.stringify(chatData));
        } catch (retryError) {
          console.error('チャットデータの保存に失敗しました:', retryError);
          alert('チャットデータの保存に失敗しました。ブラウザのストレージをクリアしてください。');
          return;
        }
      } else {
        console.error('チャットデータの保存に失敗しました:', error);
        alert('チャットデータの保存に失敗しました。');
        return;
      }
    }
    
    // チャットスレッドを作成（データベース用）
    createChatThread(profile).then(result => {
      if (result.ok && result.threadId) {
        console.log('💬 チャット作成成功:', result.threadId);
        // データベースのスレッドIDも保存
        const updatedChatData = { ...chatData, dbThreadId: result.threadId };
        try {
          localStorage.setItem(`chat-${chatId}`, JSON.stringify(updatedChatData));
        } catch (error) {
          console.warn('データベースIDの保存に失敗しましたが、チャットは継続できます:', error);
        }
        setSelectedChatId(chatId);
      } else {
        console.log('データベース保存失敗、ローカルモードで継続:', result.error);
        setSelectedChatId(chatId);
      }
    });
    
    // チャットタブに切り替え
    setActiveTab('chat');
    
    // プロフィールモーダルを閉じる
    setShowProfileDetail(false);
    setSelectedProfile(null);
  };

  // 古いチャットデータをクリーンアップする関数
  const cleanupOldChatData = () => {
    try {
      const chatKeys = Object.keys(localStorage).filter(key => key.startsWith('chat-'));
      
      // チャットデータを作成日時でソート（古い順）
      const chatDataWithKeys = chatKeys.map(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          return { key, createdAt: data.createdAt || '1970-01-01T00:00:00.000Z' };
        } catch {
          return { key, createdAt: '1970-01-01T00:00:00.000Z' };
        }
      }).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      // 古いチャットデータの半分を削除
      const deleteCount = Math.max(1, Math.floor(chatDataWithKeys.length / 2));
      for (let i = 0; i < deleteCount; i++) {
        const { key } = chatDataWithKeys[i];
        localStorage.removeItem(key);
        // 関連するメッセージデータも削除
        const messageKey = `messages-${key}`;
        localStorage.removeItem(messageKey);
      }
      
      console.log(`${deleteCount}個の古いチャットデータを削除しました`);
    } catch (error) {
      console.error('チャットデータのクリーンアップに失敗しました:', error);
    }
  };

  const handleKYCComplete = async (kycData: any) => {
    const result = await completeKYC(kycData);
    if (result.ok) {
      setShowKYC(false);
      sessionStorage.removeItem('signup-completed');
      
      // 登録完了の通知
      alert('🎉 登録が完了しました！素敵な出会いを見つけてください。');
      
      // プロフィールリストを再検索
      await searchProfiles(filters);
    } else {
      alert(result.error || 'KYC完了に失敗しました');
    }
  };

  const handlePurchase = async () => {
    try {
      const result = await createCheckoutSession('message_package_50');
      if (result.ok && result.data) {
        // 実際のアプリでは、Stripe Checkoutページに遷移
        console.log('Redirecting to Stripe Checkout:', result.data.url);
        
        // デモ用の自動完了（実際はWebhookで処理）
        setTimeout(async () => {
          await completePurchase(result.data!.sessionId);
          setShowPurchaseModal(false);
          alert(`購入が完了しました！${PRICING.PACKAGE_CREDITS}通分のメッセージクレジットが追加されました。`);
        }, 2000);
      } else {
        alert(result.error || '購入に失敗しました');
      }
    } catch (error) {
      alert('購入に失敗しました');
    }
  };

  // 認証されていない場合は認証画面を表示
  if (!isAuthenticated && !showKYC) {
    console.log('App: Showing auth screen', { authMode, isAuthenticated, showKYC });
    return (
      <div className="min-h-screen bg-gray-50">
        {authMode === 'login' ? (
          <LoginForm
            onSuccess={() => {
              console.log('✅ LoginForm onSuccess - 認証完了');
              // 状態は useAuth で自動更新されるため、何もしない
            }}
            onSwitchToSignup={() => setAuthMode('signup')}
          />
        ) : (
          <SignupForm onSuccess={() => setShowKYC(true)} />
        )}
      </div>
    );
  }

  // KYC未完了の場合はKYC画面を表示
  if (showKYC) {
    console.log('App: Showing KYC screen');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <KYCForm onComplete={handleKYCComplete} initialStep={3} />
      </div>
    );
  }

  // デバッグ情報を表示（開発時のみ）
  console.log('App render - profiles available:', prioritizedProfiles.length);
  console.log('App render - auth state:', { isAuthenticated, isKYCCompleted, user: user?.email });
  console.log('Current tab:', activeTab);
  console.log('Show profile detail:', showProfileDetail);
  console.log('Selected profile:', selectedProfile?.displayName || 'none');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Rainbow Mail
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-yellow-50 px-3 py-1 rounded-full">
                <Coins className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">
                  {balance.messageCredits}
                </span>
              </div>
              
              {activeTab === 'discover' && (
                <button
                  onClick={() => setShowFilterModal(true)}
                  className="flex items-center space-x-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg transition-colors font-medium"
                  aria-label="フィルター"
                  title="フィルター"
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm">フィルター</span>
                </button>
              )}
              
              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors"
                aria-label="通知"
                title="通知"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 低残高アラート */}
      {showLowBalanceAlert && balance.messageCredits <= balance.lowBalanceThreshold && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <LowBalanceAlert
            currentBalance={balance.messageCredits}
            threshold={balance.lowBalanceThreshold}
            onPurchase={() => setShowPurchaseModal(true)}
            onDismiss={() => setShowLowBalanceAlert(false)}
          />
        </div>
      )}

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        {activeTab === 'discover' && (
          <ProfileGrid
            profiles={prioritizedProfiles}
            likedProfiles={likedProfiles}
            passedProfiles={passedProfiles}
            filters={filters}
            onLike={handleLike}
            onProfileClick={handleProfileClick}
            currentUserId={user?.id}
          />
        )}

        {activeTab === 'likes' && (
          <LikedProfilesList
            likedProfiles={Array.from(likedProfiles).map(id => 
              profiles.find(p => p.id === id)!
            ).filter(Boolean)}
            onProfileClick={handleProfileClick}
            onStartChat={handleStartChat}
          />
        )}

        {activeTab === 'chat' && !selectedChatId && (
          <ChatList
            onChatSelect={handleChatSelect}
          />
        )}

        {activeTab === 'chat' && selectedChatId && (
          <ChatWindow
            chatId={selectedChatId}
            onBack={() => setSelectedChatId(null)}
          />
        )}

        {activeTab === 'community' && !selectedCommunityId && (
          <CommunityList
            communities={mockCommunities}
            onCommunitySelect={handleCommunitySelect}
          />
        )}

        {activeTab === 'community' && selectedCommunityId && (
          <CommunityDetail
            communityId={selectedCommunityId}
            onBack={() => setSelectedCommunityId(null)}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPage onLogout={logout} />
        )}
      </main>

      {/* タブナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-around py-2">
            {[
              { id: 'discover', icon: Heart, label: '検索' },
              { id: 'likes', icon: Heart, label: 'いいね' },
              { id: 'chat', icon: Mail, label: 'メール' },
              { id: 'community', icon: Users, label: 'コミュニティ' },
              { id: 'settings', icon: User, label: 'マイページ' }
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as Tab)}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  activeTab === id
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* モーダル */}
      {showFilterModal && (
        <FilterModal
          filters={filters}
          onApply={setFilters}
          onClose={() => setShowFilterModal(false)}
        />
      )}

      {showNotifications && (
        <NotificationCenter
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
        />
      )}

      {showPurchaseModal && (
        <PurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          onPurchase={handlePurchase}
          currentBalance={balance.messageCredits}
        />
      )}

      {showProfileDetail && selectedProfile && (
        <div className="fixed inset-0 z-50">
        <ProfileDetailModal
          profile={selectedProfile}
          onClose={() => {
            console.log('ProfileDetailModal: Closing modal');
            setShowProfileDetail(false);
            setSelectedProfile(null);
          }}
          onLike={(isSuper) => handleLike(selectedProfile.id, isSuper)}
          onMessage={handleStartChat}
          isLiked={likedProfiles.has(selectedProfile.id)}
          isPassed={passedProfiles.has(selectedProfile.id)}
        />
        </div>
      )}

      {/* Chat Restriction Modal */}
      {showChatRestriction && chatRestrictionInfo && (
        <ChatRestrictionModal
          isOpen={showChatRestriction}
          onClose={() => setShowChatRestriction(false)}
          title={chatRestrictionInfo.title}
          message={chatRestrictionInfo.message}
          currentUserName={user?.email?.split('@')[0] || 'あなた'}
          targetUserName={chatRestrictionInfo.targetName}
        />
      )}
    </div>
  );
}

export default App;