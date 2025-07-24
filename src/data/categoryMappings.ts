// Smart category mappings with perfect emojis and bright colors
export const categoryMappings: { [key: string]: { emoji: string; color: string; description: string } } = {
  // Rice varieties
  'rice': { emoji: '🌾', color: 'from-yellow-500 to-orange-600', description: 'Premium basmati and specialty rice varieties' },
  'basmati rice': { emoji: '🌾', color: 'from-yellow-500 to-orange-600', description: 'Premium basmati and specialty rice varieties' },
  'jasmine rice': { emoji: '🌾', color: 'from-yellow-400 to-orange-500', description: 'Fragrant jasmine and aromatic rice' },
  
  // Spices
  'spices': { emoji: '🌶️', color: 'from-red-500 to-orange-500', description: 'Authentic Indian spices and seasonings' },
  'spice': { emoji: '🌶️', color: 'from-red-500 to-orange-500', description: 'Authentic Indian spices and seasonings' },
  'masala': { emoji: '🌶️', color: 'from-red-600 to-pink-500', description: 'Traditional spice blends and masalas' },
  'chili': { emoji: '🌶️', color: 'from-red-500 to-rose-500', description: 'Hot chilies and pepper varieties' },
  'turmeric': { emoji: '💛', color: 'from-yellow-500 to-amber-500', description: 'Pure turmeric powder and whole' },
  
  // Oils
  'oil': { emoji: '🫒', color: 'from-green-500 to-emerald-500', description: 'Pure cooking oils and traditional ghee' },
  'oils': { emoji: '🫒', color: 'from-green-500 to-emerald-500', description: 'Pure cooking oils and traditional ghee' },
  'coconut oil': { emoji: '🥥', color: 'from-green-400 to-teal-500', description: 'Pure coconut oil for cooking and health' },
  'mustard oil': { emoji: '🫒', color: 'from-yellow-600 to-orange-500', description: 'Traditional mustard oil for authentic flavors' },
  
  // Lentils and Pulses
  'lentils': { emoji: '🫘', color: 'from-orange-500 to-yellow-500', description: 'High-quality lentils and pulses for protein' },
  'dal': { emoji: '🫘', color: 'from-orange-600 to-red-500', description: 'Premium dal varieties and split lentils' },
  'pulses': { emoji: '🫘', color: 'from-amber-500 to-orange-600', description: 'Nutritious pulses and legumes' },
  'chickpeas': { emoji: '🫘', color: 'from-yellow-600 to-orange-500', description: 'Fresh chickpeas and garbanzo beans' },
  
  // Flour and Grains
  'flour': { emoji: '🌾', color: 'from-blue-500 to-cyan-500', description: 'Fresh ground flours and baking essentials' },
  'atta': { emoji: '🌾', color: 'from-blue-400 to-indigo-500', description: 'Whole wheat atta and specialty flours' },
  'grains': { emoji: '🌾', color: 'from-cyan-500 to-blue-500', description: 'Whole grains and cereals for healthy meals' },
  'wheat': { emoji: '🌾', color: 'from-amber-600 to-yellow-600', description: 'Quality wheat products and flour' },
  
  // Snacks
  'snacks': { emoji: '🍿', color: 'from-purple-500 to-indigo-500', description: 'Traditional Indian snacks and namkeens' },
  'namkeen': { emoji: '🥜', color: 'from-orange-600 to-red-500', description: 'Crispy namkeens and savory snacks' },
  'chips': { emoji: '🥔', color: 'from-yellow-500 to-orange-600', description: 'Crispy chips and fried snacks' },
  
  // Sweets
  'sweets': { emoji: '🍬', color: 'from-pink-500 to-rose-500', description: 'Authentic Indian sweets and desserts' },
  'mithai': { emoji: '🧁', color: 'from-pink-600 to-purple-500', description: 'Traditional mithai and festive sweets' },
  'jaggery': { emoji: '🍯', color: 'from-amber-500 to-orange-600', description: 'Pure jaggery and natural sweeteners' },
  
  // Beverages
  'tea': { emoji: '🍵', color: 'from-teal-500 to-green-500', description: 'Premium teas and beverages' },
  'coffee': { emoji: '☕', color: 'from-brown-600 to-amber-700', description: 'Quality coffee beans and instant coffee' },
  'beverages': { emoji: '🥤', color: 'from-blue-600 to-purple-500', description: 'Refreshing drinks and beverages' },
  
  // Dairy
  'dairy': { emoji: '🥛', color: 'from-violet-500 to-purple-500', description: 'Fresh dairy products and alternatives' },
  'milk': { emoji: '🥛', color: 'from-blue-300 to-indigo-400', description: 'Pure milk and dairy essentials' },
  'ghee': { emoji: '🧈', color: 'from-yellow-400 to-amber-500', description: 'Pure ghee and clarified butter' },
  
  // Vegetables and Pickles
  'pickles': { emoji: '🥒', color: 'from-green-600 to-lime-500', description: 'Traditional pickles and preserved foods' },
  'vegetables': { emoji: '🥬', color: 'from-green-500 to-emerald-600', description: 'Fresh vegetables and greens' },
  
  // Generic/Others
  'food': { emoji: '🍽️', color: 'from-orange-500 to-red-500', description: 'Premium food products and groceries' },
  'grocery': { emoji: '🛒', color: 'from-indigo-500 to-purple-600', description: 'Essential grocery items and supplies' },
  'organic': { emoji: '🌱', color: 'from-green-400 to-emerald-500', description: 'Organic and natural food products' },
  'specialty': { emoji: '⭐', color: 'from-purple-600 to-pink-500', description: 'Special and premium food items' }
};

// Function to get category info with fallback
export function getCategoryInfo(categoryName: string) {
  const normalizedName = categoryName.toLowerCase().trim();
  
  // Direct match
  if (categoryMappings[normalizedName]) {
    return categoryMappings[normalizedName];
  }
  
  // Partial match
  for (const [key, value] of Object.entries(categoryMappings)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return value;
    }
  }
  
  // Default fallback
  return {
    emoji: '🍽️',
    color: 'from-slate-500 to-gray-600',
    description: `Quality ${categoryName.toLowerCase()} for your business needs`
  };
}