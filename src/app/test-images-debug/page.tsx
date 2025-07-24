'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ProductImage from '@/components/ProductImage';

interface Product {
  id: string;
  name: string;
  image: string;
  imageUrl?: string;
}

export default function TestImagesDebugPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollection = collection(db, 'products');
        const productsSnapshot = await getDocs(productsCollection);
        
        const productsData = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const testUrls = [
    {
      name: 'Original Google Drive URL',
      url: 'https://drive.google.com/file/d/12tUUp-6A5cIe2NMOCk9oVqgGrjqO1pSz/view?usp=drive_link'
    },
    {
      name: 'Direct view URL',
      url: 'https://drive.google.com/uc?export=view&id=12tUUp-6A5cIe2NMOCk9oVqgGrjqO1pSz'
    },
    {
      name: 'Thumbnail URL',
      url: 'https://drive.google.com/thumbnail?id=12tUUp-6A5cIe2NMOCk9oVqgGrjqO1pSz&sz=w1000'
    },
    {
      name: 'Lh3 Google User Content',
      url: 'https://lh3.googleusercontent.com/d/12tUUp-6A5cIe2NMOCk9oVqgGrjqO1pSz'
    }
  ];

  if (loading) {
    return <div className="p-8 text-center">Loading products...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Image Debug Test</h1>
        
        {/* Test Different URL Formats */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Testing Different Google Drive URL Formats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testUrls.map((test, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium mb-2 text-sm">{test.name}</h3>
                <div className="h-48 bg-gray-100 rounded mb-2">
                  <ProductImage
                    src={test.url}
                    alt={test.name}
                    fill
                    className="h-full w-full"
                  />
                </div>
                <div className="text-xs text-gray-500 break-all">{test.url}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Actual Products from Database */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Products from Database ({products.length} total)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium mb-2 text-sm truncate">{product.name}</h3>
                <div className="h-48 bg-gray-100 rounded mb-2">
                  <ProductImage
                    src={product.imageUrl || product.image || '/placeholder-product.svg'}
                    alt={product.name}
                    fill
                    className="h-full w-full"
                  />
                </div>
                <div className="text-xs text-gray-500 break-all">
                  {product.imageUrl || product.image || 'No image URL'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Raw Image Test */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Raw Image Test (HTML img tags)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testUrls.map((test, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium mb-2 text-sm">{test.name}</h3>
                <div className="h-48 bg-gray-100 rounded mb-2 overflow-hidden">
                  <img
                    src={test.url}
                    alt={test.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error(`Failed to load: ${test.url}`);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                    onLoad={() => console.log(`Successfully loaded: ${test.url}`)}
                  />
                </div>
                <div className="text-xs text-gray-500 break-all">{test.url}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}