export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  image?: string; // Base64 encoded data URI for vision
  isStreaming?: boolean;
  error?: string;
  status?: number;
  modelUsed?: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  systemPrompt?: string;
  temperature?: number;
}

export interface AppConfig {
  apiKey?: string;
  temperature: number;
  systemPrompt: string;
  theme: 'light' | 'dark';
}
