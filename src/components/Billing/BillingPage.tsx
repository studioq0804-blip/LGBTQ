// 料金管理ページコンポーネント
// 残高表示、購入履歴、設定管理を提供

import { useState } from 'react';
import { 
  CreditCard, 
  History, 
  Settings as SettingsIcon, 
  Plus, 
  AlertTriangle,
  CheckCircle,
  Download,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { useBilling } from '../../hooks/useBilling';
import { useAuth } from '../../hooks/useAuth';
import { PURCHASE_ITEMS, MESSAGE_COST } from '../../types/billing';
import { PurchaseModal } from './PurchaseModal';
import { BillingSettingsModal } from './BillingSettingsModal';

interface BillingPageProps {
  onBack: () => void;
}

export function BillingPage({ onBack }: BillingPageProps) {
  const { user } = useAuth();
  const { 
    balance, 
    charges, 
    settings, 
    isLoading, 
    isLowBalance,
    createCheckoutSession,
    completePurchase,
    updateSettings
  } = useBilling(user?.id || '');
  
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      const result = await createCheckoutSession('message_package_50');
      if (result.ok && result.data) {
        // 実際のアプリでは、Stripe Checkoutページに遷移
        // デモ用: モック決済完了
        console.log('Redirecting to Stripe Checkout:', result.data.url);
        
        // デモ用の自動完了（実際はWebhookで処理）
        setTimeout(async () => {
          await completePurchase(result.data!.sessionId);
          setIsPurchasing(false);
          setShowPurchaseModal(false);
          
          // 成功通知
          alert('購入が完了しました！50通分のメッセージクレジットが追加されました。');
        }, 2000);
      } else {
        alert(result.error || '購入に失敗しました');
        setIsPurchasing(false);
      }
    } catch (error) {
      alert('購入に失敗しました');
      setIsPurchasing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin text-purple-600 mx-auto mb-4" size={32} />
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <button
            onClick={onBack}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            aria-label="戻る"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">料金管理</h1>
            <p className="text-white/90">メッセージクレジットと購入履歴</p>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white/80 text-sm">現在の残高</p>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold">{balance.messageCredits}</span>
                <span className="text-white/80">通</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm">相当金額</p>
              <p className="text-lg font-semibold">
                {formatAmount(balance.messageCredits * MESSAGE_COST)}
              </p>
            </div>
          </div>
          
          {isLowBalance && (
            <div className="flex items-center space-x-2 bg-yellow-500/20 text-yellow-100 px-3 py-2 rounded-lg text-sm">
              <AlertTriangle size={16} />
              <span>残高が少なくなっています</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Purchase */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-gray-900">メッセージパッケージ</h3>
              <p className="text-sm text-gray-600">50通分のメッセージクレジット</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-600">¥1,000</p>
              <p className="text-xs text-gray-500">1通あたり¥20</p>
            </div>
          </div>
          
          {/* Package Benefits */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/60 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600">単価</p>
              <p className="font-bold text-purple-700">¥20/通</p>
            </div>
            <div className="bg-white/60 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600">有効期限</p>
              <p className="font-bold text-purple-700">無期限</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowPurchaseModal(true)}
            disabled={isPurchasing}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-lg mb-2"
          >
            {isPurchasing ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>処理中...</span>
              </>
            ) : (
              <>
                <Plus size={20} />
                <span>購入する</span>
              </>
            )}
          </button>
          
          <p className="text-center text-xs text-gray-500 mt-2">
            安全なStripe決済で即座にクレジット追加
          </p>
        </div>

        {/* Settings */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <SettingsIcon size={20} className="text-gray-600" />
            <span>設定</span>
          </h3>
          
          <button
            onClick={() => setShowSettingsModal(true)}
            className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors shadow-sm"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <SettingsIcon size={18} className="text-blue-600" />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-gray-900">課金設定</h4>
                <p className="text-sm text-gray-600">低残高アラート・自動購入設定</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-500">閾値: {settings.lowBalanceThreshold}通</span>
              <div className="text-xs text-gray-400">
                {settings.autoTopup ? '自動購入: ON' : '自動購入: OFF'}
              </div>
            </div>
          </button>
        </div>

        {/* Purchase History */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <History size={20} className="text-gray-600" />
              <h3 className="text-lg font-bold text-gray-900">購入履歴</h3>
            </div>
            {charges.length > 0 && (
              <span className="text-sm text-gray-500">{charges.length}件</span>
            )}
          </div>
          
          {charges.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="mx-auto text-gray-300 mb-4" size={48} />
              <h4 className="text-lg font-semibold text-gray-600 mb-2">購入履歴がありません</h4>
              <p className="text-gray-500 mb-4">メッセージパッケージを購入すると履歴が表示されます</p>
              <button
                onClick={() => setShowPurchaseModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                今すぐ購入
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {charges.map((charge) => (
                <div key={charge.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        charge.status === 'completed' ? 'bg-green-500' :
                        charge.status === 'pending' ? 'bg-yellow-500' :
                        charge.status === 'failed' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`} />
                      <span className="font-medium text-gray-900">
                        メッセージパッケージ
                      </span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {formatAmount(charge.amount)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{formatDate(charge.createdAt)}</span>
                    <div className="flex items-center space-x-4">
                      <span>+{charge.creditsAdded}通</span>
                      {charge.status === 'completed' && (
                        <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700">
                          <Download size={14} />
                          <span>領収書</span>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      charge.status === 'completed' ? 'bg-green-100 text-green-700' :
                      charge.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      charge.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {charge.status === 'completed' && <CheckCircle size={12} />}
                      {charge.status === 'pending' && <Loader2 size={12} className="animate-spin" />}
                      <span>
                        {charge.status === 'completed' ? '完了' :
                         charge.status === 'pending' ? '処理中' :
                         charge.status === 'failed' ? '失敗' :
                         '不明'}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onPurchase={handlePurchase}
        isLoading={isPurchasing}
        currentBalance={balance.messageCredits}
      />

      {/* Settings Modal */}
      <BillingSettingsModal
        isOpen={showSettingsModal}
        settings={settings}
        onClose={() => setShowSettingsModal(false)}
        onUpdate={updateSettings}
      />
    </div>
  );
}