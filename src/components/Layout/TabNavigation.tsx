// Bottom tab navigation component with smooth animations
// Provides main app navigation with active states and accessibility

import { Heart, Mail, Users, User } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const { t } = useLanguage();

  const tabs = [
    { id: 'match', icon: Heart, label: t('match') },
    { id: 'chat', icon: Mail, label: t('chat') },
    { id: 'community', icon: Users, label: t('community') },
    { id: 'settings', icon: User, label: t('settings') }
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb z-50"
      role="navigation"
      aria-label="メイン"
    >
      <div className="flex items-center justify-around px-4 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center min-w-0 py-2 px-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-purple-100 text-purple-600' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.label}
            >
              <Icon 
                size={20} 
                className={`transition-transform duration-200 ${
                  isActive ? 'scale-110' : ''
                }`} 
              />
              <span className={`text-xs mt-1 font-medium transition-colors ${
                isActive ? 'text-purple-600' : 'text-gray-400'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}