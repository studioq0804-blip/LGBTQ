// ブロック確認モーダルコンポーネント
// ユーザーが安全にブロック機能を使用できるUI

import { useState } from 'react';
import { X, Shield, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

interface BlockConfirmModalProps {
  targetUser: Profile;
  onClose: () => void;
  onConfirm: () => Promise<{ ok: boolean; error?: string }>;
}

export function BlockConfirmModal({ 
  targetUser,
  onClose, 
  onConfirm 
}: BlockConfirmModalProps) {
  const { t } = useLanguage();
  const [isBlocking, setIsBlocking] = useState(false);

  const handleConfirm = async () => {
    setIsBlocking(true);
    try {
      const result = await onConfirm();
      if (result.ok) {
        onClose();
      } else {
        alert(result.error || 'ブロックに失敗しました');
      }
    } catch (error) {
      alert('ブロックに失敗しました');
    } finally {
      setIsBlocking(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Shield className="text-orange-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">ユーザーをブロック</h2>
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
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            <strong>{targetUser.displayName}さん</strong>をブロックしますか？
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="text-yellow-600 mt-0.5" size={16} />
              <div>
                <p className="text-yellow-800 text-sm font-medium mb-1">ブロックすると</p>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>• このユーザーからのメッセージを受信しなくなります</li>
                  <li>• お互いのプロフィールが表示されなくなります</li>
                  <li>• 既存のチャットが非表示になります</li>
                  <li>• マッチング候補から除外されます</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Shield className="text-blue-600 mt-0.5" size={16} />
              <div>
                <p className="text-blue-800 text-sm font-medium mb-1">プライバシーについて</p>
                <p className="text-blue-700 text-sm">
                  ブロックしたことは相手に通知されません。設定からいつでも解除できます。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isBlocking}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleConfirm}
            disabled={isBlocking}
            className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
          >
            {isBlocking ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>ブロック中...</span>
              </>
            ) : (
              <>
                <Shield size={16} />
                <span>ブロックする</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}