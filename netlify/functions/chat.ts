import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  // Allow only POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { message } = JSON.parse(event.body || '{}');
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    // Use environment variable for API URL if available, otherwise use default
    const apiUrl = process.env.HUGGINGFACE_API_URL || 
                   "https://router.huggingface.co/hf-inference/models/Qwen/Qwen2.5-72B-Instruct";

    const response = await fetch(
      apiUrl,
      {
        headers: { 
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json" 
        },
        method: "POST",
        body: JSON.stringify({ 
          inputs: `<|im_start|>system\nYou are a professional developer and academic tutor. Provide clear, concise, and technically accurate explanations. Use markdown for code blocks.<|im_end|>\n<|im_start|>user\n${message}<|im_end|>\n<|im_start|>assistant`,
          parameters: { max_new_tokens: 1024, return_full_text: false }
        }),
      }
    );

    const data = await response.json();

    // Check if Hugging Face returned an error
    if (data.error) {
      return {
        statusCode: 200, 
        body: JSON.stringify({ error: data.error }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: 'Failed to connect to the AI server. Please try again later.' }) 
    };
  }
};
