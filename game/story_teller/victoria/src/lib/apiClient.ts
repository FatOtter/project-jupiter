import type { DMResponse } from '../types/game';

interface LLMConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

function getConfig(): LLMConfig {
  const getEnv = (key: string, fallback: string) => {
    try {
      // @ts-ignore
      return (process.env as any)[key] || (import.meta.env as any)[key] || fallback;
    } catch {
      return (import.meta.env as any)[key] || fallback;
    }
  };

  const rawBaseUrl = getEnv('VITE_LLM_BASE_URL', 'https://api.openai.com/v1');
  
  // 如果是开发环境，使用相对路径代理来绕过 CORS
  // 代理在 vite.config.ts 中配置为 /api-proxy -> https://ark.cn-beijing.volces.com
  let baseUrl = rawBaseUrl;
  if (import.meta.env.DEV && rawBaseUrl.includes('ark.cn-beijing.volces.com')) {
    baseUrl = rawBaseUrl.replace('https://ark.cn-beijing.volces.com', '/api-proxy');
  }

  return {
    apiKey: getEnv('VITE_LLM_API_KEY', ''),
    baseUrl: baseUrl,
    model: getEnv('VITE_LLM_MODEL', 'gpt-4'),
  };
}

export async function* streamDMResponse(
  systemPrompt: string,
  userMessage: string,
  onRawChunk?: (chunk: string) => void
): AsyncGenerator<string, void, unknown> {
  const config = getConfig();

  if (!config.apiKey) {
    yield 'DM暂时失去了联系……请检查API配置。';
    return;
  }

  const safeBaseUrl = config.baseUrl.endsWith('/') 
    ? config.baseUrl.slice(0, -1) 
    : config.baseUrl;

  try {
    const response = await fetch(`${safeBaseUrl}/chat/completions`, {
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
      throw new Error(`API请求失败: ${response.status} - ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法读取响应流');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        
        const data = trimmed.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            yield delta;
            onRawChunk?.(delta);
          }
        } catch {
          // 忽略片段解析错误
        }
      }
    }
  } catch (error) {
    console.error('DM响应错误:', error);
    yield `DM暂时失去了联系……网络似乎有问题。(${error})`;
  }
}

export async function sendDMMessage(
  systemPrompt: string,
  userMessage: string
): Promise<DMResponse> {
  const config = getConfig();
  if (!config.apiKey) throw new Error('API Key未配置');

  const safeBaseUrl = config.baseUrl.endsWith('/') 
    ? config.baseUrl.slice(0, -1) 
    : config.baseUrl;

  try {
    const response = await fetch(`${safeBaseUrl}/chat/completions`, {
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
        temperature: 0.8,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API请求失败: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) throw new Error('API返回空响应');

    try {
      return JSON.parse(content) as DMResponse;
    } catch {
      return { narrative: content, speaker: 'dm' };
    }
  } catch (error) {
    console.error('DM消息发送错误:', error);
    throw error;
  }
}

export async function* streamOpeningNarrative(
  systemPrompt: string
): AsyncGenerator<string, void, unknown> {
  const openingPrompt = `请生成游戏开场白。描述玩家选择的时代和场景，引入氛围。返回JSON格式，包含narrative字段。`;
  yield* streamDMResponse(systemPrompt, openingPrompt);
}
