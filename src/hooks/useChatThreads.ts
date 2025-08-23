// チャットスレッド管理フック（データベース中心・課金対応）
// 全てSupabaseで管理し、課金ベースのチャット機能を提供

import { useState, useEffect, useCallback } from 'react';
import { chatAPI } from '../lib/supabase/api';
import type { ChatThread, Profile } from '../types';
import { useAuth } from './useAuth';

export function useChatThreads() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // チャットスレッドを読み込み
  const loadThreads = useCallback(async () => {
    setIsLoading(true);
    try {
      // ローカルストレージからチャット一覧を取得
      const localChats: ChatThread[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('chat-')) {
          try {
            const chatData = JSON.parse(localStorage.getItem(key) || '{}');
            if (chatData.otherUser) {
              localChats.push({
                id: chatData.id,
                matchId: '',
                participants: [chatData.otherUser],
                lastMessage: null,
                unreadCount: 0,
                updatedAt: chatData.createdAt
              });
            }
          } catch (error) {
            console.warn('Failed to parse chat data:', key, error);
          }
        }
      }
      
      // データベースからも取得を試行
      try {
        console.log('Loading chat threads from database...');
        const dbThreads = await chatAPI.getChatThreads();
        
        // データベース形式からアプリ形式に変換
        const convertedThreads: ChatThread[] = dbThreads.map(dbThread => ({
          id: dbThread.id,
          matchId: dbThread.match_id || '',
          participants: [], // プロフィール情報は別途取得が必要
          lastMessage: dbThread.last_message ? {
            id: dbThread.last_message.id,
            chatId: dbThread.id,
            senderId: dbThread.last_message.sender_id,
            text: dbThread.last_message.content,
            createdAt: dbThread.last_message.created_at,
            isRead: dbThread.last_message.is_read
          } : null,
          unreadCount: 0,
          updatedAt: dbThread.updated_at
        }));
        
        // ローカルとデータベースのチャットを統合
        const allThreads = [...localChats, ...convertedThreads];
        console.log('Chat threads loaded:', allThreads.length);
        setThreads(allThreads);
      } catch (dbError) {
        console.log('Database unavailable, using local chats only:', dbError);
        setThreads(localChats);
      }
      
    } catch (error) {
      console.error('チャットスレッドの読み込みに失敗:', error);
      setThreads([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 新しいチャットスレッドを作成（データベース中心）
  const createThread = useCallback(async (profile: Profile): Promise<{ ok: boolean; threadId?: string; error?: string }> => {
    try {
      console.log('Creating chat thread with profile:', profile.displayName, profile.userId);
      
      const dbThread = await chatAPI.createChatThread(profile.userId);
      
      const newThread: ChatThread = {
        id: dbThread.id,
        matchId: dbThread.match_id || '',
        participants: [profile],
        lastMessage: null,
        unreadCount: 0,
        updatedAt: dbThread.updated_at
      };
      
      setThreads(prev => [newThread, ...prev]);
      
      console.log('Chat thread created successfully:', dbThread.id);
      return { ok: true, threadId: dbThread.id };
    } catch (error) {
      console.error('チャットスレッド作成に失敗:', error);
      return { ok: false, error: `チャットスレッドの作成に失敗しました: ${error.message}` };
    }
  }, []);

  // チャットスレッドを更新
  const updateThread = useCallback(async (chatId: string, updates: Partial<ChatThread>) => {
    try {
      const updatedThreads = threads.map(thread =>
        thread.id === chatId ? { ...thread, ...updates } : thread
      );
      
      setThreads(updatedThreads);
      return { ok: true };
    } catch (error) {
      console.error('チャットスレッド更新に失敗:', error);
      return { ok: false, error: 'チャットスレッドの更新に失敗しました' };
    }
  }, [threads]);

  // 初期化
  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  return {
    threads,
    isLoading,
    createThread,
    updateThread,
    loadThreads
  };
}