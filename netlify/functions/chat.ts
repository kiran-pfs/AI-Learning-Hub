import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  // కేవలం POST రిక్వెస్ట్‌లను మాత్రమే అనుమతిస్తుంది
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { message } = JSON.parse(event.body || '{}');
    const apiKey = process.env.VITE_HUGGINGFACE_API_KEY;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-72B-Instruct",
      {
        headers: { 
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json" 
        },
        method: "POST",
        body: JSON.stringify({ 
          inputs: `<|im_start|>system\nYou are a professional developer and academic tutor.<|im_end|>\n<|im_start|>user\n${message}<|im_end|>\n<|im_start|>assistant`,
          parameters: { max_new_tokens: 1024, return_full_text: false }
        }),
      }
    );

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch AI' }) };
  }
};
