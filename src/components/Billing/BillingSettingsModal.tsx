// 課金設定モーダルコンポーネント
// 低残高アラート、自動購入、メール通知の設定を提供

import { useState } from 'react';
import { X, Save, AlertTriangle, Zap, Mail } from 'lucide-react';
import type { BillingSettings } from '../../types/billing';

interface BillingSettingsModalProps {
  isOpen: boolean;
  settings: any;
  onClose: () => void;
  onUpdate: (settings: any) => Promise<{ ok: boolean; error?: string }>;
}

export function BillingSettingsModal({ 
  isOpen,
  settings,
  onClose,
  onUpdate
}: BillingSettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<BillingSettings>({
    userId: settings?.userId || 'current-user',
    lowBalanceThreshold: settings?.lowBalanceThreshold || 10,
    autoTopup: settings?.autoTopup || false,
    emailNotifications: settings?.emailNotifications || true
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await onUpdate(localSettings);
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

  const handleInputChange = (field: keyof BillingSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">課金設定</h2>
              <p className="text-sm text-gray-600">残高管理と通知設定</p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Low Balance Threshold */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="text-orange-600" size={18} />
              <h3 className="font-semibold text-gray-900">低残高アラート</h3>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <p className="text-orange-800 text-sm mb-4">
                残高がこの数値以下になったときにアラートを表示します
              </p>
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-700">
                  アラート閾値
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={localSettings.lowBalanceThreshold}
                  onChange={(e) => handleInputChange('lowBalanceThreshold', parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center"
                />
                <span className="text-sm text-gray-600">通以下</span>
              </div>
            </div>
          </div>

          {/* Auto Top-up */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="text-purple-600" size={18} />
              <h3 className="font-semibold text-gray-900">自動購入（今後対応予定）</h3>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">自動購入を有効にする</h4>
                  <p className="text-sm text-gray-600">
                    残高が閾値を下回ったときに自動でパッケージを購入
                  </p>
                </div>
                <button
                  onClick={() => handleInputChange('autoTopup', !localSettings.autoTopup)}
                  disabled={true} // MVP版では無効
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 opacity-50 cursor-not-allowed bg-gray-200`}
                >
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                </button>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-xs">
                  <strong>注意:</strong> この機能は今後のアップデートで対応予定です。
                  現在は手動での購入のみ対応しています。
                </p>
              </div>
            </div>
          </div>

          {/* Email Notifications */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Mail className="text-green-600" size={18} />
              <h3 className="font-semibold text-gray-900">メール通知</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h4 className="font-medium text-gray-900">購入完了通知</h4>
                  <p className="text-sm text-gray-600">
                    購入が完了したときにメールで通知
                  </p>
                </div>
                <button
                  onClick={() => handleInputChange('emailNotifications', !localSettings.emailNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                    localSettings.emailNotifications ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h4 className="font-medium text-gray-900">低残高リマインド</h4>
                  <p className="text-sm text-gray-600">
                    残高が少なくなったときにメールで通知
                  </p>
                </div>
                <button
                  onClick={() => handleInputChange('emailNotifications', !localSettings.emailNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                    localSettings.emailNotifications ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-2">特定商取引法に基づく表記</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>販売業者:</strong> Rainbow Match株式会社</p>
              <p><strong>所在地:</strong> 東京都渋谷区...</p>
              <p><strong>返金方針:</strong> デジタルコンテンツのため原則返金不可</p>
              <p><strong>お問い合わせ:</strong> support@rainbowmatch.jp</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isLoading}
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