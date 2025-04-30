export const callOpenAI = async (modelId, prompt) => {
  try {
    // Get the current domain
    const currentDomain = window.location.origin;
    const API_URL = process.env.NODE_ENV === 'production'
      ? `${currentDomain}/api/chat/completions`
      : 'http://localhost:3001/api/chat/completions';

    console.log('Making request to:', API_URL);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      response: data.choices[0].message.content,
      usage: data.usage
    };

  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return {
      success: false,
      error: error.message || 'Failed to connect to OpenAI API'
    };
  }
}; 