const { GoogleGenerativeAI } = require('@google/generative-ai');
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: 'shreeji-international',
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

const db = admin.firestore();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI('AIzaSyATLEa2r0vp0jRcqL3gqW2u8iYJJYRJfV8');

async function generateBrightCategories() {
  try {
    console.log('🚀 Starting bright category generation...');

    // Get all unique categories from products
    const productsSnapshot = await db.collection('products').get();
    const categories = new Set();
    
    productsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.category) {
        categories.add(data.category);
      }
    });

    const categoryList = Array.from(categories);
    console.log(`📊 Found ${categoryList.length} categories:`, categoryList);

    if (categoryList.length === 0) {
      console.log('❌ No categories found in products');
      return;
    }

    // Enhanced AI prompt for bright colors and perfect emojis
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
    You are helping create categories for "Shreeji International" - an Indian grocery wholesale business.
    
    For each category, provide:
    1. The PERFECT emoji (most relevant and eye-catching)
    2. Professional description (10-15 words)
    3. BRIGHT, VIBRANT color gradient from Tailwind CSS
    
    Categories: ${categoryList.join(', ')}
    
    Format as JSON array:
    [
      {
        "name": "category name",
        "emoji": "🌶️",
        "description": "Premium spices and seasonings for authentic Indian flavors",
        "color": "from-red-500 to-orange-500"
      }
    ]
    
    CRITICAL REQUIREMENTS:
    - Use PERFECT emojis: 🌶️ for spices, 🌾 for grains, 🥥 for oils, 🫘 for lentils, etc.
    - Use BRIGHT, VIBRANT gradients like:
      * from-red-500 to-pink-500
      * from-orange-500 to-yellow-500  
      * from-green-500 to-emerald-500
      * from-blue-500 to-cyan-500
      * from-purple-500 to-indigo-500
      * from-yellow-500 to-orange-600
      * from-teal-500 to-green-500
      * from-rose-500 to-red-500
      * from-violet-500 to-purple-500
      * from-cyan-500 to-blue-500
    - Each category gets a DIFFERENT bright color combination
    - Make descriptions business-focused and appealing
    `;

    console.log('🤖 Generating categories with AI...');
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse AI response
    let aiCategories;
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        aiCategories = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON array found in response');
      }
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError);
      console.log('📝 Raw AI response:', text);
      return;
    }

    console.log(`✨ Generated ${aiCategories.length} categories with AI`);

    // Clear existing categories
    console.log('🗑️ Clearing existing categories...');
    const existingCategories = await db.collection('categories').get();
    const deletePromises = existingCategories.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    // Save new categories with product counts
    console.log('💾 Saving new bright categories...');
    const savePromises = aiCategories.map(async (category) => {
      const productCount = categoryList.filter(cat => 
        cat.toLowerCase() === category.name.toLowerCase()
      ).length > 0 ? 
        productsSnapshot.docs.filter(doc => 
          doc.data().category?.toLowerCase() === category.name.toLowerCase()
        ).length : 0;

      const categoryData = {
        name: category.name,
        emoji: category.emoji,
        description: category.description,
        color: category.color,
        productCount: productCount,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      
      console.log(`💫 ${category.emoji} ${category.name} - ${category.color} (${productCount} products)`);
      
      return db.collection('categories').add(categoryData);
    });

    await Promise.all(savePromises);

    console.log('🎉 SUCCESS! Generated bright categories with perfect emojis!');
    console.log('🌈 Categories now have vibrant colors and AI-selected emojis');
    
  } catch (error) {
    console.error('❌ Error generating categories:', error);
  }
}

// Run the script
generateBrightCategories()
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });