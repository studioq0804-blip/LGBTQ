// Community detail view with posts and interactions
// Shows community posts with like/comment functionality

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Plus, Heart, MessageCircle, Send, MoreVertical } from 'lucide-react';
import type { Community, Post } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import { mockCommunities, mockPosts } from '../../data/mockData';

interface CommunityDetailProps {
  communityId: string;
  onBack: () => void;
}

export function CommunityDetail({ 
  communityId,
  onBack
}: CommunityDetailProps) {
  const { t } = useLanguage();
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Load community data
    const foundCommunity = mockCommunities.find(c => c.id === communityId);
    setCommunity(foundCommunity || null);
    
    // Load posts
    const communityPosts = mockPosts[communityId] || [];
    setPosts(communityPosts);
  }, [communityId]);

  useEffect(() => {
    if (showCreatePost && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [showCreatePost]);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPostText.trim()) {
      console.log('Create post:', newPostText.trim());
      setNewPostText('');
      setShowCreatePost(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return '1時間以内';
    if (diffInHours < 24) return `${diffInHours}時間前`;
    return `${Math.floor(diffInHours / 24)}日前`;
  };

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  if (!community) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">コミュニティが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        {/* Cover Image */}
        <div className="relative h-32">
          <img
            src={community.imageUrl}
            alt={`${community.name}のカバー画像`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <button
            onClick={onBack}
            className="absolute top-3 left-3 p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-colors"
            aria-label="コミュニティ一覧に戻る"
          >
            <ArrowLeft className="text-white" size={20} />
          </button>
        </div>

        {/* Community Info */}
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{community.name}</h1>
          <p className="text-gray-600 leading-relaxed mb-3">{community.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{community.memberCount} メンバー</span>
            <button
              onClick={() => setShowCreatePost(!showCreatePost)}
              className={`flex items-center space-x-2 font-medium py-2 px-4 rounded-lg transition-all duration-200 ${
                showCreatePost
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
              }`}
            >
              <Plus size={16} className={showCreatePost ? 'rotate-45' : ''} />
              <span>{showCreatePost ? 'キャンセル' : t('createPost')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Create Post */}
      {showCreatePost && (
        <div className="bg-white border-b border-gray-200 p-4">
          <form onSubmit={handleCreatePost}>
            <textarea
              ref={textareaRef}
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              placeholder={t('postPlaceholder')}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
              rows={3}
              maxLength={500}
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm text-gray-500">{newPostText.length}/500</span>
              <button
                type="submit"
                disabled={!newPostText.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Send size={16} />
                <span>投稿</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="text-purple-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">まだ投稿がありません</h3>
            <p className="text-gray-500">最初の投稿を作成してみましょう！</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm p-4">
              {/* Post Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={post.author.avatarUrl}
                    alt={`${post.author.displayName}のアバター`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{post.author.displayName}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{formatTime(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                  <MoreVertical size={16} className="text-gray-400" />
                </button>
              </div>

              {/* Post Content */}
              <p className="text-gray-800 leading-relaxed mb-4">{post.text}</p>

              {/* Post Actions */}
              <div className="flex items-center space-x-6 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleLikePost(post.id)}
                  className={`flex items-center space-x-2 transition-colors ${
                    post.isLiked
                      ? 'text-red-500 hover:text-red-600'
                      : 'text-gray-500 hover:text-red-500'
                  }`}
                >
                  <Heart 
                    size={18} 
                    className={post.isLiked ? 'fill-current' : ''} 
                  />
                  <span className="text-sm font-medium">{formatCount(post.likes)}</span>
                </button>
                
                <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
                  <MessageCircle size={18} />
                  <span className="text-sm font-medium">{formatCount(post.comments)}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}