import { auth } from '../firebase';

export async function callGemini(contents: any, config: any = {}, systemInstruction?: any) {
  try {
    const token = await auth.currentUser?.getIdToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers,
      body: JSON.stringify({ contents, config, systemInstruction }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Gemini proxy call failed');
    }

    const result = await response.json();
    if (!result?.text) throw new Error('No response from AI');

    return result;
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    if (error.message?.includes('API key not valid') || error.message?.includes('authentication failed')) {
      throw new Error('AI authentication failed. Our servers are currently experiencing issues with AI connectivity.');
    }
    throw error;
  }
}
