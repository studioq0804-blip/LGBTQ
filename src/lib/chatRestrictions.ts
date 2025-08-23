// チャット制限ルール
// 性的指向に基づくチャット可否判定

import type { Profile } from '../types';

export interface ChatRestrictionResult {
  allowed: boolean;
  reason?: string;
  title?: string;
}

// 性的指向の正規化（表記ゆれを統一）
function normalizeSexualOrientation(orientation: string): string {
  const normalized = orientation.toLowerCase().trim();
  
  if (normalized.includes('レズ') || normalized.includes('lesbian')) {
    return 'lesbian';
  }
  if (normalized.includes('ゲイ') || normalized.includes('gay')) {
    return 'gay';
  }
  if (normalized.includes('バイ') || normalized.includes('bi')) {
    return 'bisexual';
  }
  if (normalized.includes('パン') || normalized.includes('pan')) {
    return 'pansexual';
  }
  if (normalized.includes('トランス') || normalized.includes('trans')) {
    return 'transgender';
  }
  if (normalized.includes('クエスチョニング') || normalized.includes('questioning')) {
    return 'questioning';
  }
  if (normalized.includes('アセク') || normalized.includes('asexual')) {
    return 'asexual';
  }
  
  return 'other';
}

// チャット可否を判定
export function checkChatRestriction(
  currentUserProfile: Profile,
  targetProfile: Profile
): ChatRestrictionResult {
  const currentOrientation = normalizeSexualOrientation(currentUserProfile.sexualOrientation || '');
  const targetOrientation = normalizeSexualOrientation(targetProfile.sexualOrientation || '');
  
  // レズビアンが関わる場合の制限
  if (currentOrientation === 'lesbian' || targetOrientation === 'lesbian') {
    // レズビアン同士の場合のみ許可
    if (currentOrientation === 'lesbian' && targetOrientation === 'lesbian') {
      return { allowed: true };
    }
    
    // レズビアンが関わるがレズビアン同士でない場合は制限
    return {
      allowed: false,
      title: 'チャットは制限されています',
      reason: 'レズビアンの方はレズビアン同士でのみチャットが可能です。これはレズビアンコミュニティの安全で快適な環境を維持するためのルールです。'
    };
  }
  
  // レズビアン以外の性的指向同士は自由にチャット可能
  return { allowed: true };
}

// 制限理由の詳細メッセージ
export function getChatRestrictionMessage(
  currentOrientation: string,
  targetOrientation: string
): string {
  const current = normalizeSexualOrientation(currentOrientation);
  const target = normalizeSexualOrientation(targetOrientation);
  
  if (current === 'lesbian' && target !== 'lesbian') {
    return `レズビアンの方は、レズビアン同士でのみチャットが可能です。${targetOrientation}の方とのチャットは制限されています。`;
  }
  
  if (current !== 'lesbian' && target === 'lesbian') {
    return `レズビアンの方とのチャットは制限されています。レズビアンの方はレズビアン同士でのみチャットが可能なルールとなっています。`;
  }
  
  return 'チャットが制限されています。';
}