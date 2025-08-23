// Match celebration modal component
// Shows match notifications with rainbow confetti animation

import { useEffect, useState } from 'react';
import { Heart, MessageCircle, X } from 'lucide-react';
import type { Profile } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';

interface MatchModalProps {
  isOpen: boolean;
  matchedProfile: Profile | null;
  onClose: () => void;
  onSendMessage: () => void;
}

export function MatchModal({ isOpen, matchedProfile, onClose, onSendMessage }: MatchModalProps) {
  const { t } = useLanguage();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !matchedProfile) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 p-6 text-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              aria-label="閉じる"
            >
              <X size={24} />
            </button>
            
            <div className="relative">
              <Heart className="text-white mx-auto mb-3 animate-pulse" size={48} />
              <h2 className="text-2xl font-bold text-white mb-2">{t('newMatch')}</h2>
              <p className="text-white/90">おめでとうございます！🎉</p>
            </div>
          </div>

          {/* Profile Info */}
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <img
                src={matchedProfile.avatarUrl}
                alt={`${matchedProfile.displayName}のプロフィール写真`}
                className="w-16 h-16 rounded-full object-cover border-4 border-purple-200"
              />
              <div>
                <h3 className="text-lg font-bold text-gray-900">{matchedProfile.displayName}</h3>
                <p className="text-gray-600">{matchedProfile.city}</p>
              </div>
            </div>

            {matchedProfile.bio && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-gray-700 text-sm leading-relaxed">{matchedProfile.bio}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={onSendMessage}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <MessageCircle size={20} />
                <span>メッセージを送る</span>
              </button>
              
              <button
                onClick={onClose}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                後で送る
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-40">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ['#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981'][Math.floor(Math.random() * 5)]
                }}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}