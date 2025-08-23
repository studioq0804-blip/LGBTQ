// 低残高アラートコンポーネント
// 残高不足時の警告表示と購入導線を提供

import { AlertTriangle, CreditCard, X } from 'lucide-react';
import { PRICING } from '../../lib/constants';

interface LowBalanceAlertProps {
  currentBalance: number;
  threshold: number;
  onPurchase: () => void;
  onDismiss: () => void;
  className?: string;
}

export function LowBalanceAlert({ 
  currentBalance, 
  threshold, 
  onPurchase, 
  onDismiss,
  className = ''
}: LowBalanceAlertProps) {
  const isZeroBalance = currentBalance === 0;
  const messagesLeft = Math.floor(currentBalance);

  return (
    <div className={`bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <AlertTriangle className="text-yellow-600" size={20} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-yellow-800 mb-1">
            {isZeroBalance ? '残高が不足しています' : '残高が少なくなっています'}
          </h4>
          
          <p className="text-yellow-700 text-sm mb-3">
            {isZeroBalance ? (
              'メッセージを送信するには残高が必要です。'
            ) : (
              `残り${messagesLeft}通のメッセージが送信できます。`
            )}
            {PRICING.PACKAGE_PRICE}円で{PRICING.PACKAGE_CREDITS}通分のパッケージを購入できます。
          </p>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onPurchase}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 text-sm"
            >
              <CreditCard size={16} />
              <span>今すぐ購入</span>
            </button>
            
            {!isZeroBalance && (
              <button
                onClick={onDismiss}
                className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
              >
                後で
              </button>
            )}
          </div>
        </div>
        
        {!isZeroBalance && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-yellow-600 hover:text-yellow-700 transition-colors"
            aria-label="閉じる"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}