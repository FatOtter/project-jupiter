import { DMResponse } from '../types/game';

interface LLMConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

const getConfig = (): LLMConfig => {
  const apiKey = import.meta.env.VITE_LLM_API_KEY || '';
  const baseUrl = import.meta.env.VITE_LLM_BASE_URL || 'https://api.openai.com/v1';
  const model = import.meta.env.VITE_LLM_MODEL || 'gpt-4o-mini';
  
  return { apiKey, baseUrl, model };
};

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete: (response: DMResponse) => void;
  onError: (error: Error) => void;
}

export const sendToDM = async (
  systemPrompt: string,
  userMessage: string,
  callbacks: StreamCallbacks
): Promise<void> => {
  const config = getConfig();
  
  if (!config.apiKey) {
    callbacks.onError(new Error('LLM API Key not configured. Please set VITE_LLM_API_KEY in your .env file.'));
    return;
  }

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        stream: true,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const token = parsed.choices?.[0]?.delta?.content || '';
            if (token) {
              fullContent += token;
              callbacks.onToken(token);
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }

    // Try to parse as JSON, fall back to plain text
    let dmResponse: DMResponse;
    try {
      // Extract JSON from markdown code blocks if present
      let jsonContent = fullContent;
      const jsonMatch = fullContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1].trim();
      }
      dmResponse = JSON.parse(jsonContent);
    } catch {
      dmResponse = {
        narrative: fullContent,
        speaker: 'dm',
      };
    }

    callbacks.onComplete(dmResponse);
  } catch (error) {
    callbacks.onError(error instanceof Error ? error : new Error(String(error)));
  }
};

export const sendToDMSync = async (
  systemPrompt: string,
  userMessage: string
): Promise<DMResponse> => {
  return new Promise((resolve, reject) => {
    let fullContent = '';
    
    sendToDM(systemPrompt, userMessage, {
      onToken: (token) => {
        fullContent += token;
      },
      onComplete: (response) => {
        resolve(response);
      },
      onError: (error) => {
        reject(error);
      },
    });
  });
};
