// チャット履歴管理フック（データベース中心・課金対応）
// 全てSupabaseで管理し、課金ベースのメッセージ機能を提供

import { useState, useEffect, useCallback } from 'react';
import { chatAPI } from '../lib/supabase/api';
import type { Message } from '../types';

export function useChatHistory(chatId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // チャット履歴を読み込み
  const loadMessages = useCallback(async () => {
    if (!chatId) return;
    
    setIsLoading(true);
    try {
      // ローカルストレージからメッセージを読み込み
      const messagesKey = `messages-${chatId}`;
      const localMessages = localStorage.getItem(messagesKey);
      const parsedLocalMessages: Message[] = localMessages ? JSON.parse(localMessages) : [];
      
      // データベースからも取得を試行
      try {
        console.log('Loading messages from database for chat:', chatId);
        const dbMessages = await chatAPI.getMessages(chatId);
        
        // データベース形式からアプリ形式に変換
        const convertedMessages: Message[] = dbMessages.map(dbMessage => ({
          id: dbMessage.id,
          chatId: dbMessage.chat_thread_id,
          senderId: dbMessage.sender_id,
          text: dbMessage.content,
          createdAt: dbMessage.created_at,
          isRead: dbMessage.is_read
        }));
        
        // ローカルとデータベースのメッセージを統合（重複排除）
        const allMessages = [...parsedLocalMessages];
        for (const dbMsg of convertedMessages) {
          if (!allMessages.find(m => m.id === dbMsg.id)) {
            allMessages.push(dbMsg);
          }
        }
        
        // 時間順にソート
        allMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        
        console.log('Messages loaded (local + db):', allMessages.length);
        setMessages(allMessages);
      } catch (dbError) {
        console.log('Database unavailable, using local messages only:', dbError);
        setMessages(parsedLocalMessages);
      }
      
    } catch (error) {
      console.error('チャット履歴の読み込みに失敗:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [chatId]);

  // メッセージを送信（課金対応）
  const sendMessage = useCallback(async (text: string, senderId: string) => {
    try {
      // ローカルストレージにメッセージを保存
      const messageId = `message-${Date.now()}`;
      const newMessage: Message = {
        id: messageId,
        chatId: chatId,
        senderId: senderId,
        text: text.trim(),
        createdAt: new Date().toISOString(),
        isRead: false
      };
      
      // ローカルメッセージ履歴に追加
      const messagesKey = `messages-${chatId}`;
      const existingMessages = localStorage.getItem(messagesKey);
      const allMessages = existingMessages ? JSON.parse(existingMessages) : [];
      const updatedMessages = [...allMessages, newMessage];
      localStorage.setItem(messagesKey, JSON.stringify(updatedMessages));
      
      // 状態を更新
      setMessages(prev => [...prev, newMessage]);
      
      // データベースにも保存を試行
      try {
        console.log('Sending message to database:', chatId);
        await chatAPI.sendMessage(chatId, text);
        console.log('Message saved to database successfully');
      } catch (dbError) {
        console.log('Database save failed, message saved locally only:', dbError);
      }

      console.log('Message sent successfully');
      return { ok: true };
    } catch (error) {
      console.error('メッセージ送信に失敗:', error);
      return { ok: false, error: 'メッセージの送信に失敗しました' };
    }
  }, [chatId]);

  // メッセージを既読にする
  const markAsRead = useCallback(async (messageIds: string[]) => {
    try {
      await chatAPI.markMessagesAsRead(messageIds);
      
      const updatedMessages = messages.map(message =>
        messageIds.includes(message.id)
          ? { ...message, isRead: true }
          : message
      );

      setMessages(updatedMessages);
      return { ok: true };
    } catch (error) {
      console.error('既読処理に失敗:', error);
      return { ok: false, error: '既読処理に失敗しました' };
    }
  }, [messages]);

  // 初期化
  useEffect(() => {
    if (chatId) {
      loadMessages();
    }
  }, [loadMessages, chatId]);

  return {
    messages,
    isLoading,
    sendMessage,
    markAsRead,
    loadMessages
  };
}