// チャット一覧コンポーネント（データベース中心）
// 課金ベースのメール機能として、Supabaseから直接データを取得

import { MessageCircle, Clock } from 'lucide-react';
import { useChatThreads } from '../../hooks/useChatThreads';
import { useLanguage } from '../../hooks/useLanguage';
import { profiles16 } from '../../data/mockData';

interface ChatListProps {
  onChatSelect: (chatId: string) => void;
}

export function ChatList({ onChatSelect }: ChatListProps) {
  const { t } = useLanguage();
  const { threads, isLoading } = useChatThreads();

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-500">メール一覧を読み込み中...</p>
      </div>
    );
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return t('now');
    if (diffInMinutes < 60) return `${diffInMinutes}${t('minuteAgo')}`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}${t('hourAgo')}`;
    return `${Math.floor(diffInMinutes / 1440)}${t('dayAgo')}`;
  };

  if (threads.length === 0) {
    return (
      <div className="text-center py-16">
        <MessageCircle className="mx-auto text-gray-300 mb-4" size={64} />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">メールがありません</h3>
        <p className="text-gray-500">マッチした相手とのメールがここに表示されます</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 pb-6">
      {threads.map((chat) => {
        // プロフィール情報を取得
        const otherParticipant = chat.participants[0] || profiles16[0]; // 実際の参加者を使用
        
        return (
          <button
            key={chat.id}
            onClick={() => onChatSelect(chat.id)}
            className="w-full p-4 bg-white rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-200 text-left"
          >
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={otherParticipant.avatarUrl}
                  alt={`${otherParticipant.displayName}のアバター`}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {chat.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {otherParticipant.displayName}
                  </h3>
                  <div className="flex items-center space-x-1 text-gray-500 text-sm">
                    <Clock size={12} />
                    <span>{formatTime(chat.updatedAt)}</span>
                  </div>
                </div>
                
                {chat.lastMessage ? (
                  <p className={`text-sm truncate ${
                    chat.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'
                  }`}>
                    {chat.lastMessage.text}
                  </p>
                ) : (
                  <p className="text-gray-500 text-sm italic">新しいマッチです</p>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}