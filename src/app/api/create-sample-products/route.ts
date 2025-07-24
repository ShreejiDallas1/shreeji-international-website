import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const sampleProducts = [
  {
    name: "Premium Basmati Rice - 20lb",
    description: "Authentic long-grain basmati rice from India. Perfect for biryanis and pilafs.",
    price: 24.99,
    category: "Rice & Grains",
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
    stock: 50,
    unit: "20lb bag",
    featured: true,
    brand: "Shreeji Premium",
    minOrderQuantity: 1,
    squareId: "sample_basmati_rice"
  },
  {
    name: "Turmeric Powder - 1lb",
    description: "Pure ground turmeric powder. Essential spice for Indian cooking.",
    price: 8.99,
    category: "Spices",
    imageUrl: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400",
    stock: 100,
    unit: "1lb container",
    featured: true,
    brand: "Shreeji Spices",
    minOrderQuantity: 1,
    squareId: "sample_turmeric"
  },
  {
    name: "Red Lentils (Masoor Dal) - 4lb",
    description: "High-quality red lentils, perfect for dal and soups.",
    price: 12.99,
    category: "Lentils & Pulses",
    imageUrl: "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=400",
    stock: 75,
    unit: "4lb bag",
    featured: true,
    brand: "Shreeji Premium",
    minOrderQuantity: 1,
    squareId: "sample_red_lentils"
  },
  {
    name: "Coconut Oil - 32oz",
    description: "Pure cold-pressed coconut oil for cooking and health.",
    price: 15.99,
    category: "Oils & Ghee",
    imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400",
    stock: 30,
    unit: "32oz jar",
    featured: false,
    brand: "Shreeji Natural",
    minOrderQuantity: 1,
    squareId: "sample_coconut_oil"
  },
  {
    name: "Whole Wheat Flour - 10lb",
    description: "Stone-ground whole wheat flour for rotis and breads.",
    price: 18.99,
    category: "Flours",
    imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400",
    stock: 40,
    unit: "10lb bag",
    featured: false,
    brand: "Shreeji Mills",
    minOrderQuantity: 1,
    squareId: "sample_wheat_flour"
  },
  {
    name: "Garam Masala - 8oz",
    description: "Authentic blend of aromatic spices for Indian dishes.",
    price: 11.99,
    category: "Spices",
    imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400",
    stock: 60,
    unit: "8oz container",
    featured: true,
    brand: "Shreeji Spices",
    minOrderQuantity: 1,
    squareId: "sample_garam_masala"
  }
];

export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Creating sample products...');
    
    const productsCollection = collection(db, 'products');
    let createdCount = 0;
    
    for (const product of sampleProducts) {
      const productData = {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        syncedFromSquare: false,
        sampleProduct: true
      };
      
      await addDoc(productsCollection, productData);
      createdCount++;
      console.log(`✅ Created: ${product.name}`);
    }
    
    console.log(`🎉 Successfully created ${createdCount} sample products`);
    
    return NextResponse.json({
      success: true,
      message: `Created ${createdCount} sample products`,
      productsCount: createdCount
    });
    
  } catch (error) {
    console.error('❌ Error creating sample products:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create sample products',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}