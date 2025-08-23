// 通知管理フック
// 通知の取得、既読管理、設定変更を提供

import { useState, useEffect, useCallback } from 'react';
import type { Notification, NotificationSettings } from '../types/notification';
import { initializeMockNotifications } from '../data/mockNotifications';

const MOCK_DELAY = 500;

// デフォルト通知設定
const DEFAULT_SETTINGS: NotificationSettings = {
  userId: '',
  global: true,
  types: {
    'match.created': true,
    'message.new': true,
    'message.reminder': false,
    'community.post': true,
    'event.reminder': true,
    'system.announcement': true
  },
  frequency: 'immediate',
  dnd: {
    start: '22:00',
    end: '08:00'
  },
  channels: {
    push: true,
    email: false,
    inapp: true
  }
};

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // 通知を取得
  const fetchNotifications = useCallback(async (unreadOnly = false) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
      
      // モックデータから取得
      const stored = localStorage.getItem(`notifications-${userId}`);
      let allNotifications: Notification[] = stored ? JSON.parse(stored) : [];
      
      if (unreadOnly) {
        allNotifications = allNotifications.filter(n => !n.readAt);
      }
      
      setNotifications(allNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // 通知設定を取得
  const fetchSettings = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
      
      const stored = localStorage.getItem(`notification-settings-${userId}`);
      const userSettings = stored ? JSON.parse(stored) : { ...DEFAULT_SETTINGS, userId };
      
      setSettings(userSettings);
    } catch (error) {
      console.error('Failed to fetch notification settings:', error);
    }
  }, [userId]);

  // 通知を既読にする
  const markAsRead = useCallback(async (notificationIds: string[]) => {
    try {
      await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
      
      const stored = localStorage.getItem(`notifications-${userId}`);
      const allNotifications: Notification[] = stored ? JSON.parse(stored) : [];
      
      const updated = allNotifications.map(notification => 
        notificationIds.includes(notification.id)
          ? { ...notification, readAt: new Date().toISOString() }
          : notification
      );
      
      localStorage.setItem(`notifications-${userId}`, JSON.stringify(updated));
      setNotifications(updated);
      
      return { ok: true };
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
      return { ok: false, error: '既読処理に失敗しました' };
    }
  }, [userId]);

  // 全て既読にする
  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter(n => !n.readAt).map(n => n.id);
    return markAsRead(unreadIds);
  }, [notifications, markAsRead]);

  // 通知設定を更新
  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    try {
      await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
      
      const updated = { ...settings, ...newSettings };
      localStorage.setItem(`notification-settings-${userId}`, JSON.stringify(updated));
      setSettings(updated);
      
      return { ok: true };
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      return { ok: false, error: '設定の更新に失敗しました' };
    }
  }, [settings, userId]);

  // 新しい通知を作成（デモ用）
  const createNotification = useCallback(async (notification: Omit<Notification, 'id' | 'createdAt' | 'readAt'>) => {
    try {
      // 設定チェック
      if (!settings.global || !settings.types[notification.type]) {
        return { ok: true }; // 通知は作成しないが成功とする
      }

      // DND時間チェック
      const now = new Date();
      const currentTime = now.toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Asia/Tokyo'
      });
      
      const isDNDTime = (currentTime >= settings.dnd.start || currentTime <= settings.dnd.end);
      
      const newNotification: Notification = {
        ...notification,
        id: `notification-${Date.now()}`,
        createdAt: now.toISOString(),
        readAt: null,
        channels: isDNDTime ? ['inapp'] : notification.channels // DND中はinappのみ
      };

      const stored = localStorage.getItem(`notifications-${userId}`);
      const allNotifications: Notification[] = stored ? JSON.parse(stored) : [];
      
      const updated = [newNotification, ...allNotifications];
      localStorage.setItem(`notifications-${userId}`, JSON.stringify(updated));
      
      // 状態を更新
      setNotifications(prev => [newNotification, ...prev]);
      
      return { ok: true };
    } catch (error) {
      console.error('Failed to create notification:', error);
      return { ok: false, error: '通知の作成に失敗しました' };
    }
  }, [settings, userId]);

  // 未読数を取得
  const unreadCount = notifications.filter(n => !n.readAt).length;

  // 初期化
  useEffect(() => {
    if (userId) {
      initializeMockNotifications(userId);
      fetchNotifications();
      fetchSettings();
    }
  }, [userId, fetchNotifications, fetchSettings]);

  return {
    notifications,
    settings,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    updateSettings,
    createNotification
  };
}