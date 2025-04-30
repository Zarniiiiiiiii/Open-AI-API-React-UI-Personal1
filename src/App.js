import React, { useState, useEffect } from 'react';
import { models } from './models';
import { callOpenAI } from './api';
import './App.css';

function App() {
  // Load selected models from localStorage on initial render
  const [selectedModels, setSelectedModels] = useState(() => {
    const saved = localStorage.getItem('selectedModels');
    return saved ? JSON.parse(saved) : [];
  });

  const [prompt, setPrompt] = useState('');
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);

  // Save selected models to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('selectedModels', JSON.stringify(selectedModels));
  }, [selectedModels]);

  const handleModelToggle = (modelId) => {
    setSelectedModels(prev => 
      prev.includes(modelId)
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || selectedModels.length === 0) return;

    setLoading(true);
    setResponses({});

    const results = {};
    for (const modelId of selectedModels) {
      const result = await callOpenAI(modelId, prompt);
      results[modelId] = result;
    }

    setResponses(results);
    setLoading(false);
  };

  const calculateCost = (modelId, usage) => {
    const model = models.find(m => m.id === modelId);
    if (!model || !usage) return 0;
    return (usage.total_tokens / 1000) * model.pricePer1KTokens;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Ultra-AI</h1>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Select Models:
            </label>
            <div className="flex flex-wrap gap-4">
              {models.map(model => (
                <label key={model.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedModels.includes(model.id)}
                    onChange={() => handleModelToggle(model.id)}
                    className="form-checkbox h-5 w-5 text-blue-600 cursor-pointer"
                  />
                  <span>{model.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Enter your prompt:
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
              placeholder="Type your prompt here..."
            />
          </div>

          <button
            type="submit"
            disabled={loading || !prompt.trim() || selectedModels.length === 0}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? 'Processing...' : 'Submit'}
          </button>
        </form>

        {loading && (
          <div className="text-center mb-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedModels.map(modelId => {
            const model = models.find(m => m.id === modelId);
            const response = responses[modelId];
            
            if (!model) return null;
            
            return (
              <div key={modelId} className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">{model.name}</h3>
                
                {response ? (
                  response.success ? (
                    <>
                      <div className="mb-4">
                        <p className="text-gray-700 whitespace-pre-wrap">{response.response}</p>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Tokens used: {response.usage?.total_tokens}</p>
                        <p>Estimated cost: ${calculateCost(modelId, response.usage).toFixed(4)}</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-red-500">
                      Error: {response.error}
                    </div>
                  )
                ) : (
                  <div className="text-gray-500">
                    No response yet
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
