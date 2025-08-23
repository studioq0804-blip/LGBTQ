// モデレーション機能管理フック
// 通報、ブロック、制裁の統合管理

import { useState, useEffect, useCallback } from 'react';
import type { 
  Report, 
  Block, 
  ReportSubmission, 
  ModerationCase,
  Sanction,
  ModerationStats 
} from '../types/moderation';

const MOCK_DELAY = 1000;

export function useModeration(userId: string) {
  const [reports, setReports] = useState<Report[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [sanctions, setSanctions] = useState<Sanction[]>([]);
  const [stats, setStats] = useState<ModerationStats>({
    totalReports: 0,
    pendingCases: 0,
    resolvedToday: 0,
    averageResponseTime: 24,
    slaBreaches: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // データを取得
  const fetchModerationData = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
      
      // ユーザーの通報履歴を取得
      const reportsKey = `moderation-reports-${userId}`;
      const storedReports = localStorage.getItem(reportsKey);
      const userReports = storedReports ? JSON.parse(storedReports) : [];
      setReports(userReports);
      
      // ブロック一覧を取得
      const blocksKey = `moderation-blocks-${userId}`;
      const storedBlocks = localStorage.getItem(blocksKey);
      const userBlocks = storedBlocks ? JSON.parse(storedBlocks) : [];
      setBlocks(userBlocks);
      
      // 制裁情報を取得
      const sanctionsKey = `moderation-sanctions-${userId}`;
      const storedSanctions = localStorage.getItem(sanctionsKey);
      const userSanctions = storedSanctions ? JSON.parse(storedSanctions) : [];
      setSanctions(userSanctions);
      
    } catch (error) {
      console.error('Failed to fetch moderation data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // 通報を送信
  const submitReport = useCallback(async (submission: ReportSubmission): Promise<{ ok: boolean; ticketNumber?: string; error?: string }> => {
    try {
      await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
      
      // チケット番号を生成
      const ticketNumber = `RM${Date.now().toString().slice(-8)}`;
      
      // 証拠データを収集（モック）
      const evidence = {
        messages: submission.messageIds?.map(id => ({
          id,
          text: 'サンプルメッセージ内容',
          timestamp: new Date().toISOString()
        })) || [],
        screenshots: submission.attachments?.map(file => file.name) || [],
        profileSnapshot: {
          displayName: 'ターゲットユーザー',
          capturedAt: new Date().toISOString()
        }
      };
      
      // 自動スコアリング（モック）
      const autoScore = submission.categories.some(cat => 
        ['harassment_threat', 'discrimination', 'self_harm_risk'].includes(cat)
      ) ? 85 : 45;
      
      const newReport: Report = {
        id: `report-${Date.now()}`,
        reporterId: userId,
        targetUserId: submission.targetUserId,
        chatId: submission.chatId,
        messageIds: submission.messageIds || [],
        categories: submission.categories,
        comment: submission.comment,
        attachments: submission.attachments?.map(file => file.name) || [],
        evidence,
        status: 'received',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ticketNumber
      };
      
      // ローカルストレージに保存
      const reportsKey = `moderation-reports-${userId}`;
      const existingReports = localStorage.getItem(reportsKey);
      const allReports = existingReports ? JSON.parse(existingReports) : [];
      const updatedReports = [newReport, ...allReports];
      localStorage.setItem(reportsKey, JSON.stringify(updatedReports));
      
      setReports(updatedReports);
      
      // 同時ブロック処理
      if (submission.shouldBlock) {
        await blockUser(submission.targetUserId, '通報と同時にブロック');
      }
      
      // モデレーションケースを作成（管理者用）
      const severity = autoScore >= 80 ? 'S0' : autoScore >= 60 ? 'S1' : autoScore >= 40 ? 'S2' : 'S3';
      const slaHours = severity === 'S0' ? 1 : severity === 'S1' ? 24 : severity === 'S2' ? 48 : 72;
      
      const moderationCase: ModerationCase = {
        id: `case-${Date.now()}`,
        reportIds: [newReport.id],
        severity,
        state: 'open',
        priority: autoScore,
        slaDeadline: new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        autoScore
      };
      
      // 管理者用データも保存（実際のアプリでは別のエンドポイント）
      const casesKey = 'moderation-cases';
      const existingCases = localStorage.getItem(casesKey);
      const allCases = existingCases ? JSON.parse(existingCases) : [];
      localStorage.setItem(casesKey, JSON.stringify([moderationCase, ...allCases]));
      
      return { ok: true, ticketNumber };
    } catch (error) {
      return { ok: false, error: '通報の送信に失敗しました' };
    }
  }, [userId]);

  // ユーザーをブロック
  const blockUser = useCallback(async (targetUserId: string, reason?: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
      
      const newBlock: Block = {
        id: `block-${Date.now()}`,
        blockerId: userId,
        blockedId: targetUserId,
        reason,
        createdAt: new Date().toISOString()
      };
      
      const blocksKey = `moderation-blocks-${userId}`;
      const existingBlocks = localStorage.getItem(blocksKey);
      const allBlocks = existingBlocks ? JSON.parse(existingBlocks) : [];
      const updatedBlocks = [newBlock, ...allBlocks];
      localStorage.setItem(blocksKey, JSON.stringify(updatedBlocks));
      
      setBlocks(updatedBlocks);
      
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'ブロックに失敗しました' };
    }
  }, [userId]);

  // ブロックを解除
  const unblockUser = useCallback(async (targetUserId: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
      
      const blocksKey = `moderation-blocks-${userId}`;
      const existingBlocks = localStorage.getItem(blocksKey);
      const allBlocks = existingBlocks ? JSON.parse(existingBlocks) : [];
      const updatedBlocks = allBlocks.filter((block: Block) => block.blockedId !== targetUserId);
      localStorage.setItem(blocksKey, JSON.stringify(updatedBlocks));
      
      setBlocks(updatedBlocks);
      
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'ブロック解除に失敗しました' };
    }
  }, [userId]);

  // ユーザーがブロックされているかチェック
  const isUserBlocked = useCallback((targetUserId: string): boolean => {
    return blocks.some(block => block.blockedId === targetUserId);
  }, [blocks]);

  // アクティブな制裁があるかチェック
  const hasActiveSanction = useCallback((): boolean => {
    const now = new Date();
    return sanctions.some(sanction => 
      sanction.isActive && 
      (!sanction.endAt || new Date(sanction.endAt) > now)
    );
  }, [sanctions]);

  // 通報ステータスを取得
  const getReportStatus = useCallback((reportId: string): Report | undefined => {
    return reports.find(report => report.id === reportId);
  }, [reports]);

  // 初期化
  useEffect(() => {
    if (userId) {
      fetchModerationData();
    }
  }, [userId, fetchModerationData]);

  return {
    reports,
    blocks,
    sanctions,
    stats,
    isLoading,
    submitReport,
    blockUser,
    unblockUser,
    isUserBlocked,
    hasActiveSanction,
    getReportStatus,
    fetchModerationData
  };
}