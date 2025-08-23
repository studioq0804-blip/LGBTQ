// コミュニティ作成モーダルコンポーネント
// 新しいコミュニティの作成フォームを提供

import { useState } from 'react';
import { X, Save, Users, Camera, Upload } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (community: {
    name: string;
    description: string;
    imageUrl: string;
    category: string;
    isPrivate: boolean;
  }) => void;
}

export function CreateCommunityModal({ isOpen, onClose, onCreate }: CreateCommunityModalProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    category: '',
    isPrivate: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    'アート・創作',
    'サポート・相談',
    'イベント・集会',
    '趣味・娯楽',
    'ビジネス・キャリア',
    '健康・ウェルネス',
    '教育・学習',
    'その他'
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // ファイルサイズチェック (5MB制限)
      if (file.size > 5 * 1024 * 1024) {
        alert('ファイルサイズは5MB以下にしてください');
        return;
      }

      // ファイル形式チェック
      if (!file.type.startsWith('image/')) {
        alert('画像ファイルを選択してください');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({ ...prev, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) return;

    setIsLoading(true);
    try {
      // デモ用の遅延
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // デフォルト画像を設定（画像がアップロードされていない場合）
      const communityData = {
        ...formData,
        imageUrl: formData.imageUrl || 'https://images.pexels.com/photos/1708912/pexels-photo-1708912.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop'
      };
      
      onCreate(communityData);
      
      // フォームをリセット
      setFormData({
        name: '',
        description: '',
        imageUrl: '',
        category: '',
        isPrivate: false
      });
      
      onClose();
    } catch (error) {
      alert('コミュニティの作成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="text-green-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">コミュニティを作成</h2>
              <p className="text-sm text-gray-600">新しいコミュニティを立ち上げましょう</p>
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
            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カバー画像
              </label>
              <div className="relative">
                {formData.imageUrl ? (
                  <div className="relative h-32 rounded-xl overflow-hidden">
                    <img
                      src={formData.imageUrl}
                      alt="コミュニティカバー画像"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <label
                        htmlFor="image-upload"
                        className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full cursor-pointer transition-colors"
                      >
                        <Camera size={20} />
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-400 transition-colors">
                    <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                    <label
                      htmlFor="image-upload"
                      className="text-green-600 font-semibold hover:text-green-700 cursor-pointer"
                    >
                      画像をアップロード
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-gray-500 text-sm mt-1">JPG, PNG (5MB以下)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Community Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                コミュニティ名 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="例: 東京LGBTQ+読書会"
                required
                maxLength={50}
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {formData.name.length}/50
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                説明 *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none"
                rows={4}
                placeholder="このコミュニティについて説明してください..."
                required
                maxLength={300}
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {formData.description.length}/300
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリー
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              >
                <option value="">カテゴリーを選択してください</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Privacy Setting */}
            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPrivate}
                  onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <div>
                  <div className="font-medium text-gray-900">プライベートコミュニティ</div>
                  <div className="text-sm text-gray-600">
                    招待された人のみが参加できます
                  </div>
                </div>
              </label>
            </div>

            {/* Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-blue-900 mb-2">コミュニティガイドライン</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 互いを尊重し、包括的な環境を維持してください</li>
                <li>• 差別的な発言や行動は禁止されています</li>
                <li>• プライバシーを尊重し、個人情報の共有は避けてください</li>
                <li>• 建設的で前向きな議論を心がけてください</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors font-medium"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name.trim() || !formData.description.trim()}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>作成中...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>作成する</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}