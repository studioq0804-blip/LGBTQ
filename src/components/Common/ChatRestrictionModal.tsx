// チャット制限通知モーダル
// 性的指向ルールによるチャット制限を説明

import { X, MessageCircleOff, Info, Heart } from 'lucide-react';

interface ChatRestrictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  currentUserName: string;
  targetUserName: string;
}

export function ChatRestrictionModal({
  isOpen,
  onClose,
  title,
  message,
  currentUserName,
  targetUserName
}: ChatRestrictionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircleOff size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">{title}</h2>
                <p className="text-white/90 text-sm">サイトルールによる制限</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              aria-label="閉じる"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircleOff className="text-orange-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {targetUserName}さんとのチャット
            </h3>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Info className="text-orange-600 mt-0.5 flex-shrink-0" size={16} />
              <div>
                <p className="text-orange-800 text-sm font-medium mb-2">制限理由</p>
                <p className="text-orange-700 text-sm leading-relaxed">
                  {message}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Heart className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
              <div>
                <p className="text-blue-800 text-sm font-medium mb-2">代替手段</p>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• いいねを送って関心を示すことは可能です</li>
                  <li>• コミュニティでの交流は制限されていません</li>
                  <li>• プロフィールの閲覧は自由に行えます</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Info className="text-gray-600 mt-0.5 flex-shrink-0" size={16} />
              <div>
                <p className="text-gray-800 text-sm font-medium mb-1">サイトポリシー</p>
                <p className="text-gray-700 text-xs leading-relaxed">
                  このルールは、各コミュニティの安全で快適な環境を維持するために設けられています。
                  ご理解とご協力をお願いいたします。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            理解しました
          </button>
        </div>
      </div>
    </div>
  );
}