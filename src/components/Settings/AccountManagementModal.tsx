// アカウント管理モーダル
// アカウント削除とデータエクスポート機能を提供

import { useState } from 'react';
import { 
  X, 
  Trash2, 
  Download, 
  AlertTriangle, 
  Shield, 
  Clock,
  CheckCircle,
  Loader2,
  FileText,
  Archive
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AccountManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}
type AccountStatus = 'active' | 'pending_delete' | 'deleted';
type ExportStatus = 'idle' | 'processing' | 'ready' | 'expired';

export function AccountManagementModal({ onClose }: AccountManagementModalProps) {
  const { user, logout } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [accountStatus, setAccountStatus] = useState<AccountStatus>('active');
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const [exportProgress, setExportProgress] = useState(0);
  const [deleteScheduledDate, setDeleteScheduledDate] = useState<string | null>(null);

  // アカウント削除の予約
  const handleDeleteRequest = async () => {
    setIsDeleting(true);
    try {
      // モック処理
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + 30);
      
      setAccountStatus('pending_delete');
      setDeleteScheduledDate(scheduledDate.toISOString());
      setShowDeleteConfirm(false);
      
      // 実際のアプリでは、ここでAPIを呼び出し
      console.log('Account deletion scheduled for:', scheduledDate);
      
      alert('アカウント削除を予約しました。30日後に完全削除されます。');
    } catch (error) {
      alert('削除予約に失敗しました');
    } finally {
      setIsDeleting(false);
    }
  };

  // アカウント削除のキャンセル
  const handleCancelDelete = async () => {
    setIsDeleting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAccountStatus('active');
      setDeleteScheduledDate(null);
      
      alert('アカウント削除をキャンセルしました');
    } catch (error) {
      alert('キャンセルに失敗しました');
    } finally {
      setIsDeleting(false);
    }
  };

  // データエクスポート申請
  const handleExportRequest = async () => {
    setIsExporting(true);
    setExportStatus('processing');
    setExportProgress(0);
    
    try {
      // モック処理（進捗表示）
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setExportStatus('ready');
            setIsExporting(false);
            return 100;
          }
          return prev + 10;
        });
      }, 300);
      
      // 実際のアプリでは、ここでAPIを呼び出し
      console.log('Data export requested for user:', user?.id);
      
    } catch (error) {
      setExportStatus('idle');
      setIsExporting(false);
      alert('エクスポート申請に失敗しました');
    }
  };

  // データダウンロード（モック）
  const handleDownloadData = () => {
    // 実際のアプリでは、生成されたZIPファイルをダウンロード
    const mockData = {
      profile: {
        email: user?.email,
        displayName: 'テストユーザー',
        createdAt: user?.createdAt
      },
      messages: [],
      communities: [],
      billing: []
    };
    
    const blob = new Blob([JSON.stringify(mockData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rainbow-match-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('データをダウンロードしました');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="text-red-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">アカウント管理</h2>
              <p className="text-sm text-gray-600">データ管理とアカウント設定</p>
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
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 space-y-6">
          {/* Account Status */}
          {accountStatus === 'pending_delete' && deleteScheduledDate && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="text-red-600 mt-0.5" size={16} />
                <div>
                  <p className="text-red-800 text-sm font-medium mb-1">削除予約済み</p>
                  <p className="text-red-700 text-xs">
                    {new Date(deleteScheduledDate).toLocaleDateString('ja-JP')}に完全削除されます。
                    それまでキャンセル可能です。
                  </p>
                  <button
                    onClick={handleCancelDelete}
                    disabled={isDeleting}
                    className="mt-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-xs font-medium py-1 px-3 rounded transition-colors"
                  >
                    {isDeleting ? '処理中...' : '削除をキャンセル'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Data Export */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Download className="text-blue-600" size={18} />
              <h3 className="font-semibold text-gray-900">データエクスポート</h3>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-blue-800 text-sm mb-3">
                ご自身のデータをダウンロードできます。以下の情報が含まれます：
              </p>
              <ul className="text-blue-700 text-xs space-y-1">
                <li>• プロフィール情報（表示名、設定など）</li>
                <li>• メッセージ履歴</li>
                <li>• コミュニティ投稿</li>
                <li>• 決済履歴（購入日・金額・残高推移）</li>
              </ul>
            </div>

            {exportStatus === 'idle' && (
              <button
                onClick={() => setShowExportModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <Archive size={20} />
                <span>データエクスポートを申請</span>
              </button>
            )}

            {exportStatus === 'processing' && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Loader2 className="animate-spin text-blue-600" size={20} />
                  <span className="font-medium text-gray-900">データを生成中...</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">{exportProgress}% 完了</p>
              </div>
            )}

            {exportStatus === 'ready' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="font-medium text-green-800">データの準備が完了しました</span>
                </div>
                <p className="text-green-700 text-sm mb-3">
                  ダウンロードリンクの有効期限は7日間です。
                </p>
                <button
                  onClick={handleDownloadData}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Download size={16} />
                  <span>データをダウンロード</span>
                </button>
              </div>
            )}
          </div>

          {/* Account Deletion */}
          {accountStatus === 'active' && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Trash2 className="text-red-600" size={18} />
                <h3 className="font-semibold text-gray-900">アカウント削除</h3>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="text-red-600 mt-0.5" size={16} />
                  <div>
                    <p className="text-red-800 text-sm font-medium mb-1">重要な注意事項</p>
                    <ul className="text-red-700 text-xs space-y-1">
                      <li>• 削除すると30日間は復元可能です</li>
                      <li>• 30日後は完全に削除され、復元できません</li>
                      <li>• 課金履歴は法令に基づき保持されます</li>
                      <li>• マッチやメッセージは即座に非表示になります</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <Trash2 size={20} />
                <span>アカウントを削除</span>
              </button>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="text-red-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">本当に削除しますか？</h3>
                <p className="text-gray-600 leading-relaxed">
                  削除すると30日間は復元可能ですが、それ以降は完全に削除されます。
                  課金履歴や監査ログは法令に基づき保持されます。
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleDeleteRequest}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>削除中...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      <span>削除を予約する</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Export Confirmation Modal */}
        {showExportModal && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="text-blue-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">データエクスポート</h3>
                <p className="text-gray-600 leading-relaxed">
                  ご自身のデータをダウンロードできます。処理には数分かかる場合があります。
                  完了時にアプリ内通知とメールでお知らせします。
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Clock className="text-yellow-600 mt-0.5" size={16} />
                  <div>
                    <p className="text-yellow-800 text-sm font-medium mb-1">注意事項</p>
                    <ul className="text-yellow-700 text-xs space-y-1">
                      <li>• ダウンロードリンクの有効期限は7日間です</li>
                      <li>• ZIPファイル形式で提供されます</li>
                      <li>• 個人情報が含まれるため安全に管理してください</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => {
                    setShowExportModal(false);
                    handleExportRequest();
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
                >
                  <Archive size={16} />
                  <span>エクスポート開始</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}