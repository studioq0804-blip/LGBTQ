// 決済・課金管理フック
// 残高管理、購入履歴、Stripe決済の統合管理

import { useState, useEffect, useCallback } from 'react';
import type { UserBalance, Charge, BillingSettings, CheckoutSession } from '../types/billing';
import { PRICING } from '../lib/constants';

const MOCK_DELAY = 1000;

// デフォルト設定
const DEFAULT_BALANCE: UserBalance = {
  userId: '',
  messageCredits: 50, // 初回50通分を付与（デモ用）
  lowBalanceThreshold: PRICING.LOW_BALANCE_THRESHOLD,
  autoTopup: false,
  lastUpdated: new Date().toISOString()
};

const DEFAULT_SETTINGS: BillingSettings = {
  userId: '',
  lowBalanceThreshold: PRICING.LOW_BALANCE_THRESHOLD,
  autoTopup: false,
  emailNotifications: true
};

export function useBilling(userId: string) {
  const [balance, setBalance] = useState<UserBalance>(DEFAULT_BALANCE);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [settings, setSettings] = useState<BillingSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize with user ID
  useEffect(() => {
    if (userId) {
      setBalance(prev => ({ ...prev, userId }));
      setSettings(prev => ({ ...prev, userId }));
    }
  }, [userId]);

  // 残高とデータを取得
  const fetchBillingData = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
      
      // 残高取得
      const balanceKey = `billing-balance-${userId}`;
      const storedBalance = localStorage.getItem(balanceKey);
      const userBalance = storedBalance ? JSON.parse(storedBalance) : { ...DEFAULT_BALANCE, userId };
      setBalance(userBalance);
      
      // 購入履歴取得
      const chargesKey = `billing-charges-${userId}`;
      const storedCharges = localStorage.getItem(chargesKey);
      const userCharges = storedCharges ? JSON.parse(storedCharges) : [];
      setCharges(userCharges);
      
      // 設定取得
      const settingsKey = `billing-settings-${userId}`;
      const storedSettings = localStorage.getItem(settingsKey);
      const userSettings = storedSettings ? JSON.parse(storedSettings) : { ...DEFAULT_SETTINGS, userId };
      setSettings(userSettings);
      
    } catch (error) {
      console.error('Failed to fetch billing data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Stripe Checkout セッション作成
  const createCheckoutSession = useCallback(async (itemId: string): Promise<{ ok: boolean; data?: CheckoutSession; error?: string }> => {
    try {
      await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
      
      if (itemId !== 'message_package_50') {
        return { ok: false, error: '無効な商品です' };
      }
      
      // モック用のStripe Checkout URL
      const sessionId = `cs_mock_${Date.now()}`;
      const mockCheckoutUrl = `https://checkout.stripe.com/pay/${sessionId}`;
      
      // デモ用: 実際のStripe URLの代わりにモック決済ページを表示
      console.log(`Mock Stripe Checkout URL: ${mockCheckoutUrl}`);
      
      return {
        ok: true,
        data: {
          url: mockCheckoutUrl,
          sessionId
        }
      };
    } catch (error) {
      return { ok: false, error: 'チェックアウトセッションの作成に失敗しました' };
    }
  }, []);

  // 残高消費（メッセージ送信時）
  const consumeCredit = useCallback(async (amount: number = 1): Promise<{ ok: boolean; error?: string }> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      if (balance.messageCredits < amount) {
        return { ok: false, error: '残高が不足しています' };
      }
      
      const updatedBalance = {
        ...balance,
        messageCredits: balance.messageCredits - amount,
        lastUpdated: new Date().toISOString()
      };
      
      const balanceKey = `billing-balance-${userId}`;
      localStorage.setItem(balanceKey, JSON.stringify(updatedBalance));
      setBalance(updatedBalance);
      
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'クレジット消費に失敗しました' };
    }
  }, [balance, userId]);

  // 購入完了処理（Webhook模擬）
  const completePurchase = useCallback(async (sessionId: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
      
      // 新しい購入記録を作成
      const newCharge: Charge = {
        id: `charge-${Date.now()}`,
        userId,
        provider: 'stripe',
        amount: PRICING.PACKAGE_PRICE,
        creditsAdded: PRICING.PACKAGE_CREDITS,
        status: 'completed',
        stripeSessionId: sessionId,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      };
      
      // 残高を更新
      const updatedBalance = {
        ...balance,
        messageCredits: balance.messageCredits + PRICING.PACKAGE_CREDITS,
        lastUpdated: new Date().toISOString()
      };
      
      // ローカルストレージに保存
      const balanceKey = `billing-balance-${userId}`;
      const chargesKey = `billing-charges-${userId}`;
      
      localStorage.setItem(balanceKey, JSON.stringify(updatedBalance));
      
      const existingCharges = localStorage.getItem(chargesKey);
      const allCharges = existingCharges ? JSON.parse(existingCharges) : [];
      const updatedCharges = [newCharge, ...allCharges];
      localStorage.setItem(chargesKey, JSON.stringify(updatedCharges));
      
      // 状態を更新
      setBalance(updatedBalance);
      setCharges(updatedCharges);
      
      return { ok: true };
    } catch (error) {
      return { ok: false, error: '購入処理に失敗しました' };
    }
  }, [balance, userId]);

  // 設定更新
  const updateSettings = useCallback(async (newSettings: Partial<BillingSettings>): Promise<{ ok: boolean; error?: string }> => {
    try {
      await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
      
      const updatedSettings = { ...settings, ...newSettings };
      const settingsKey = `billing-settings-${userId}`;
      localStorage.setItem(settingsKey, JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
      
      return { ok: true };
    } catch (error) {
      return { ok: false, error: '設定の更新に失敗しました' };
    }
  }, [settings, userId]);

  // 残高を直接減らす（デモ用）
  const deductCredits = useCallback(async (amount: number): Promise<void> => {
    const updatedBalance = {
      ...balance,
      messageCredits: Math.max(0, balance.messageCredits - amount),
      lastUpdated: new Date().toISOString()
    };
    const balanceKey = `billing-balance-${userId}`;
    localStorage.setItem(balanceKey, JSON.stringify(updatedBalance));
    setBalance(updatedBalance);
  }, [balance, userId]);

  // 低残高チェック
  const isLowBalance = balance.messageCredits <= balance.lowBalanceThreshold;

  // 初期化
  useEffect(() => {
    if (userId) {
      fetchBillingData();
    }
  }, [userId, fetchBillingData]);

  return {
    balance,
    charges,
    settings,
    isLoading,
    isLowBalance,
    createCheckoutSession,
    consumeCredit,
    completePurchase,
    updateSettings,
    fetchBillingData,
    deductCredits
  };
}