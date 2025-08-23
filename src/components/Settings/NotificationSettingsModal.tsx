// 通知設定モーダルコンポーネント
// 通知の種類別設定、頻度、おやすみ時間、チャネル選択を提供

import { useState } from 'react';
import { X, Save, Bell, Clock, Smartphone, Mail, Monitor } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../hooks/useAuth';
import type { NotificationSettings, NotificationType, NotificationFrequency } from '../../types/notification';

interface NotificationSettingsModalProps {
  onClose: () => void;
}

export function NotificationSettingsModal({ onClose }: NotificationSettingsModalProps) {
  const { user } = useAuth();
  const { settings, updateSettings } = useNotifications(user?.id || '');
  const [localSettings, setLocalSettings] = useState<NotificationSettings>(settings);
  const [isLoading, setIsLoading] = useState(false);

  // 通知タイプの設定
  const notificationTypeLabels: Record<NotificationType, { label: string; description: string }> = {
    'match.created': {
      label: 'マッチ通知',
      description: '新しいマッチが成立した時'
    },
    'message.new': {
      label: 'メッセージ通知',
      description: '新しいメッセージを受信した時'
    },
    'message.reminder': {
      label: 'メッセージリマインド',
      description: '未読メッセージがある時（任意）'
    },
    'community.post': {
      label: 'コミュニティ投稿',
      description: '参加グループに新しい投稿がある時'
    },
    'event.reminder': {
      label: 'イベントリマインド',
      description: '参加予定イベントの前日・1時間前'
    },
    'system.announcement': {
      label: 'システム通知',
      description: 'メンテナンス・キャンペーン・新機能のお知らせ'
    }
  };

  const frequencyOptions: { value: NotificationFrequency; label: string; description: string }[] = [
    {
      value: 'immediate',
      label: '即時',
      description: '通知をすぐに受け取る'
    },
    {
      value: 'daily',
      label: '1日1回まとめる',
      description: '21:00頃にダイジェストで受け取る'
    },
    {
      value: 'off',
      label: 'オフ',
      description: '通知を受け取らない'
    }
  ];

  const handleToggleGlobal = (enabled: boolean) => {
    setLocalSettings(prev => ({ ...prev, global: enabled }));
  };

  const handleToggleType = (type: NotificationType, enabled: boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      types: { ...prev.types, [type]: enabled }
    }));
  };

  const handleFrequencyChange = (frequency: NotificationFrequency) => {
    setLocalSettings(prev => ({ ...prev, frequency }));
  };

  const handleDNDChange = (field: 'start' | 'end', value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      dnd: { ...prev.dnd, [field]: value }
    }));
  };

  const handleChannelToggle = (channel: 'push' | 'email' | 'inapp', enabled: boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      channels: { ...prev.channels, [channel]: enabled }
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await updateSettings(localSettings);
      if (result.ok) {
        onClose();
      } else {
        alert(result.error || '設定の保存に失敗しました');
      }
    } catch (error) {
      alert('設定の保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
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
              <h2 className="text-xl font-bold text-gray-900">通知設定</h2>
              <p className="text-sm text-gray-600">通知の受け取り方を設定してください</p>
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

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 space-y-6">
          {/* Global Toggle */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">通知機能</h3>
                <p className="text-sm text-blue-700">すべての通知のオン/オフ</p>
              </div>
              <button
                onClick={() => handleToggleGlobal(!localSettings.global)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  localSettings.global ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localSettings.global ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Notification Types */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">通知の種類</h3>
            <div className="space-y-4">
              {Object.entries(notificationTypeLabels).map(([type, config]) => (
                <div key={type} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{config.label}</h4>
                    <p className="text-sm text-gray-600">{config.description}</p>
                  </div>
                  <button
                    onClick={() => handleToggleType(type as NotificationType, !localSettings.types[type as NotificationType])}
                    disabled={!localSettings.global}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      localSettings.types[type as NotificationType] && localSettings.global
                        ? 'bg-blue-600'
                        : 'bg-gray-200'
                    } ${!localSettings.global ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSettings.types[type as NotificationType] && localSettings.global
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">通知頻度</h3>
            <div className="space-y-2">
              {frequencyOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="frequency"
                    value={option.value}
                    checked={localSettings.frequency === option.value}
                    onChange={() => handleFrequencyChange(option.value)}
                    disabled={!localSettings.global}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Do Not Disturb */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="text-gray-600" size={18} />
              <h3 className="font-semibold text-gray-900">おやすみ時間</h3>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-4">
                この時間帯はプッシュ通知とメール通知を停止し、アプリ内通知のみ保存します
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">開始時刻</label>
                  <input
                    type="time"
                    value={localSettings.dnd.start}
                    onChange={(e) => handleDNDChange('start', e.target.value)}
                    disabled={!localSettings.global}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">終了時刻</label>
                  <input
                    type="time"
                    value={localSettings.dnd.end}
                    onChange={(e) => handleDNDChange('end', e.target.value)}
                    disabled={!localSettings.global}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Channels */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">通知方法</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Smartphone className="text-blue-600" size={20} />
                  <div>
                    <h4 className="font-medium text-gray-900">プッシュ通知</h4>
                    <p className="text-sm text-gray-600">スマートフォンに即座に通知</p>
                  </div>
                </div>
                <button
                  onClick={() => handleChannelToggle('push', !localSettings.channels.push)}
                  disabled={!localSettings.global}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    localSettings.channels.push && localSettings.global
                      ? 'bg-blue-600'
                      : 'bg-gray-200'
                  } ${!localSettings.global ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localSettings.channels.push && localSettings.global
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Mail className="text-green-600" size={20} />
                  <div>
                    <h4 className="font-medium text-gray-900">メール通知</h4>
                    <p className="text-sm text-gray-600">登録メールアドレスに送信</p>
                  </div>
                </div>
                <button
                  onClick={() => handleChannelToggle('email', !localSettings.channels.email)}
                  disabled={!localSettings.global}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    localSettings.channels.email && localSettings.global
                      ? 'bg-blue-600'
                      : 'bg-gray-200'
                  } ${!localSettings.global ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localSettings.channels.email && localSettings.global
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Monitor className="text-purple-600" size={20} />
                  <div>
                    <h4 className="font-medium text-gray-900">アプリ内通知</h4>
                    <p className="text-sm text-gray-600">通知センターに保存</p>
                  </div>
                </div>
                <button
                  onClick={() => handleChannelToggle('inapp', !localSettings.channels.inapp)}
                  disabled={!localSettings.global}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    localSettings.channels.inapp && localSettings.global
                      ? 'bg-blue-600'
                      : 'bg-gray-200'
                  } ${!localSettings.global ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localSettings.channels.inapp && localSettings.global
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors font-medium"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>保存中...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>保存</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}