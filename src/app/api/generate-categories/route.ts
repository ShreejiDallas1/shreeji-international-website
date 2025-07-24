import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    // Get all unique categories from products
    const productsRef = collection(db, 'products');
    const productsSnapshot = await getDocs(productsRef);
    
    const existingCategories = new Set<string>();
    productsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.category) {
        existingCategories.add(data.category.toLowerCase().trim());
      }
    });

    const categoryList = Array.from(existingCategories);
    
    if (categoryList.length === 0) {
      return NextResponse.json({ error: 'No categories found in products' }, { status: 400 });
    }

    // Use Gemini to generate emojis and descriptions for categories
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
    You are helping create categories for an Indian grocery wholesale business called "Shreeji International".
    
    For each of these product categories, provide:
    1. The PERFECT emoji (just one emoji, most relevant and eye-catching)
    2. A short, professional description (10-15 words)
    3. A bright, vibrant color gradient (from tailwind CSS)
    
    Categories: ${categoryList.join(', ')}
    
    Format your response as JSON array like this:
    [
      {
        "name": "category name",
        "emoji": "🌶️",
        "description": "Premium spices and seasonings for authentic Indian flavors",
        "color": "from-red-500 to-orange-500"
      }
    ]
    
    IMPORTANT RULES:
    - Choose the MOST RELEVANT emoji for each category (🌶️ for spices, 🌾 for grains, 🥥 for oils, etc.)
    - Use BRIGHT, VIBRANT color gradients like:
      * from-red-500 to-pink-500
      * from-orange-500 to-yellow-500  
      * from-green-500 to-emerald-500
      * from-blue-500 to-cyan-500
      * from-purple-500 to-indigo-500
      * from-yellow-500 to-orange-500
      * from-teal-500 to-green-500
      * from-rose-500 to-red-500
    - Make descriptions business-focused and appealing
    - Capitalize category names properly
    - Each category should have a DIFFERENT bright color combination
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Gemini');
    }
    
    const generatedCategories = JSON.parse(jsonMatch[0]);
    
    // Process categories and count products (no Firebase save)
    const generatedData = [];
    
    for (const category of generatedCategories) {
      // Count products in this category
      const productsInCategory = Array.from(productsSnapshot.docs).filter(doc => 
        doc.data().category?.toLowerCase().trim() === category.name.toLowerCase()
      );
      
      const categoryData = {
        name: category.name,
        emoji: category.emoji,
        description: category.description,
        color: category.color,
        productCount: productsInCategory.length
      };
      
      generatedData.push(categoryData);
      console.log(`${category.emoji} ${category.name} - ${category.color} (${productsInCategory.length} products)`);
    }

    return NextResponse.json({ 
      success: true, 
      categories: generatedData,
      message: `Generated ${generatedData.length} categories with AI`
    });

  } catch (error) {
    console.error('Error generating categories:', error);
    return NextResponse.json({ 
      error: 'Failed to generate categories',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Return existing categories
    const categoriesRef = collection(db, 'categories');
    const categoriesSnapshot = await getDocs(categoriesRef);
    
    const categories = categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}