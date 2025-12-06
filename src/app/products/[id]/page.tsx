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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-12 border border-gray-100 dark:border-gray-700">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Product Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative group"
            >
              <div className="aspect-square relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-inner">
                <ProductImage
                  src={product.image || product.imageUrl || ""}
                  alt={product.name}
                  fill
                  className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              {product.stock <= 0 && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  Out of Stock
                </div>
              )}
              {product.featured && (
                <div className="absolute top-4 left-4 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  Featured Product
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col h-full"
            >
              <div className="mb-6">
                <span className="inline-block px-3 py-1 rounded-full bg-lime-100 dark:bg-lime-900/30 text-lime-800 dark:text-lime-300 text-sm font-medium mb-3">
                  {product.category}
                </span>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">{product.name}</h1>

                {product.brand && (
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Brand: <span className="font-semibold text-gray-900 dark:text-white">{product.brand}</span>
                  </p>
                )}
              </div>

              <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-baseline mb-2">
                  <span className="text-4xl font-bold text-lime-600 dark:text-lime-400">${product.price.toFixed(2)}</span>
                  <span className="ml-2 text-gray-500 dark:text-gray-400">/ {product.unit || 'unit'}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                  {product.stock > 0 ? (
                    <>
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      In Stock ({product.stock} available)
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      Currently Out of Stock
                    </>
                  )}
                </p>
              </div>

              <div className="mb-8 prose dark:prose-invert max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                  {product.description}
                </p>
              </div>

              <div className="mt-auto">
                <div className="bg-gradient-to-r from-lime-50 to-green-50 dark:from-lime-900/20 dark:to-green-900/20 border border-lime-200 dark:border-lime-800 rounded-xl p-6 shadow-sm">
                  <div className="flex items-start">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-sm mr-4 text-lime-600 dark:text-lime-400">
                      <FiInfo className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        Wholesale Inquiry
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Interested in bulk pricing? Contact us directly for a custom quote.
                      </p>
                      <Link
                        href="/contact"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-lime-600 hover:bg-lime-700 transition-colors shadow-md hover:shadow-lg"
                      >
                        Contact Sales Team
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Product Specifications */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
            <span className="w-1 h-8 bg-lime-500 rounded-full mr-3"></span>
            Product Specifications
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700">
              <div className="p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Category</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{product.category}</p>
              </div>
              {product.brand && (
                <div className="p-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Brand</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{product.brand}</p>
                </div>
              )}
              <div className="p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Stock Status</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{product.stock} units</p>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Unit Type</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{product.unit || 'Standard'}</p>
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
        <div className="mb-12">
          <ProductAIHelper
            productName={product.name}
            productDescription={product.description}
          />
        </div>
      </div>
    </div>
  );
}