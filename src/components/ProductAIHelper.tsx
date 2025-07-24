'use client';

import { useState } from 'react';
import { FiSend, FiLoader, FiMessageSquare, FiX } from 'react-icons/fi';

interface ProductAIHelperProps {
  productName: string;
  productDescription: string;
}

const ProductAIHelper = ({ productName, productDescription }: ProductAIHelperProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Enhance the query with product context
      const enhancedQuery = `About this product "${productName}": ${productDescription}\n\nUser question: ${query}`;
      
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: enhancedQuery }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to get AI response');
      }
      
      setResponse(data.result);
    } catch (error: any) {
      console.error('Error getting AI response:', error);
      setError(error.message || 'Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* AI Helper Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-lime-600 hover:bg-lime-700 text-white rounded-full p-4 shadow-lg z-50 transition-transform hover:scale-110"
        aria-label="AI Product Helper"
      >
        {isOpen ? (
          <FiX className="h-6 w-6" />
        ) : (
          <FiMessageSquare className="h-6 w-6" />
        )}
      </button>
      
      {/* AI Helper Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-lime-600 dark:bg-lime-700 text-white p-4">
            <h3 className="font-semibold">Product AI Assistant</h3>
            <p className="text-sm text-lime-100">Ask anything about this product</p>
          </div>
          
          {/* Response Area */}
          <div className="p-4 max-h-60 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            {response ? (
              <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">
                {response}
              </div>
            ) : error ? (
              <div className="text-sm text-red-500 dark:text-red-400">
                Error: {error}
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Ask me about this product's uses, benefits, cooking tips, or any other information you need.
              </div>
            )}
            
            {isLoading && (
              <div className="flex justify-center items-center mt-4">
                <FiLoader className="animate-spin h-5 w-5 text-lime-600 dark:text-lime-500" />
              </div>
            )}
          </div>
          
          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about this product..."
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-lime-500 dark:bg-gray-700 dark:text-white"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-lime-600 hover:bg-lime-700 text-white p-2 rounded-r-md disabled:opacity-50"
                disabled={isLoading || !query.trim()}
              >
                {isLoading ? (
                  <FiLoader className="animate-spin h-5 w-5" />
                ) : (
                  <FiSend className="h-5 w-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProductAIHelper;