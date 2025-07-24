import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc, addDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Fixing products issue...');
    
    // Step 1: Clear existing products
    const productsRef = collection(db, 'products');
    const existingProducts = await getDocs(productsRef);
    
    console.log(`🗑️ Clearing ${existingProducts.docs.length} existing products...`);
    
    const deletePromises = existingProducts.docs.map(productDoc => 
      deleteDoc(doc(db, 'products', productDoc.id))
    );
    await Promise.all(deletePromises);
    
    // Step 2: Add sample products for testing
    const sampleProducts = [
      {
        name: "Basmati Rice Premium 20lb",
        description: "Premium quality aged Basmati rice, perfect for biryanis and pilafs",
        price: 25.99,
        category: "Rice & Grains",
        imageUrl: "/images/basmati-rice.jpg",
        image: "/images/basmati-rice.jpg",
        stock: 50,
        unit: "20lb bag",
        featured: true,
        brand: "Shreeji",
        minOrderQuantity: 1,
        createdAt: new Date()
      },
      {
        name: "Turmeric Powder 1lb",
        description: "Pure turmeric powder, freshly ground from premium turmeric roots",
        price: 8.99,
        category: "Spices",
        imageUrl: "/images/turmeric.jpg",
        image: "/images/turmeric.jpg",
        stock: 100,
        unit: "1lb container",
        featured: true,
        brand: "Shreeji",
        minOrderQuantity: 1,
        createdAt: new Date()
      },
      {
        name: "Red Lentils (Masoor Dal) 4lb",
        description: "High-quality red lentils, perfect for dal and soups",
        price: 12.99,
        category: "Lentils & Beans",
        imageUrl: "/images/red-lentils.jpg",
        image: "/images/red-lentils.jpg",
        stock: 75,
        unit: "4lb bag",
        featured: false,
        brand: "Shreeji",
        minOrderQuantity: 1,
        createdAt: new Date()
      },
      {
        name: "Garam Masala Blend 8oz",
        description: "Authentic garam masala blend with traditional spices",
        price: 6.99,
        category: "Spices",
        imageUrl: "/images/garam-masala.jpg",
        image: "/images/garam-masala.jpg",
        stock: 60,
        unit: "8oz container",
        featured: false,
        brand: "Shreeji",
        minOrderQuantity: 1,
        createdAt: new Date()
      },
      {
        name: "Chickpeas (Chana) 5lb",
        description: "Premium quality chickpeas, perfect for curries and snacks",
        price: 15.99,
        category: "Lentils & Beans",
        imageUrl: "/images/chickpeas.jpg",
        image: "/images/chickpeas.jpg",
        stock: 40,
        unit: "5lb bag",
        featured: true,
        brand: "Shreeji",
        minOrderQuantity: 1,
        createdAt: new Date()
      }
    ];
    
    console.log('➕ Adding sample products...');
    
    const addPromises = sampleProducts.map(product => 
      addDoc(collection(db, 'products'), product)
    );
    
    const addedProducts = await Promise.all(addPromises);
    
    console.log(`✅ Added ${addedProducts.length} sample products`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully added ${addedProducts.length} sample products`,
      productsAdded: addedProducts.length,
      products: sampleProducts.map((product, index) => ({
        id: addedProducts[index].id,
        name: product.name,
        price: product.price,
        category: product.category
      }))
    });
    
  } catch (error) {
    console.error('❌ Error fixing products:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fix products'
    }, { status: 500 });
  }
}