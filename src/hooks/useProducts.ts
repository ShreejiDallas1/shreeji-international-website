'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit, startAfter, doc, getDoc } from 'firebase/firestore';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  imageUrl?: string;
  stock: number;
  brand?: string;
  featured?: boolean;
  sku?: string;
  unit?: string;
  minOrderQuantity?: number;
  createdAt?: Date;
};

export function useProducts(categoryFilter?: string, searchQuery?: string, limitCount: number = 12) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  // Initial fetch
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const productsQuery = collection(db, 'products');
        const constraints = [];

        if (categoryFilter) {
          constraints.push(where('category', '==', categoryFilter));
        }

        // Add search functionality if searchQuery is provided
        // Note: This is a simple implementation. For production, consider using a dedicated search service
        if (searchQuery && searchQuery.trim() !== '') {
          // This is a simple contains search - Firestore doesn't support this natively
          // For production, consider using Algolia, Elasticsearch, or Firebase Extensions
          constraints.push(where('searchKeywords', 'array-contains', searchQuery.toLowerCase()));
        }

        constraints.push(orderBy('createdAt', 'desc'));
        constraints.push(limit(limitCount));

        const q = query(productsQuery, ...constraints);
        const querySnapshot = await getDocs(q);
        
        const fetchedProducts: Product[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const product = {
            id: doc.id,
            name: data.name,
            description: data.description,
            price: data.price,
            category: data.category,
            image: data.image,
            imageUrl: data.imageUrl,
            stock: data.stock || 0, // Ensure stock is a number, default to 0
            brand: data.brand,
            featured: data.featured,
            createdAt: data.createdAt?.toDate() || new Date(),
          };
          
          // Debug logging for product ID "1"
          if (doc.id === '1') {
            console.log('🐛 Product ID "1" from Firestore:', product);
          }
          
          fetchedProducts.push(product);
        });

        setProducts(fetchedProducts);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
        setHasMore(querySnapshot.docs.length === limitCount);
      } catch (err: unknown) {
        console.error('Error fetching products:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryFilter, searchQuery, limitCount]);

  // Function to load more products
  const loadMore = async () => {
    if (!lastVisible || !hasMore) return;

    setLoading(true);
    setError(null);
    try {
      const productsQuery = collection(db, 'products');
      const constraints = [];

      if (categoryFilter) {
        constraints.push(where('category', '==', categoryFilter));
      }

      if (searchQuery && searchQuery.trim() !== '') {
        constraints.push(where('searchKeywords', 'array-contains', searchQuery.toLowerCase()));
      }

      constraints.push(orderBy('createdAt', 'desc'));
      constraints.push(startAfter(lastVisible));
      constraints.push(limit(limitCount));

      const q = query(productsQuery, ...constraints);
      const querySnapshot = await getDocs(q);
      
      const fetchedProducts: Product[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const product = {
          id: doc.id,
          name: data.name,
          description: data.description,
          price: data.price,
          category: data.category,
          image: data.image,
          stock: data.stock || 0, // Ensure stock is a number, default to 0
          brand: data.brand,
          featured: data.featured,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
        
        // Debug logging for product ID "1"
        if (doc.id === '1') {
          console.log('🐛 Product ID "1" from Firestore (loadMore):', product);
        }
        
        fetchedProducts.push(product);
      });

      setProducts(prev => [...prev, ...fetchedProducts]);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
      setHasMore(querySnapshot.docs.length === limitCount);
    } catch (err: unknown) {
      console.error('Error fetching more products:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch more products';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Function to get a single product by ID
  const getProductById = async (productId: string): Promise<Product | null> => {
    try {
      const productDoc = await getDoc(doc(db, 'products', productId));
      
      if (productDoc.exists()) {
        const data = productDoc.data();
        const product = {
          id: productDoc.id,
          name: data.name,
          description: data.description,
          price: data.price,
          category: data.category,
          image: data.image,
          stock: data.stock || 0, // Ensure stock is a number, default to 0
          brand: data.brand,
          featured: data.featured,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
        
        // Debug logging for product ID "1"
        if (productDoc.id === '1') {
          console.log('🐛 Product ID "1" from Firestore (getById):', product);
        }
        
        return product;
      }
      return null;
    } catch (err) {
      console.error('Error fetching product:', err);
      return null;
    }
  };

  return {
    products,
    loading,
    error,
    hasMore,
    loadMore,
    getProductById,
  };
}