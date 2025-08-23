// コミュニティ検索・フィルタリングコンポーネント
// 名前、説明、カテゴリー、メンバー数での検索・絞り込み機能を提供

import { useState } from 'react';
import { Search, Filter, Users, Tag, SlidersHorizontal, X } from 'lucide-react';
import type { Community } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';

interface CommunitySearchProps {
  communities: Community[];
  onFilteredResults: (filtered: Community[]) => void;
}

export function CommunitySearch({ communities, onFilteredResults }: CommunitySearchProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    memberRange: { min: 0, max: 10000 },
    joinedOnly: false,
    sortBy: 'newest' as 'newest' | 'oldest' | 'members' | 'name'
  });

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

  const sortOptions = [
    { value: 'newest', label: '新しい順' },
    { value: 'oldest', label: '古い順' },
    { value: 'members', label: 'メンバー数順' },
    { value: 'name', label: '名前順' }
  ];

  // フィルタリング処理
  const applyFilters = (query: string, currentFilters: typeof filters) => {
    let filtered = communities.filter(community => {
      // テキスト検索
      if (query) {
        const searchLower = query.toLowerCase();
        const matchesName = community.name.toLowerCase().includes(searchLower);
        const matchesDescription = community.description.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesDescription) return false;
      }

      // カテゴリーフィルター
      if (currentFilters.category && community.category && community.category !== currentFilters.category) {
        return false;
      }

      // メンバー数フィルター
      if (community.memberCount < currentFilters.memberRange.min || 
          community.memberCount > currentFilters.memberRange.max) {
        return false;
      }

      // 参加済みフィルター
      if (currentFilters.joinedOnly && !community.isJoined) {
        return false;
      }

      return true;
    });

    // ソート処理
    filtered.sort((a, b) => {
      switch (currentFilters.sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'members':
          return b.memberCount - a.memberCount;
        case 'name':
          return a.name.localeCompare(b.name, 'ja');
        default:
          return 0;
      }
    });

    onFilteredResults(filtered);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    applyFilters(query, filters);
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    applyFilters(searchQuery, updatedFilters);
  };

  const clearFilters = () => {
    const defaultFilters = {
      category: '',
      memberRange: { min: 0, max: 10000 },
      joinedOnly: false,
      sortBy: 'newest' as const
    };
    setFilters(defaultFilters);
    setSearchQuery('');
    applyFilters('', defaultFilters);
  };

  const hasActiveFilters = () => {
    return filters.category !== '' || 
           filters.memberRange.min > 0 || 
           filters.memberRange.max < 10000 || 
           filters.joinedOnly ||
           searchQuery !== '';
  };

  return (
    <div className="space-y-4">
      {/* 検索バー */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="コミュニティを検索..."
          className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors ${
            hasActiveFilters() || showFilters
              ? 'text-purple-600 bg-purple-100'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* フィルターパネル */}
      {showFilters && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">フィルター</h3>
            {hasActiveFilters() && (
              <button
                onClick={clearFilters}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                クリア
              </button>
            )}
          </div>

          {/* カテゴリーフィルター */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag size={16} className="inline mr-1" />
              カテゴリー
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange({ category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">すべてのカテゴリー</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* メンバー数フィルター */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users size={16} className="inline mr-1" />
              メンバー数
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="最小"
                value={filters.memberRange.min || ''}
                onChange={(e) => handleFilterChange({
                  memberRange: { ...filters.memberRange, min: parseInt(e.target.value) || 0 }
                })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="最大"
                value={filters.memberRange.max === 10000 ? '' : filters.memberRange.max}
                onChange={(e) => handleFilterChange({
                  memberRange: { ...filters.memberRange, max: parseInt(e.target.value) || 10000 }
                })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 参加済みフィルター */}
          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.joinedOnly}
                onChange={(e) => handleFilterChange({ joinedOnly: e.target.checked })}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">参加済みのみ表示</span>
            </label>
          </div>

          {/* ソート */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">並び順</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange({ sortBy: e.target.value as typeof filters.sortBy })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* 検索結果サマリー */}
      {(searchQuery || hasActiveFilters()) && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>検索結果を表示中</span>
          {hasActiveFilters() && (
            <button
              onClick={() => setShowFilters(false)}
              className="text-purple-600 hover:text-purple-700"
            >
              フィルターを閉じる
            </button>
          )}
        </div>
      )}
    </div>
  );
}