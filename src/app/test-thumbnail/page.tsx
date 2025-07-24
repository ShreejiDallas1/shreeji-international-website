'use client';

import { useState } from 'react';

export default function TestThumbnailPage() {
  const [fileId, setFileId] = useState('12tUUp-6A5cIe2NMOCk9oVqgGrjqO1pSz');
  
  const formats = [
    {
      name: 'UC Export View',
      url: `https://drive.google.com/uc?export=view&id=${fileId}`,
    },
    {
      name: 'Thumbnail w1000',
      url: `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`,
    },
    {
      name: 'Thumbnail w500',
      url: `https://drive.google.com/thumbnail?id=${fileId}&sz=w500`,
    },
    {
      name: 'Thumbnail s1000',
      url: `https://drive.google.com/thumbnail?id=${fileId}&sz=s1000`,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Test Google Drive Image Formats</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">File ID:</label>
        <input
          type="text"
          value={fileId}
          onChange={(e) => setFileId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Enter Google Drive file ID"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {formats.map((format, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">{format.name}</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">URL:</p>
              <code className="text-xs bg-gray-100 p-2 rounded block overflow-x-auto">
                {format.url}
              </code>
            </div>
            
            {/* Status indicator */}
            <div id={`status-${index}`} className="text-yellow-600 font-medium mb-4">
              🔄 Loading...
            </div>
            
            {/* Test image */}
            <div className="border-2 border-gray-300 rounded p-4">
              <img
                src={format.url}
                alt={`Test ${format.name}`}
                className="w-full max-w-xs mx-auto block"
                onLoad={() => {
                  const statusEl = document.getElementById(`status-${index}`);
                  if (statusEl) {
                    statusEl.textContent = '✅ Loading Success';
                    statusEl.className = 'text-green-600 font-medium mb-4';
                  }
                }}
                onError={(e) => {
                  const statusEl = document.getElementById(`status-${index}`);
                  if (statusEl) {
                    statusEl.textContent = '❌ Loading Failed';
                    statusEl.className = 'text-red-600 font-medium mb-4';
                  }
                  (e.target as HTMLImageElement).style.border = '2px solid red';
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> The thumbnail format (w1000, w500, s1000) is generally more reliable 
              for embedding Google Drive images in websites. If none work, the image may not be properly shared.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>How to get File ID:</strong> From a Google Drive share link like 
              <code>https://drive.google.com/file/d/FILE_ID_HERE/view</code>, 
              copy the FILE_ID_HERE part.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}