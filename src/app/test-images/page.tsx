'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';

export default function TestImagesPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollection = collection(db, 'products');
        const productsSnapshot = await getDocs(productsCollection);
        const productsData = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="p-8">Loading products...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Image Loading Test</h1>
      
      <div className="grid gap-8">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg p-6 bg-white shadow-lg">
            <h2 className="text-xl font-semibold mb-4">{product.name}</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Product Details:</h3>
                <ul className="text-sm space-y-1">
                  <li><strong>ID:</strong> {product.id}</li>
                  <li><strong>Price:</strong> ${product.price}</li>
                  <li><strong>Category:</strong> {product.category}</li>
                  <li><strong>Stock:</strong> {product.stock}</li>
                </ul>
                
                <h3 className="font-medium mb-2 mt-4">Image URL:</h3>
                <div className="bg-gray-100 p-2 rounded text-xs break-all">
                  {product.image}
                </div>
                
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => window.open(product.image, '_blank')}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    Open Image in New Tab
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Image Preview:</h3>
                
                {/* Using regular img tag */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Regular img tag:</p>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full max-w-xs border-2 border-red-300 rounded"
                    onLoad={() => console.log(`✅ Image loaded for ${product.name}`)}
                    onError={(e) => {
                      console.error(`❌ Image failed to load for ${product.name}:`, e);
                      (e.target as HTMLImageElement).style.border = '2px solid red';
                    }}
                  />
                </div>
                
                {/* Using Next.js Image component */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Next.js Image:</p>
                  <div className="relative w-full max-w-xs h-48 border-2 border-green-300 rounded overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      onLoad={() => console.log(`✅ Next.js Image loaded for ${product.name}`)}
                      onError={(e) => {
                        console.error(`❌ Next.js Image failed to load for ${product.name}:`, e);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">Debug Info:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Red border = Regular img tag</li>
          <li>• Green border = Next.js Image component</li>
          <li>• Check browser developer tools console for loading errors</li>
          <li>• Try opening image URLs in new tabs to test direct access</li>
        </ul>
      </div>
    </div>
  );
}