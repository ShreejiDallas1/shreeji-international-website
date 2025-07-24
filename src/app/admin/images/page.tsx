'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';
import { useAppContext } from '@/lib/context';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UploadResult } from '@/lib/storage';
import ImageUpload from '@/components/ImageUpload';
import ProductImage from '@/components/ProductImage';
import { FiImage, FiRefreshCw, FiCheck, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  imageUrl?: string;
  category: string;
  price: number;
}

export default function AdminImagesPage() {
  const router = useRouter();
  const { user } = useAppContext();
  const { isAdmin } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/admin/images');
      return;
    }

    if (!isAdmin) {
      router.push('/');
      return;
    }

    fetchProducts();
  }, [user, isAdmin, router]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsCollection = collection(db, 'products');
      const productsSnapshot = await getDocs(productsCollection);
      const productsList = productsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Unnamed Product',
          category: data.category || 'Uncategorized',
          price: data.price || 0,
          // Handle both imageUrl and image fields
          imageUrl: data.imageUrl || data.image || '',
          ...data
        };
      }) as Product[];
      
      setProducts(productsList.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = async (productId: string, result: UploadResult) => {
    try {
      setUploading(productId);
      
      // Update product in Firestore - save to both imageUrl and image fields for compatibility
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        imageUrl: result.url,
        image: result.url, // Also update the image field for compatibility
        imagePath: result.path,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      setProducts(prev => prev.map(p => 
        p.id === productId 
          ? { ...p, imageUrl: result.url }
          : p
      ));

      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product with new image');
    } finally {
      setUploading(null);
    }
  };

  const handleUploadError = (error: string) => {
    toast.error(error);
    setUploading(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Product Images Management
        </h1>
        <button
          onClick={fetchProducts}
          className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          <FiRefreshCw className="mr-2" />
          Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <FiImage className="mr-2" />
            Upload Product Images ({products.length} products)
          </h2>
        </div>

        {products.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <FiImage className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg">No products found</p>
            <p className="text-sm">Add products first to upload images</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <div 
                  key={product.id} 
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4"
                >
                  {/* Product Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {product.category} • ${product.price}
                    </p>
                    <div className="text-xs text-gray-500 mt-1 font-mono">
                      ID: {product.id}
                    </div>
                  </div>

                  {/* Current Image Preview */}
                  <div className="relative">
                    <ProductImage
                      src={product.imageUrl || ''}
                      alt={product.name}
                      width={200}
                      height={150}
                      className="w-full h-32"
                    />
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      {product.imageUrl && product.imageUrl.includes('firebasestorage') ? (
                        <div className="bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center">
                          <FiCheck className="mr-1 h-3 w-3" />
                          Firebase
                        </div>
                      ) : product.imageUrl && product.imageUrl.includes('drive.google.com') ? (
                        <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center">
                          <FiCheck className="mr-1 h-3 w-3" />
                          Google Drive
                        </div>
                      ) : product.imageUrl ? (
                        <div className="bg-purple-500 text-white text-xs px-2 py-1 rounded flex items-center">
                          <FiCheck className="mr-1 h-3 w-3" />
                          External
                        </div>
                      ) : (
                        <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded flex items-center">
                          <FiX className="mr-1 h-3 w-3" />
                          No Image
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload Component */}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <ImageUpload
                      onUploadSuccessAction={(result) => handleUploadSuccess(product.id, result)}
                      onUploadError={handleUploadError}
                      folder="products"
                      currentImageUrl={product.imageUrl}
                      disabled={uploading === product.id}
                    />
                    
                    {uploading === product.id && (
                      <div className="mt-2 text-center">
                        <div className="inline-flex items-center text-sm text-lime-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-lime-500 mr-2"></div>
                          Saving to database...
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              How to Upload Product Images
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <ol className="list-decimal list-inside space-y-1">
                <li>Each product card shows its current image (or placeholder)</li>
                <li>Drag and drop an image file or click to browse</li>
                <li>Images are automatically uploaded to Firebase Storage</li>
                <li>Supported formats: JPEG, PNG, WebP (max 5MB)</li>
                <li>Images will appear immediately on the website</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}