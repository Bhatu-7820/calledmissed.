import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt, customApiKey } = await req.json();

    const geminiApiKey = process.env.ALT_API_KEY;
    const callMissedApiKey = customApiKey || process.env.CM_API_KEY;

    // 1. If Gemini API key is configured, use Gemini Imagen 4.0
    if (geminiApiKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            instances: [
              {
                prompt: prompt
              }
            ],
            parameters: {
              sampleCount: 1,
              aspectRatio: "1:1",
              outputMimeType: "image/png"
            }
          })
        });

        if (!response.ok) {
          let errMsg = `Gemini API request failed with status ${response.status}`;
          try {
            const errData = await response.json();
            errMsg = errData.error?.message || errMsg;
          } catch (_) {}
          
          return new Response(
            JSON.stringify({ error: errMsg, status: response.status }),
            { status: response.status, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const data = await response.json();
        const base64Image = data.predictions?.[0]?.bytesBase64Encoded;
        if (base64Image) {
          return new Response(
            JSON.stringify({
              data: [
                {
                  b64_json: base64Image
                }
              ]
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        } else {
          return new Response(
            JSON.stringify({ error: "No image bytes returned in Gemini response.", status: 500 }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
      } catch (geminiError: any) {
        return new Response(
          JSON.stringify({ error: geminiError.message || "Gemini Image generation failed.", status: 500 }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // 2. Default: CallMissed Flux Image Generation
    if (!callMissedApiKey) {
      return new Response(
        JSON.stringify({ error: "API credentials for image generation are missing. Please configure them in your settings.", code: "api_key_missing" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const payload = {
      model: "flux-2-klein-9b",
      prompt: prompt
    };

    const response = await fetch('https://api.callmissed.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${callMissedApiKey}`
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

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || "Internal Server Error", status: 500 }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
