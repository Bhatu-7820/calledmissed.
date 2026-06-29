import { Message } from '@/types/chat';

interface StreamOptions {
  messages: { role: string; content: any }[];
  temperature?: number;
  systemPrompt?: string;
  customApiKey?: string;
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (error: { message: string; status?: number }) => void;
  signal?: AbortSignal;
}

export async function generateImage(prompt: string, customApiKey?: string) {
  const response = await fetch('/api/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, customApiKey })
  });

  if (!response.ok) {
    let message = "Image generation failed";
    let status = response.status;
    try {
      const data = await response.json();
      message = data.error || message;
    } catch (_) {}
    throw { message, status };
  }

  return await response.json();
}

export async function streamChatCompletions({
  messages,
  temperature,
  systemPrompt,
  customApiKey,
  onChunk,
  onDone,
  onError,
  signal
}: StreamOptions) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, temperature, systemPrompt, customApiKey }),
      signal
    });

    if (!response.ok) {
      let message = `Chat completions failed (Status: ${response.status})`;
      let status = response.status;
      try {
        const data = await response.json();
        message = data.error || message;
      } catch (_) {}
      onError({ message, status });
      return;
    }

    await parseSSEStream(response, onChunk, onDone, onError);
  } catch (err: any) {
    if (err.name === 'AbortError') return;
    onError({ message: err?.message || "An unexpected network error occurred." });
  }
}

export async function streamVisionCompletions({
  messages,
  prompt,
  image,
  temperature,
  systemPrompt,
  customApiKey,
  onChunk,
  onDone,
  onError,
  signal
}: StreamOptions & { prompt: string; image: string }) {
  try {
    const response = await fetch('/api/vision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, prompt, image, temperature, systemPrompt, customApiKey }),
      signal
    });

    if (!response.ok) {
      let message = `Vision query failed (Status: ${response.status})`;
      let status = response.status;
      try {
        const data = await response.json();
        message = data.error || message;
      } catch (_) {}
      onError({ message, status });
      return;
    }

    await parseSSEStream(response, onChunk, onDone, onError);
  } catch (err: any) {
    if (err.name === 'AbortError') return;
    onError({ message: err?.message || "An unexpected network error occurred." });
  }
}

// Common SSE stream parser helper
async function parseSSEStream(
  response: Response,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: { message: string }) => void
) {
  if (!response.body) {
    onError({ message: "No response body available to read." });
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep partial line in buffer

      for (const line of lines) {
        const cleanLine = line.trim();
        if (!cleanLine) continue;

        if (cleanLine === 'data: [DONE]') {
          continue;
        }

        if (cleanLine.startsWith('data: ')) {
          const jsonStr = cleanLine.slice(6);
          try {
            const parsed = JSON.parse(jsonStr);
            const textChunk = parsed.choices?.[0]?.delta?.content;
            if (textChunk) {
              onChunk(textChunk);
            }
          } catch (_) {
            // Ignore malformed SSE chunks
          }
        }
      }
    }
    
    // Process final bits of buffer
    if (buffer && buffer.startsWith('data: ')) {
      const jsonStr = buffer.slice(6).trim();
      if (jsonStr !== '[DONE]') {
        try {
          const parsed = JSON.parse(jsonStr);
          const textChunk = parsed.choices?.[0]?.delta?.content;
          if (textChunk) {
            onChunk(textChunk);
          }
        } catch (_) {}
      }
    }

    onDone();
  } catch (error: any) {
    onError({ message: error?.message || "Error reading the response stream." });
  }
}
