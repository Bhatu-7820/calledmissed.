import { useState, useEffect, useRef, useCallback } from 'react';
import { Chat, Message, AppConfig } from '@/types/chat';
import { useLocalStorage } from './useLocalStorage';
import { streamChatCompletions, streamVisionCompletions, generateImage } from '@/services/api';

const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const DEFAULT_CONFIG: AppConfig = {
  temperature: 0.7,
  systemPrompt: "You are CallMissed AI Assistant, a helpful, advanced, and expert AI companion.",
  theme: 'light'
};

export function useChat() {
  const [chats, setChats] = useLocalStorage<Chat[]>('chats', []);
  const [currentChatId, setCurrentChatId] = useLocalStorage<string | null>('currentChatId', null);
  const [config, setConfig] = useLocalStorage<AppConfig>('appConfig', DEFAULT_CONFIG);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // 1. Sync from MongoDB on mount, fallback to local storage if empty or failed
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/chats');
        if (response.ok) {
          const dbChats = await response.json();
          if (dbChats && dbChats.length > 0) {
            setChats(dbChats);
            if (!currentChatId) {
              setCurrentChatId(dbChats[0].id);
            }
          }
        }
      } catch (error) {
        // Fallback silently to client localStorage state
      }
    };
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Initialize default chat if none exist in state (both DB and LocalStorage are empty)
  useEffect(() => {
    if (chats.length === 0) {
      const newChat: Chat = {
        id: generateId(),
        title: 'New Chat',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setChats([newChat]);
      setCurrentChatId(newChat.id);

      // Save initial chat to database
      fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat: newChat })
      }).catch(() => {});
    } else if (!currentChatId) {
      setCurrentChatId(chats[0].id);
    }
  }, [chats, currentChatId, setChats, setCurrentChatId]);

  const currentChat = chats.find(c => c.id === currentChatId) || null;

  const updateConfig = useCallback((newConfig: Partial<AppConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, [setConfig]);

  const createNewChat = useCallback((title = 'New Chat') => {
    const newChat: Chat = {
      id: generateId(),
      title,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);

    // Save to database
    fetch('/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat: newChat })
    }).catch(() => {});

    return newChat.id;
  }, [setChats, setCurrentChatId]);

  const deleteChat = useCallback((chatId: string) => {
    setChats(prev => {
      const filtered = prev.filter(c => c.id !== chatId);
      if (filtered.length === 0) {
        const newChat: Chat = {
          id: generateId(),
          title: 'New Chat',
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setTimeout(() => setCurrentChatId(newChat.id), 0);
        
        fetch('/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat: newChat })
        }).catch(() => {});

        return [newChat];
      }
      if (currentChatId === chatId) {
        setTimeout(() => setCurrentChatId(filtered[0].id), 0);
      }
      return filtered;
    });

    // Delete from database
    fetch(`/api/chats?chatId=${chatId}`, {
      method: 'DELETE'
    }).catch(() => {});
  }, [currentChatId, setChats, setCurrentChatId]);

  const renameChat = useCallback((chatId: string, newTitle: string) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, title: newTitle.trim(), updatedAt: new Date().toISOString() } : c));

    // Save rename to database
    fetch('/api/chats', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, title: newTitle.trim() })
    }).catch(() => {});
  }, [setChats]);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  }, []);

  const clearAllChats = useCallback(() => {
    stopGeneration();
    const newChat: Chat = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Clear MongoDB records
    chats.forEach(c => {
      fetch(`/api/chats?chatId=${c.id}`, { method: 'DELETE' }).catch(() => {});
    });

    setChats([newChat]);
    setCurrentChatId(newChat.id);

    fetch('/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat: newChat })
    }).catch(() => {});

  }, [chats, setChats, setCurrentChatId, stopGeneration]);

  const appendMessage = useCallback((chatId: string, message: Message) => {
    setChats(prev => prev.map(c => {
      if (c.id !== chatId) return c;
      const updatedMessages = [...c.messages, message];
      
      let newTitle = c.title;
      if (c.title === 'New Chat' && message.role === 'user') {
        newTitle = message.content.length > 24 
          ? message.content.substring(0, 24) + '...' 
          : message.content;
      }

      const nextChat = {
        ...c,
        title: newTitle,
        messages: updatedMessages,
        updatedAt: new Date().toISOString()
      };

      // Sync to MongoDB asynchronously
      fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat: nextChat })
      }).catch(() => {});

      return nextChat;
    }));
  }, [setChats]);

  const updateLastMessage = useCallback((chatId: string, updates: Partial<Message>) => {
    setChats(prev => prev.map(c => {
      if (c.id !== chatId || c.messages.length === 0) return c;
      const updatedMessages = [...c.messages];
      const lastIndex = updatedMessages.length - 1;
      updatedMessages[lastIndex] = { ...updatedMessages[lastIndex], ...updates };
      
      const nextChat = { 
        ...c, 
        messages: updatedMessages,
        updatedAt: new Date().toISOString() 
      };

      // Sync to MongoDB asynchronously
      fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat: nextChat })
      }).catch(() => {});

      return nextChat;
    }));
  }, [setChats]);

  const sendMessage = useCallback(async (content: string, attachedImage?: string) => {
    if (!currentChatId || (!content.trim() && !attachedImage)) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
      image: attachedImage
    };

    appendMessage(currentChatId, userMessage);
    setIsGenerating(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const isImageRequest = /(generate\s+an\s+image|draw\b)/i.test(content);

    if (isImageRequest && !attachedImage) {
      try {
        const placeholderId = generateId();
        const placeholderMessage: Message = {
          id: placeholderId,
          role: 'assistant',
          content: 'Generating image...',
          timestamp: new Date().toISOString(),
          isStreaming: true,
          modelUsed: 'gemini-2.5-flash-image'
        };
        appendMessage(currentChatId, placeholderMessage);

        const imgData = await generateImage(content, config.apiKey);
        
        if (imgData.data?.[0]?.b64_json) {
          updateLastMessage(currentChatId, {
            content: `Here is the image I generated for: "${content}"`,
            image: `data:image/png;base64,${imgData.data[0].b64_json}`,
            isStreaming: false
          });
        } else {
          throw new Error("No image data returned from API.");
        }
      } catch (err: any) {
        updateLastMessage(currentChatId, {
          content: err.message || "Failed to generate image.",
          error: err.message || "Failed to generate image.",
          status: err.status || 555,
          isStreaming: false
        });
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    const assistantMessageId = generateId();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
      modelUsed: 'kimi-k2.7-code'
    };

    appendMessage(currentChatId, assistantMessage);

    const history = (chats.find(c => c.id === currentChatId)?.messages || []).map(m => ({
      role: m.role,
      content: m.image && m.role === 'user'
        ? [
            { type: 'text', text: m.content },
            { type: 'image_url', image_url: { url: m.image } }
          ]
        : m.content
    }));

    let fullText = '';

    const handleChunk = (chunk: string) => {
      fullText += chunk;
      updateLastMessage(currentChatId, { content: fullText });
    };

    const handleDone = () => {
      updateLastMessage(currentChatId, { isStreaming: false });
      setIsGenerating(false);
    };

    const handleError = (error: { message: string; status?: number }) => {
      updateLastMessage(currentChatId, {
        content: error.message,
        error: error.message,
        status: error.status || 500,
        isStreaming: false
      });
      setIsGenerating(false);
    };

    if (attachedImage) {
      await streamVisionCompletions({
        messages: history,
        prompt: content,
        image: attachedImage,
        temperature: config.temperature,
        systemPrompt: config.systemPrompt,
        customApiKey: config.apiKey,
        onChunk: handleChunk,
        onDone: handleDone,
        onError: handleError,
        signal: abortController.signal
      });
    } else {
      await streamChatCompletions({
        messages: [...history, { role: 'user', content: content.trim() }],
        temperature: config.temperature,
        systemPrompt: config.systemPrompt,
        customApiKey: config.apiKey,
        onChunk: handleChunk,
        onDone: handleDone,
        onError: handleError,
        signal: abortController.signal
      });
    }
  }, [currentChatId, chats, config, appendMessage, updateLastMessage]);

  const regenerateResponse = useCallback(async (messageId: string) => {
    if (!currentChatId || isGenerating) return;

    const chat = chats.find(c => c.id === currentChatId);
    if (!chat) return;

    const msgIndex = chat.messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;

    let userMsgIndex = -1;
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (chat.messages[i].role === 'user') {
        userMsgIndex = i;
        break;
      }
    }

    if (userMsgIndex === -1) return;

    const userMessage = chat.messages[userMsgIndex];
    const truncatedMessages = chat.messages.slice(0, userMsgIndex);
    
    setChats(prev => prev.map(c => c.id === currentChatId ? { ...c, messages: truncatedMessages } : c));

    // Save updated chat without final answer back to MongoDB
    const nextChat = { ...chat, messages: truncatedMessages, updatedAt: new Date().toISOString() };
    fetch('/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat: nextChat })
    }).catch(() => {});

    await sendMessage(userMessage.content, userMessage.image);
  }, [currentChatId, chats, isGenerating, sendMessage, setChats]);

  const selectChat = useCallback((chatId: string) => {
    setCurrentChatId(chatId);
  }, [setCurrentChatId]);

  return {
    chats,
    currentChat,
    isGenerating,
    config,
    updateConfig,
    createNewChat,
    selectChat,
    deleteChat,
    renameChat,
    sendMessage,
    regenerateResponse,
    stopGeneration,
    clearAllChats
  };
}
