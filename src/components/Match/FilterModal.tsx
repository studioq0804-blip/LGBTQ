import { X, Filter, Heart, MapPin, Target, Clock } from 'lucide-react';
import type { MatchFilters } from '../../types';
import { RELATIONSHIP_PURPOSE_OPTIONS, AGE_RANGE_OPTIONS, PREFECTURES } from '../../lib/constants';

interface FilterModalProps {
  filters: MatchFilters;
  onApply: (filters: MatchFilters) => void;
  onClose: () => void;
}

export function FilterModal({ filters, onApply, onClose }: FilterModalProps) {
  const sexualOrientationOptions = [
    'ゲイ', 'レズビアン', 'バイセクシャル', 'パンセクシャル', 
    'アセクシャル', 'クエスチョニング', 'トランスジェンダー'
  ];

  const handleOrientationToggle = (orientation: string) => {
    const newOrientations = filters.sexualOrientations.includes(orientation)
      ? filters.sexualOrientations.filter(o => o !== orientation)
      : [...filters.sexualOrientations, orientation];
    onApply({ ...filters, sexualOrientations: newOrientations });
  };

  const handleReset = () => {
    onApply({
      ageRange: [18, 50],
      maxDistance: 50,
      genderIdentities: [],
      sexualOrientations: [],
      relationshipPurposes: [],
      ageRanges: [],
      prefectures: [],
      showLikedOnly: false
    });
  };

  const handleRelationshipPurposeToggle = (purpose: string) => {
    const newPurposes = filters.relationshipPurposes.includes(purpose)
      ? filters.relationshipPurposes.filter(p => p !== purpose)
      : [...filters.relationshipPurposes, purpose];
    onApply({ ...filters, relationshipPurposes: newPurposes });
  };

  const handleAgeRangeToggle = (ageRange: string) => {
    const newAgeRanges = filters.ageRanges.includes(ageRange)
      ? filters.ageRanges.filter(a => a !== ageRange)
      : [...filters.ageRanges, ageRange];
    onApply({ ...filters, ageRanges: newAgeRanges });
  };

  const handlePrefectureToggle = (prefecture: string) => {
    const newPrefectures = filters.prefectures.includes(prefecture)
      ? filters.prefectures.filter(p => p !== prefecture)
      : [...filters.prefectures, prefecture];
    onApply({ ...filters, prefectures: newPrefectures });
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-pink-500" />
            <h2 className="text-lg font-bold text-gray-900">フィルター</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="閉じる"
            title="閉じる"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          

          {/* Sexual Orientation */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Heart className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">性的指向</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {sexualOrientationOptions.map((orientation) => (
                <button
                  key={orientation}
                  onClick={() => handleOrientationToggle(orientation)}
                  className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.sexualOrientations.includes(orientation)
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {orientation}
                </button>
              ))}
            </div>
          </div>

          {/* Relationship Purpose */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Target className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">出会いの目的</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {RELATIONSHIP_PURPOSE_OPTIONS.map((purpose) => (
                <button
                  key={purpose}
                  onClick={() => handleRelationshipPurposeToggle(purpose)}
                  className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.relationshipPurposes.includes(purpose)
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {purpose}
                </button>
              ))}
            </div>
          </div>

          {/* Age Ranges */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">年代</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {AGE_RANGE_OPTIONS.map((ageRange) => (
                <button
                  key={ageRange}
                  onClick={() => handleAgeRangeToggle(ageRange)}
                  className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                    filters.ageRanges.includes(ageRange)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {ageRange.replace(/（.*?）/, '')}
                </button>
              ))}
            </div>
          </div>

          {/* Prefectures */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <MapPin className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">都道府県</h3>
            </div>
            <div className="grid grid-cols-3 gap-1 max-h-40 overflow-y-auto">
              {PREFECTURES.map((prefecture) => (
                <button
                  key={prefecture}
                  onClick={() => handlePrefectureToggle(prefecture)}
                  className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                    filters.prefectures.includes(prefecture)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {prefecture === '北海道' ? '北海道' : prefecture.replace(/(都|府|県)$/u, '')}
                </button>
              ))}
            </div>
          </div>

          {/* Show Liked Only */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Heart className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">表示設定</h3>
            </div>
            <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={filters.showLikedOnly}
                onChange={(e) => onApply({ ...filters, showLikedOnly: e.target.checked })}
                className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
              />
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-pink-500" />
                <span className="text-sm font-medium text-gray-900">
                  いいねした人のみ表示
                </span>
              </div>
            </label>
            {filters.showLikedOnly && (
              <p className="text-xs text-gray-500 mt-1 ml-7">
                いいねした人のみが表示されます
              </p>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex space-x-3 rounded-b-2xl">
          <button
            onClick={handleReset}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            リセット
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium"
          >
            適用
          </button>
        </div>
      </div>

    </div>
  );
}