'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAppContext } from '@/lib/context';
import Button from '@/components/Button';
import ProductImage from '@/components/ProductImage';
import ProductAIHelper from '@/components/ProductAIHelper';
import { FiArrowLeft, FiInfo, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';

// Product type
type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  imageUrl?: string;
  stock: number;
  unit?: string;
  brand?: string;
  featured?: boolean;
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Commented out unused state
  // const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  
  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const productId = Array.isArray(id) ? id[0] : id;
        if (!productId) return;
        const productDoc = await getDoc(doc(db, 'products', productId));
        
        if (productDoc.exists()) {
          const productData = productDoc.data() as Product;
          const fullProduct = {
            ...productData,
            id: productDoc.id,
          };
          

          
          setProduct(fullProduct);
          
          // TODO: Fetch related products based on category
          // This would be implemented with a query to Firestore
        } else {
          // Product not found
          console.error('Product not found');
          router.push('/products');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProduct();
    }
  }, [id, router]);
  

  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-500"></div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="mb-6">The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Button variant="primary">
          <Link href="/products">Back to Products</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-lime-600 dark:hover:text-lime-400">
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400 dark:text-gray-500">/</span>
                <Link href="/products" className="text-gray-600 dark:text-gray-300 hover:text-lime-600 dark:hover:text-lime-400">
                  Products
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400 dark:text-gray-500">/</span>
                <Link href={`/products?category=${product.category}`} className="text-gray-600 dark:text-gray-300 hover:text-lime-600 dark:hover:text-lime-400">
                  {product.category}
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400 dark:text-gray-500">/</span>
                <span className="text-gray-500 dark:text-gray-400">{product.name}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
      
      {/* Back Button */}
      <div className="mb-6">
        <Button 
          variant="outline" 
          size="sm"
          leftIcon={<FiArrowLeft />}
          onClick={() => router.back()}
        >
          Back
        </Button>
      </div>
      
      {/* Product Details */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-12">
        <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="h-80 md:h-96 lg:h-[500px] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
            <ProductImage
              src={product.image || product.imageUrl || ""}
              alt={product.name}
              fill
              className="w-full h-full"
            />
          </div>
          {product.stock <= 0 && (
            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Out of Stock
            </div>
          )}
          {product.featured && (
            <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Featured
            </div>
          )}
        </motion.div>
        
        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h1>
          
          {product.brand && (
            <p className="text-gray-600 dark:text-gray-300 mb-4">Brand: <span className="font-medium text-gray-800 dark:text-gray-200">{product.brand}</span></p>
          )}
          
          <div className="mb-6">
            <p className="text-2xl font-bold text-orange-500 dark:text-orange-400">${product.price.toFixed(2)}</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {product.stock > 0 
                ? `In Stock: ${product.stock} units available` 
                : 'Currently Out of Stock'}
            </p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{product.description}</p>
          </div>
          

          
          <div className="mt-auto">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center">
                <FiInfo className="h-5 w-5 text-blue-500 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Shopping Coming Soon
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                    Online ordering will be available soon. Please contact us directly for orders.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        </div>
      </div>
      
      {/* Product Details */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">Product Specifications</h3>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md border border-gray-100 dark:border-gray-600">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Category</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{product.category}</p>
            </div>
            {product.brand && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md border border-gray-100 dark:border-gray-600">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Brand</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">{product.brand}</p>
              </div>
            )}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md border border-gray-100 dark:border-gray-600">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Stock</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{product.stock} units</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md border border-gray-100 dark:border-gray-600">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Unit</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{product.unit}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Related Products */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Related Products</h2>
        <p className="text-gray-600 italic">Coming soon...</p>
      </div>
      
      {/* AI Helper */}
      <ProductAIHelper 
        productName={product.name}
        productDescription={product.description}
      />
      </div>
    </div>
  );
}