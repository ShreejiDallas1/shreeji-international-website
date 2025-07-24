'use client';

import { useState } from 'react';

export default function FixImagesPage() {
  const [fixing, setFixing] = useState(false);
  const [result, setResult] = useState<string>('');

  const fixImages = async () => {
    setFixing(true);
    setResult('');
    
    try {
      // Force sync to update images
      const syncResponse = await fetch('/api/sync-products?key=shreeji_sync_api_2024');
      const syncData = await syncResponse.json();
      
      if (syncResponse.ok) {
        setResult('✅ Sync successful!\n' + JSON.stringify(syncData, null, 2));
        
        // Refresh the page after 2 seconds to show updated images
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setResult('❌ Sync failed:\n' + JSON.stringify(syncData, null, 2));
      }
    } catch (error) {
      setResult('❌ Error: ' + (error as Error).message);
    } finally {
      setFixing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Fix Product Images</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Instructions:</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-6">
          <li>Go to your Google Drive</li>
          <li>Right-click on the product image file</li>
          <li>Select "Share"</li>
          <li>Change permissions to "Anyone with the link can view"</li>
          <li>Copy the share link</li>
          <li>Update your Google Sheet with the share link</li>
          <li>Click "Force Sync" below</li>
        </ol>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Important:</strong> Make sure your Google Drive images are set to 
                "Anyone with the link can view" for them to display properly on the website.
              </p>
            </div>
          </div>
        </div>
        
        <button
          onClick={fixImages}
          disabled={fixing}
          className="px-6 py-3 bg-lime-500 text-white rounded-lg hover:bg-lime-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {fixing ? '🔄 Syncing...' : '🚀 Force Sync Images'}
        </button>
      </div>
      
      {result && (
        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Result:</h3>
          <pre className="whitespace-pre-wrap text-sm overflow-x-auto">{result}</pre>
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Test Your Image URLs</h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">
            The system automatically converts your Google Drive URLs to this thumbnail format:
          </p>
          <code className="block bg-white p-2 rounded border text-xs break-all">
            https://drive.google.com/thumbnail?id=YOUR_FILE_ID&sz=w1000
          </code>
          <p className="text-xs text-gray-500 mt-2">
            This thumbnail format is more reliable for displaying images on websites. 
            You can test if your image works by visiting: <a href="/test-thumbnail" className="text-blue-600 hover:underline" target="_blank">/test-thumbnail</a>
          </p>
        </div>
      </div>
    </div>
  );
}