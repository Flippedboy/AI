import type {
  IntelligentCustomerServiceReplyOneInput,
  IntelligentCustomerServiceReplyOneOutput,
} from '@shared/plugin-types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function streamChatReply(
  userQuestion: string,
  onChunk: (text: string) => void
): Promise<string> {
  let fullText = '';

  try {
    const response = await fetch(API_BASE_URL + '/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: userQuestion }),
    });

    if (!response.ok) {
      throw new Error('HTTP ' + response.status + ': ' + response.statusText);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response stream');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              fullText += data.content;
              onChunk(data.content);
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    }
  } catch (error) {
    console.error('[streamChatReply] Error:', error);
    throw error;
  }

  return fullText;
}

export async function parseDocument(
  fileUrls: string[]
): Promise<string> {
  try {
    const response = await fetch(API_BASE_URL + '/api/ai/parse-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileUrls }),
    });

    if (!response.ok) {
      throw new Error('HTTP ' + response.status + ': ' + response.statusText);
    }

    const result = await response.json();
    return result.content || '';
  } catch (error) {
    console.error('[parseDocument] Error:', error);
    throw error;
  }
}
