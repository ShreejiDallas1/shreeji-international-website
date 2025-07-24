'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ProductImage from '@/components/ProductImage';

interface Product {
  id: string;
  name: string;
  image: string;
  imageUrl?: string;
  category: string;
}

export default function DebugImagesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fixing, setFixing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const productsRef = collection(db, 'products');
      const productsSnapshot = await getDocs(productsRef);
      
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

  const fixImageUrls = async () => {
    setFixing(true);
    let fixed = 0;

    for (const product of products) {
      try {
        let shouldUpdate = false;
        const updates: any = {};

        // If image field has Google Drive URL but imageUrl doesn't exist or is empty
        if (product.image && product.image.includes('drive.google.com')) {
          let fileId = null;
          
          // Extract file ID from Google Drive URL
          if (product.image.includes('/file/d/')) {
            fileId = product.image.split('/file/d/')[1]?.split('/')[0];
          } else if (product.image.includes('open?id=')) {
            fileId = product.image.split('open?id=')[1]?.split('&')[0];
          } else if (product.image.includes('thumbnail?id=')) {
            fileId = product.image.split('thumbnail?id=')[1]?.split('&')[0];
          }

          if (fileId) {
            const directUrl = `https://lh3.googleusercontent.com/d/${fileId}=w1000`;
            updates.imageUrl = directUrl;
            shouldUpdate = true;
          }
        }

        // If no imageUrl but has image, copy it
        if (!product.imageUrl && product.image && !product.image.includes('drive.google.com')) {
          updates.imageUrl = product.image;
          shouldUpdate = true;
        }

        if (shouldUpdate) {
          const productRef = doc(db, 'products', product.id);
          await updateDoc(productRef, updates);
          fixed++;
          console.log(`Fixed ${product.name}: ${JSON.stringify(updates)}`);
        }
      } catch (error) {
        console.error(`Error fixing ${product.name}:`, error);
      }
    }

    alert(`Fixed ${fixed} product images!`);
    await fetchProducts(); // Refresh data
    setFixing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500 mx-auto mb-4"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Debug Product Images</h1>
          <button
            onClick={fixImageUrls}
            disabled={fixing}
            className="bg-lime-600 hover:bg-lime-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {fixing ? 'Fixing Images...' : 'Fix All Image URLs'}
          </button>
          <p className="text-gray-600 mt-2">
            Total products: {products.length}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="relative h-48 mb-4">
                <ProductImage
                  src={product.imageUrl || product.image || ''}
                  alt={product.name}
                  width={300}
                  height={200}
                  className="rounded-lg w-full h-full object-cover"
                />
              </div>
              
              <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-2">Category: {product.category}</p>
              
              <div className="text-xs text-gray-500 space-y-1">
                <div>
                  <strong>image:</strong> 
                  <span className={`ml-1 ${product.image ? 'text-green-600' : 'text-red-600'}`}>
                    {product.image ? '✓' : '✗'} {product.image ? product.image.substring(0, 50) + '...' : 'None'}
                  </span>
                </div>
                <div>
                  <strong>imageUrl:</strong> 
                  <span className={`ml-1 ${product.imageUrl ? 'text-green-600' : 'text-red-600'}`}>
                    {product.imageUrl ? '✓' : '✗'} {product.imageUrl ? product.imageUrl.substring(0, 50) + '...' : 'None'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}