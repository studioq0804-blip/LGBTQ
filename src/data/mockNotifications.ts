// モック通知データ
// デモ用の通知データとヘルパー関数を提供

import type { Notification } from '../types/notification';

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-current',
    type: 'match.created',
    title: 'あきらさんとマッチしました',
    body: 'あきらさんとマッチしました。ご挨拶してみませんか？',
    link: '/chat/chat-1',
    channels: ['push', 'inapp'],
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30分前
    readAt: null
  },
  {
    id: 'notif-2',
    userId: 'user-current',
    type: 'message.new',
    title: 'さくらさんから新しいメッセージ',
    body: 'こんにちは！素敵なプロフィールですね✨',
    link: '/chat/chat-2',
    channels: ['push', 'inapp'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2時間前
    readAt: null
  },
  {
    id: 'notif-3',
    userId: 'user-current',
    type: 'community.post',
    title: '『LGBTQ+アート』に新しい投稿があります',
    body: '新しい作品を完成させました！LGBTQコミュニティの多様性を表現した絵画です。🎨🌈',
    link: '/community/community-1',
    channels: ['inapp'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6時間前
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() // 4時間前に既読
  },
  {
    id: 'notif-4',
    userId: 'user-current',
    type: 'system.announcement',
    title: 'メンテナンスのお知らせ',
    body: '明日午前2:00-4:00にシステムメンテナンスを実施いたします。ご不便をおかけして申し訳ございません。',
    link: '/announcement/maint-001',
    channels: ['push', 'email', 'inapp'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12時間前
    readAt: null
  },
  {
    id: 'notif-5',
    userId: 'user-current',
    type: 'event.reminder',
    title: '明日19時からイベント『プライドパレード準備会』が開始します',
    body: 'プライドパレード2024の準備会議が明日開催されます。参加予定の方はお忘れなく！',
    link: '/events/pride-prep-2024',
    channels: ['push', 'inapp'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // 18時間前
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString() // 16時間前に既読
  }
];

// 初期通知データをローカルストレージに設定
export function initializeMockNotifications(userId: string) {
  const key = `notifications-${userId}`;
  const existing = localStorage.getItem(key);
  
  if (!existing) {
    const userNotifications = mockNotifications.map(notif => ({
      ...notif,
      userId
    }));
    localStorage.setItem(key, JSON.stringify(userNotifications));
  }
}

// 通知メッセージのテンプレート
export const notificationTemplates = {
  'match.created': (displayName: string) => ({
    title: `${displayName}さんとマッチしました`,
    body: `${displayName}さんとマッチしました。ご挨拶してみませんか？`
  }),
  'message.new': (senderName: string, messagePreview: string) => ({
    title: `${senderName}さんから新しいメッセージ`,
    body: messagePreview.length > 50 ? `${messagePreview.substring(0, 50)}...` : messagePreview
  }),
  'message.reminder': (senderName: string, count: number) => ({
    title: '未読メッセージがあります',
    body: `${senderName}さんからの${count}件のメッセージが未読です`
  }),
  'community.post': (communityName: string, postPreview: string) => ({
    title: `『${communityName}』に新しい投稿があります`,
    body: postPreview.length > 50 ? `${postPreview.substring(0, 50)}...` : postPreview
  }),
  'event.reminder': (eventName: string, timeUntil: string) => ({
    title: `${timeUntil}からイベント『${eventName}』が開始します`,
    body: `イベントの開始時刻が近づいています。参加予定の方はお忘れなく！`
  }),
  'system.announcement': (title: string, body: string) => ({
    title,
    body
  })
};