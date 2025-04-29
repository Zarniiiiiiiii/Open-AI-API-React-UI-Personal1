/**
 * API Configuration and OpenAI Integration
 * This file handles all API communication with the backend server
 */

// Define the base URL for API requests based on environment
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://open-ai-api-react-ui-personal.vercel.app/api'  // Production backend URL
  : 'http://localhost:3001/api';  // Development backend URL

/**
 * Makes a request to the OpenAI API through our backend proxy
 * @param {string} modelId - The OpenAI model to use (e.g., 'gpt-3.5-turbo')
 * @param {string} prompt - The user's input message
 * @returns {Promise<Object>} - Response containing success status and data
 */
export const callOpenAI = async (modelId, prompt) => {
  try {
    // Log the API endpoint being used
    console.log('Making request to:', API_BASE_URL);
    
    // Make the API request to our backend proxy
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

    // Log the response status for debugging
    console.log('Response status:', response.status);
    
    // Handle non-200 responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    // Parse and return the successful response
    const data = await response.json();
    return {
      success: true,
      response: data.choices[0].message.content,
      usage: data.usage
    };
  } catch (error) {
    // Log and return any errors that occur during the request
    console.error('API Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}; 