'use client';

import { useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function GenerateCategoriesPage() {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [generating, setGenerating] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  if (adminLoading) {
    return <LoadingSpinner size="lg" text="Checking admin access..." />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const clearCategories = async () => {
    setClearing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/clear-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert('Categories cleared successfully!');
      } else {
        setError(data.error || 'Failed to clear categories');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setClearing(false);
    }
  };

  const generateCategories = async () => {
    setGenerating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/generate-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to generate categories');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🤖 AI Category Generator
            </h1>
            <p className="text-lg text-gray-600">
              Generate smart product categories with emojis using Google Gemini AI
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
                How it works:
              </h2>
              <ul className="text-blue-800 space-y-1 list-disc list-inside">
                <li>Analyzes all existing product categories in your database</li>
                <li>Uses Google Gemini AI to generate appropriate emojis</li>
                <li>Creates professional descriptions for each category</li>
                <li>Assigns beautiful color gradients</li>
                <li>Saves everything to Firebase for your website</li>
              </ul>
            </div>

            <div className="text-center space-y-4">
              <button
                onClick={clearCategories}
                disabled={clearing || generating}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-xl transform transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mr-4"
              >
                {clearing ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Clearing...</span>
                  </div>
                ) : (
                  '🗑️ Clear Categories'
                )}
              </button>
              
              <button
                onClick={generateCategories}
                disabled={generating || clearing}
                className="bg-gradient-to-r from-lime-500 to-green-500 hover:from-lime-600 hover:to-green-600 text-white font-bold py-4 px-8 rounded-xl transform transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating with AI...</span>
                  </div>
                ) : (
                  '✨ Generate Categories with AI'
                )}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Error:</h3>
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4">
                  ✅ Success! Generated {result.categories?.length || 0} categories
                </h3>
                
                {result.categories && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.categories.map((category: any, index: number) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg bg-gradient-to-br ${category.color} text-white`}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{category.emoji}</span>
                          <h4 className="font-bold">{category.name}</h4>
                          <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                            {category.productCount} products
                          </span>
                        </div>
                        <p className="text-white/90 text-sm">{category.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 p-4 bg-white rounded-lg">
                  <h4 className="font-semibold mb-2">Next Steps:</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Categories have been automatically saved to Firebase</li>
                    <li>Your homepage will now show these dynamic categories</li>
                    <li>Product pages will use these categories for filtering</li>
                    <li>You can regenerate anytime if you add new product categories</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}