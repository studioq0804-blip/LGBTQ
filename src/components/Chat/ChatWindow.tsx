// チャットウィンドウコンポーネント（データベース中心・課金対応）
// 課金ベースのメール機能として、全てSupabaseで管理

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, MoreVertical, Flag, UserX } from 'lucide-react';
import { profiles16 } from '../../data/mockData';
import { ReportModal } from '../Moderation/ReportModal';
import { BlockConfirmModal } from '../Moderation/BlockConfirmModal';
import { useModeration } from '../../hooks/useModeration';
import { useChatHistory } from '../../hooks/useChatHistory';
import { useAuth } from '../../hooks/useAuth';

interface ChatWindowProps {
  chatId: string;
  onBack: () => void;
}

export function ChatWindow({ chatId, onBack }: ChatWindowProps) {
  const { user } = useAuth();
  const { messages, sendMessage, markAsRead, isLoading } = useChatHistory(chatId);
  const [newMessage, setNewMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { submitReport, blockUser } = useModeration(user?.id || 'current-user');

  // チャットスレッドから相手ユーザーを取得
  const [otherUser, setOtherUser] = useState<Profile | null>(null);
  
  useEffect(() => {
    // チャットIDから相手ユーザーを特定
    const chatData = localStorage.getItem(`chat-${chatId}`);
    if (chatData) {
      try {
        const parsed = JSON.parse(chatData);
        setOtherUser(parsed.otherUser);
      } catch (error) {
        console.error('Failed to parse chat data:', error);
        setOtherUser(profiles16[0]); // フォールバック
      }
    } else {
      setOtherUser(profiles16[0]); // フォールバック
    }
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // チャットを開いたときに未読メッセージを既読にする
    const unreadMessages = messages.filter(m => !m.isRead && m.senderId !== user?.id);
    if (unreadMessages.length > 0) {
      markAsRead(unreadMessages.map(m => m.id));
    }
  }, [messages, markAsRead, user?.id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const result = await sendMessage(newMessage.trim(), user?.id || 'current-user');
      if (result.ok) {
        setNewMessage('');
      } else {
        alert(result.error || 'メッセージの送信に失敗しました');
      }
    } catch (error) {
      console.error('Message send error:', error);
      alert('メッセージの送信に失敗しました');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReport = async (data: any) => {
    try {
      await submitReport({
        targetUserId: otherUser.userId,
        chatId,
        messageIds: messages.map(m => m.id),
        categories: data.categories,
        comment: data.comment,
        attachments: data.attachments,
        shouldBlock: data.shouldBlock
      });
      setShowReportModal(false);
      setShowMenu(false);
    } catch (error) {
      console.error('通報処理でエラーが発生しました:', error);
    }
  };

  const handleBlock = async () => {
    try {
      await blockUser(otherUser.userId);
      setShowBlockModal(false);
      setShowMenu(false);
      onBack(); // チャット画面から戻る
    } catch (error) {
      console.error('ブロック処理でエラーが発生しました:', error);
    }
  };

  if (!otherUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">チャット情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">メールを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white pb-20">
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <img
            src={otherUser.avatarUrl}
            alt={otherUser.displayName}
            className="w-10 h-10 rounded-full object-cover mr-3"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{otherUser.displayName}</h3>
            <p className="text-sm text-gray-500">オンライン</p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
              <button
                onClick={() => {
                  setShowReportModal(true);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center"
              >
                <Flag className="w-4 h-4 mr-2" />
                通報する
              </button>
              <button
                onClick={() => {
                  setShowBlockModal(true);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center"
              >
                <UserX className="w-4 h-4 mr-2" />
                ブロックする
              </button>
            </div>
          )}
        </div>
      </div>

      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.senderId === user?.id;
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwn
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${isOwn ? 'text-purple-100' : 'text-gray-500'}`}>
                  {new Date(message.createdAt).toLocaleTimeString('ja-JP', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* メッセージ入力 */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="メッセージを入力..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
              disabled={isSending}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? (
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* モーダル */}
      {showReportModal && (
        <ReportModal
          targetUser={otherUser}
          chatId={chatId}
          messageIds={messages.map(m => m.id)}
          onSubmit={handleReport}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {showBlockModal && (
        <BlockConfirmModal
          targetUser={otherUser}
          onConfirm={handleBlock}
          onClose={() => setShowBlockModal(false)}
        />
      )}

      {/* メニューを閉じるためのオーバーレイ */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}