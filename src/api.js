// API configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://open-ai-api-react-ui-personal.vercel.app/api'  // Production backend URL
  : 'http://localhost:3001/api';  // Development backend URL

export const callOpenAI = async (modelId, prompt) => {
  try {
    console.log('Making request to:', API_BASE_URL);
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return {
      success: true,
      response: data.choices[0].message.content,
      usage: data.usage
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}; 