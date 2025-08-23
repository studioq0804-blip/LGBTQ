// 購入確認モーダルコンポーネント
// Stripe決済への導線と購入詳細を表示

import { useState } from 'react';
import { X, CreditCard, Shield, CheckCircle } from 'lucide-react';
import { PRICING } from '../../lib/constants';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: () => Promise<void>;
  isLoading?: boolean;
  currentBalance: number;
}

export function PurchaseModal({ 
  isOpen,
  onClose, 
  onPurchase,
  isLoading = false,
  currentBalance
}: PurchaseModalProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      await onPurchase();
    } finally {
      setIsPurchasing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CreditCard className="text-green-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">メッセージクレジット購入</h2>
              <p className="text-sm text-gray-600">安全なStripe決済</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPurchasing || isLoading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="閉じる"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Package Details */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-4 mb-6">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">メッセージパッケージ</h3>
              <div className="text-3xl font-bold text-purple-600 mb-2">¥{PRICING.PACKAGE_PRICE.toLocaleString()}</div>
              <p className="text-gray-600 mb-4">{PRICING.PACKAGE_CREDITS}通分のメッセージクレジット</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white/50 rounded-lg p-3">
                  <p className="text-gray-600">単価</p>
                  <p className="font-semibold">¥{PRICING.MESSAGE_COST}/通</p>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <p className="text-gray-600">有効期限</p>
                  <p className="font-semibold">無期限</p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Balance */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">現在の残高</p>
                <p className="text-lg font-bold text-gray-900">{currentBalance}通</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600 text-sm">購入後の残高</p>
                <p className="text-lg font-bold text-green-600">
                  {currentBalance + PRICING.PACKAGE_CREDITS}通
                </p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Shield className="text-blue-600 mt-0.5" size={16} />
              <div>
                <p className="text-blue-800 text-sm font-medium mb-1">安全な決済</p>
                <ul className="text-blue-700 text-xs space-y-1">
                  <li>• Stripe社の安全な決済システムを使用</li>
                  <li>• クレジットカード情報は当社で保存されません</li>
                  <li>• SSL暗号化により情報を保護</li>
                  <li>• 購入後すぐにクレジットが反映されます</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Purchase Button */}
          <button
            onClick={handlePurchase}
            disabled={isPurchasing || isLoading}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
          >
            {isPurchasing || isLoading ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Stripeに接続中...</span>
              </>
            ) : (
              <>
                <CreditCard size={20} />
                <span>Stripeで購入する</span>
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-500 mt-3">
            購入ボタンをクリックするとStripeの安全な決済ページに移動します
          </p>
        </div>
      </div>
    </div>
  );
}