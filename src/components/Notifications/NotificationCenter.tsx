// 通知センターコンポーネント
// 通知一覧の表示、フィルタリング、既読管理を提供

import { useState, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Filter, 
  Search, 
  Heart, 
  MessageCircle, 
  Users, 
  Calendar, 
  Info,
  ArrowLeft,
  X
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../hooks/useAuth';
import type { Notification, NotificationType } from '../../types/notification';

interface NotificationCenterProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAsRead: (notificationIds: string[]) => void;
  onMarkAllAsRead: () => void;
}

export function NotificationCenter({ notifications, onClose, onMarkAsRead, onMarkAllAsRead }: NotificationCenterProps) {
  const { user } = useAuth();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = notifications.filter(n => !n.readAt).length;

  // 通知タイプのアイコンとラベル
  const notificationTypes = {
    'match.created': { icon: Heart, label: 'マッチ', color: 'text-pink-600' },
    'message.new': { icon: MessageCircle, label: 'メッセージ', color: 'text-blue-600' },
    'message.reminder': { icon: MessageCircle, label: 'リマインド', color: 'text-yellow-600' },
    'community.post': { icon: Users, label: 'コミュニティ', color: 'text-green-600' },
    'event.reminder': { icon: Calendar, label: 'イベント', color: 'text-purple-600' },
    'system.announcement': { icon: Info, label: 'お知らせ', color: 'text-gray-600' }
  };

  // フィルタリングされた通知
  const filteredNotifications = notifications.filter(notification => {
    // 既読/未読フィルター
    if (filter === 'unread' && notification.readAt) return false;
    
    // タイプフィルター
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
    
    // 検索フィルター
    if (searchQuery && !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !notification.body.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // 通知をクリックした時の処理
  const handleNotificationClick = async (notification: Notification) => {
    // 未読の場合は既読にする
    if (!notification.readAt) {
      await onMarkAsRead([notification.id]);
    }
    
    // デモ用: コンソールログ
    console.log('Navigate to:', notification.link);
    onClose();
  };

  // 時間のフォーマット
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'たった今';
    if (diffInMinutes < 60) return `${diffInMinutes}分前`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}時間前`;
    return `${Math.floor(diffInMinutes / 1440)}日前`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Bell className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">通知センター</h2>
              <p className="text-sm text-gray-600">
                {unreadCount > 0 ? `${unreadCount}件の未読通知` : '未読通知はありません'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="閉じる"
          >
            <X size={20} />
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-gray-200 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="通知を検索..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                すべて
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === 'unread'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                未読のみ
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <CheckCheck size={16} />
                <span>全て既読</span>
              </button>
            )}
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as NotificationType | 'all')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">すべての種類</option>
            {Object.entries(notificationTypes).map(([type, config]) => (
              <option key={type} value={type}>{config.label}</option>
            ))}
          </select>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-[calc(90vh-280px)]">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">通知がありません</h3>
              <p className="text-gray-500">
                {filter === 'unread' ? '未読の通知はありません' : '通知が届くとここに表示されます'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => {
                const typeConfig = notificationTypes[notification.type];
                const Icon = typeConfig.icon;
                
                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      !notification.readAt ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        !notification.readAt ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <Icon className={typeConfig.color} size={18} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`font-semibold truncate ${
                            !notification.readAt ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {formatTime(notification.createdAt)}
                            </span>
                            {!notification.readAt && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        
                        <p className={`text-sm leading-relaxed ${
                          !notification.readAt ? 'text-gray-800' : 'text-gray-600'
                        }`}>
                          {notification.body}
                        </p>
                        
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            !notification.readAt 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {typeConfig.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}