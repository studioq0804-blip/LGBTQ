// 決済・課金システムの型定義
// Stripe決済とメッセージクレジット管理

export interface UserBalance {
  userId: string;
  messageCredits: number;
  lowBalanceThreshold: number;
  autoTopup: boolean;
  lastUpdated: string;
}

export interface Charge {
  id: string;
  userId: string;
  provider: 'stripe';
  amount: number; // 円
  creditsAdded: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Receipt {
  id: string;
  chargeId: string;
  pdfUrl: string;
  issuedAt: string;
}

export interface BillingSettings {
  userId: string;
  lowBalanceThreshold: number;
  autoTopup: boolean;
  emailNotifications: boolean;
}

export interface CheckoutSession {
  url: string;
  sessionId: string;
}

export interface PurchaseItem {
  id: 'message_package_50';
  name: string;
  description: string;
  price: number; // 円
  credits: number;
}

// 定数をlib/constantsから取得
import { PRICING } from '../lib/constants';

export const PURCHASE_ITEMS: Record<string, PurchaseItem> = {
  message_package_50: {
    id: 'message_package_50',
    name: 'メッセージパッケージ',
    description: `${PRICING.PACKAGE_CREDITS}通分のメッセージクレジット`,
    price: PRICING.PACKAGE_PRICE,
    credits: PRICING.PACKAGE_CREDITS
  }
};

export const MESSAGE_COST = PRICING.MESSAGE_COST; // 1通あたりの料金（円）