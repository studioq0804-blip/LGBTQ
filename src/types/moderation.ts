// 通報・ブロック・モデレーション機能の型定義
// LGBTQ+コミュニティの安全性を最優先に設計

export type ReportCategory = 
  | 'harassment_threat'      // 嫌がらせ・脅迫
  | 'discrimination'         // 差別的発言
  | 'spam'                  // スパム
  | 'impersonation'         // なりすまし
  | 'inappropriate_content' // わいせつ・不適切な内容
  | 'commercial_solicitation' // 商用・勧誘
  | 'age_violation'         // 年齢違反
  | 'self_harm_risk';       // 自傷・他害リスク

export type ReportStatus = 'received' | 'triage' | 'investigating' | 'resolved';

export type CaseSeverity = 'S0' | 'S1' | 'S2' | 'S3';

export type SanctionType = 
  | 'warn'           // 警告
  | 'mute_24h'       // 24時間ミュート
  | 'suspend_7d'     // 7日間停止
  | 'ban_perm'       // 永久BAN
  | 'device_ban';    // デバイスBAN

export interface Report {
  id: string;
  reporterId: string;
  targetUserId: string;
  chatId?: string;
  messageIds: string[];
  categories: ReportCategory[];
  comment: string;
  attachments: string[];
  evidence: {
    messages: any[];
    screenshots: string[];
    profileSnapshot: any;
  };
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  ticketNumber: string;
}

export interface ModerationCase {
  id: string;
  reportIds: string[];
  severity: CaseSeverity;
  assignee?: string;
  state: 'open' | 'investigating' | 'resolved' | 'closed';
  priority: number;
  slaDeadline: string;
  createdAt: string;
  closedAt?: string;
  autoScore: number;
}

export interface Violation {
  id: string;
  caseId: string;
  policy: string;
  summary: string;
  evidenceRefs: string[];
  createdAt: string;
}

export interface Sanction {
  id: string;
  userId: string;
  caseId: string;
  type: SanctionType;
  reason: string;
  startAt: string;
  endAt?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Block {
  id: string;
  blockerId: string;
  blockedId: string;
  reason?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  metadata: Record<string, any>;
  timestamp: string;
}

export interface ReportSubmission {
  targetUserId: string;
  chatId?: string;
  messageIds?: string[];
  categories: ReportCategory[];
  comment: string;
  attachments?: File[];
  shouldBlock: boolean;
}

export interface ModerationStats {
  totalReports: number;
  pendingCases: number;
  resolvedToday: number;
  averageResponseTime: number;
  slaBreaches: number;
}