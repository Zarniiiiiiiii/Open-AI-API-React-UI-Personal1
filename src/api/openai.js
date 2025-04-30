export const callOpenAI = async (modelId, prompt) => {
  try {
    const response = await fetch('http://localhost:3001/api/chat/completions', {
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
      throw new Error(`HTTP error! status: ${response.status}`);
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
      error: error.message
    };
  }
}; 