export const callClaude = async (modelId, prompt) => {
    try {
        const response = await fetch('http://localhost:3002/api/claude/chat', {
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
            response: data.response,
            usage: data.usage
        };

    } catch (error) {
        console.error('Error calling Claude:', error);
        return {
            success: false,
            error: error.message
        };
    }
}; 