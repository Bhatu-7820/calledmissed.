import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages, temperature, systemPrompt, customApiKey } = await req.json();

    const apiKey = customApiKey || process.env.CM_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "CallMissed API Key is missing. Add it to .env.local or enter it in Settings.", code: "api_key_missing" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const payload = {
      model: "kimi-k2.7-code",
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        ...messages
      ],
      temperature: temperature ?? 0.7,
      stream: true
    };

    const response = await fetch('https://api.callmissed.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorMessage = `API Request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorData.message || errorMessage;
      } catch (_) {
        try {
          const text = await response.text();
          if (text) errorMessage = text;
        } catch (__) {}
      }

      return new Response(
        JSON.stringify({ error: errorMessage, status: response.status }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Stream response
    const stream = new ReadableStream({
      async start(controller) {
        if (!response.body) {
          controller.close();
          return;
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || "Internal Server Error", status: 500 }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
