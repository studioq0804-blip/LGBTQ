// ブロック済みユーザー一覧コンポーネント
// ユーザーがブロックしたユーザーの管理画面

import { useState } from 'react';
import { Shield, Trash2, ArrowLeft, Search } from 'lucide-react';
import type { Block } from '../../types/moderation';
import { useLanguage } from '../../hooks/useLanguage';

interface BlockedUsersListProps {
  onClose: () => void;
}

export function BlockedUsersList({ onClose }: BlockedUsersListProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [isUnblocking, setIsUnblocking] = useState<string | null>(null);
  const [blockedUsers] = useState<any[]>([]); // Mock empty list

  const filteredUsers = blockedUsers;

  const handleUnblock = async (userId: string, displayName: string) => {
    if (!confirm(`${displayName}さんのブロックを解除しますか？`)) return;

    setIsUnblocking(userId);
    try {
      console.log('Unblock user:', userId);
    } catch (error) {
      alert('ブロック解除に失敗しました');
    } finally {
      setIsUnblocking(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <button
            onClick={onClose}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            aria-label="戻る"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">ブロック済みユーザー</h1>
            <p className="text-white/90">{blockedUsers.length}人をブロック中</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ユーザーを検索..."
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
          />
        </div>
      </div>

      {/* Blocked Users List */}
      <div className="px-4 pb-4">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {searchQuery ? '該当するユーザーが見つかりません' : 'ブロック済みユーザーはいません'}
            </h3>
            <p className="text-gray-500">
              {searchQuery ? '検索条件を変更してください' : 'ブロックしたユーザーがここに表示されます'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((block) => (
              <div key={block.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <img
                    src={block.blockedUser.avatarUrl}
                    alt={`${block.blockedUser.displayName}のアバター`}
                    className="w-12 h-12 rounded-full object-cover opacity-60"
                  />

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {block.blockedUser.displayName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(block.createdAt)}にブロック
                    </p>
                    {block.reason && (
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        理由: {block.reason}
                      </p>
                    )}
                  </div>

                  {/* Unblock Button */}
                  <button
                    onClick={() => handleUnblock(block.blockedId, block.blockedUser.displayName)}
                    disabled={isUnblocking === block.blockedId}
                    className="flex items-center space-x-1 bg-red-100 hover:bg-red-200 disabled:bg-red-50 text-red-700 disabled:text-red-400 text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                  >
                    {isUnblocking === block.blockedId ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full"></div>
                        <span>解除中...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 size={14} />
                        <span>解除</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <Shield className="text-blue-600 mt-0.5" size={16} />
            <div>
              <p className="text-blue-800 text-sm font-medium mb-1">ブロック機能について</p>
              <ul className="text-blue-700 text-xs space-y-1">
                <li>• ブロックしたユーザーからのメッセージは届きません</li>
                <li>• お互いのプロフィールが表示されなくなります</li>
                <li>• ブロックしたことは相手に通知されません</li>
                <li>• いつでもブロックを解除できます</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}