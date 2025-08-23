// 通知システムの型定義
// 日本向け通知機能：必要な情報は逃さず、不要な通知は抑制

export type NotificationType = 
  | 'match.created'
  | 'message.new'
  | 'message.reminder'
  | 'community.post'
  | 'event.reminder'
  | 'system.announcement';

export type NotificationChannel = 'push' | 'email' | 'inapp';

export type NotificationFrequency = 'immediate' | 'daily' | 'off';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string;
  channels: NotificationChannel[];
  createdAt: string;
  readAt: string | null;
  data?: Record<string, any>; // 追加データ（プロフィール情報など）
}

export interface NotificationSettings {
  userId: string;
  global: boolean;
  types: {
    'match.created': boolean;
    'message.new': boolean;
    'message.reminder': boolean;
    'community.post': boolean;
    'event.reminder': boolean;
    'system.announcement': boolean;
  };
  frequency: NotificationFrequency;
  dnd: {
    start: string; // "22:00"
    end: string;   // "08:00"
  };
  channels: {
    push: boolean;
    email: boolean;
    inapp: boolean;
  };
}

export interface NotificationDigest {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  notifications: Notification[];
  sentAt: string | null;
}