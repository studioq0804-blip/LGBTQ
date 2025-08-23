// 通報モーダルコンポーネント
// ユーザーフレンドリーで包括的な通報機能を提供

import { useState } from 'react';
import { X, AlertTriangle, Shield, Camera, Upload, Check } from 'lucide-react';
import type { ReportCategory, ReportSubmission } from '../../types/moderation';
import type { Profile } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import { REPORT_CATEGORIES } from '../../lib/constants';

interface ReportModalProps {
  targetUser: Profile;
  chatId?: string;
  messageIds?: string[];
  onClose: () => void;
  onSubmit: (report: ReportSubmission) => Promise<{ ok: boolean; ticketNumber?: string; error?: string }>;
}

export function ReportModal({ 
  targetUser,
  chatId, 
  messageIds = [], 
  onClose, 
  onSubmit 
}: ReportModalProps) {
  const { t } = useLanguage();
  const [selectedCategories, setSelectedCategories] = useState<ReportCategory[]>([]);
  const [comment, setComment] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [shouldBlock, setShouldBlock] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');

  const handleCategoryToggle = (category: ReportCategory) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      // 5MB制限
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} は5MBを超えています`);
        return false;
      }
      // 画像ファイルのみ
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} は画像ファイルではありません`);
        return false;
      }
      return true;
    });
    
    setAttachments(prev => [...prev, ...validFiles].slice(0, 5)); // 最大5ファイル
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategories.length === 0) {
      alert('通報理由を選択してください');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onSubmit({
        targetUserId: targetUser.userId,
        chatId,
        messageIds,
        categories: selectedCategories,
        comment: comment.trim(),
        attachments,
        shouldBlock
      });

      if (result.ok) {
        setTicketNumber(result.ticketNumber || '');
        setShowSuccess(true);
      } else {
        alert(result.error || '通報の送信に失敗しました');
      }
    } catch (error) {
      alert('通報の送信に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-green-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">通報を受け付けました</h3>
            <p className="text-gray-600 mb-4">
              通常24〜72時間以内に対応します。詳細は通知でお知らせします。
            </p>
            
            {ticketNumber && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600">チケット番号</p>
                <p className="font-mono font-bold text-gray-900">{ticketNumber}</p>
              </div>
            )}

            {shouldBlock && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-blue-800 text-sm">
                  <Shield className="inline w-4 h-4 mr-1" />
                  {targetUser.displayName}さんをブロックしました。チャットや表示が行われなくなります。
                </p>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">このユーザーを通報しますか？</h2>
              <p className="text-sm text-gray-600">{targetUser.displayName}さんを通報</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Privacy Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Shield className="text-blue-600 mt-0.5" size={16} />
                <div>
                  <p className="text-blue-800 text-sm font-medium mb-1">プライバシーについて</p>
                  <p className="text-blue-700 text-xs leading-relaxed">
                    通報内容は運営が確認し、必要に応じて対応します。あなたの情報が相手に伝わることはありません。
                  </p>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">通報理由（複数選択可）</h3>
              <div className="space-y-3">
                {REPORT_CATEGORIES.map((category) => (
                  <label
                    key={category.value}
                    className={`flex items-start space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                      selectedCategories.includes(category.value)
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.value)}
                      onChange={() => handleCategoryToggle(category.value)}
                      className="mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{category.label}</span>
                        {category.severity === 'high' && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                            緊急
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                詳細（任意）
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors resize-none"
                rows={4}
                maxLength={1000}
                placeholder="具体的な状況や追加情報があれば記入してください..."
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {comment.length}/1000
              </div>
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                証拠画像（任意）
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors">
                <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                <label className="text-blue-600 font-semibold hover:text-blue-700 cursor-pointer">
                  画像をアップロード
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-gray-500 text-sm mt-1">PNG, JPG (5MB以下、最大5ファイル)</p>
              </div>
              
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Camera size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Block Option */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shouldBlock}
                  onChange={(e) => setShouldBlock(e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                />
                <div>
                  <div className="font-medium text-yellow-800">このユーザーをブロックする（推奨）</div>
                  <div className="text-yellow-700 text-sm mt-1">
                    チェックすると、このユーザーからのメッセージや表示をブロックします。
                    通報処理とは別に即座に適用されます。
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors font-medium"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedCategories.length === 0}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>送信中...</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={16} />
                  <span>通報する</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}