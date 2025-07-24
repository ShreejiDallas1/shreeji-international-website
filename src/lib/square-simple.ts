// Simple Square integration without the problematic SDK
// This will work with Square's REST API directly

interface SquareConfig {
  applicationId: string;
  accessToken: string;
  environment: 'sandbox' | 'production';
  locationId: string;
}

interface SquareItem {
  id: string;
  type: string;
  version?: number;
  item_data?: {
    name: string;
    description?: string;
    category_id?: string;
    variations?: SquareVariation[];
    image_ids?: string[];
    abbreviation?: string;
    label_color?: string;
    available_online?: boolean;
    available_for_pickup?: boolean;
    available_electronically?: boolean;
    item_options?: any[];
  };
}

interface SquareVariation {
  id: string;
  type: string;
  item_variation_data?: {
    name: string;
    pricing_type: string;
    price_money?: {
      amount: number;
      currency: string;
    };
    sku?: string;
    upc?: string;
    ordinal?: number;
    weight?: number;
    measurement_unit_id?: string;
  };
}

interface SquareCategory {
  id: string;
  type: string;
  category_data?: {
    name: string;
  };
}

class SquareService {
  private config: SquareConfig;
  private baseUrl: string;
  private cachedRelatedObjects: any[] = [];

  constructor() {
    this.config = {
      applicationId: process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || '',
      accessToken: process.env.SQUARE_ACCESS_TOKEN || '',
      environment: (process.env.SQUARE_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
      locationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || '',
    };
    
    this.baseUrl = this.config.environment === 'production'
      ? 'https://connect.squareup.com/v2'
      : 'https://connect.squareupsandbox.com/v2';
      
    console.log('🔧 Square Config:', {
      environment: this.config.environment,
      baseUrl: this.baseUrl,
      hasAccessToken: !!this.config.accessToken,
      accessTokenLength: this.config.accessToken.length,
      locationId: this.config.locationId,
      applicationId: this.config.applicationId
    });
  }

  async makeRequest(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any) {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log('🌐 Making Square API request:', {
      url,
      method,
      hasBody: !!body,
      environment: this.config.environment
    });
    
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
        'Square-Version': '2023-10-18',
      },
    };

    if (body && method === 'POST') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`Square API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    return response.json();
  }

  // Get all catalog items
  async getCatalogItems() {
    try {
      console.log('🔍 Fetching catalog items from Square...');
      
      // First try to get location info to verify our access
      try {
        const locationResponse = await this.makeRequest('/locations', 'GET');
        console.log('📍 Available locations:', locationResponse.locations?.map((l: any) => ({ id: l.id, name: l.name })));
        
        // Try to get inventory for this location
        try {
          const inventoryResponse = await this.makeRequest('/inventory/counts/batch-retrieve', 'POST', {
            location_ids: [this.config.locationId]
          });
          console.log('📦 Inventory response:', inventoryResponse);
        } catch (invError) {
          console.log('⚠️ Could not fetch inventory:', invError);
        }
      } catch (locError) {
        console.log('⚠️ Could not fetch locations:', locError);
      }
      
      // Try different catalog API approaches
      let response;
      
      // Method 1: Try catalog/search (most reliable)
      try {
        console.log('🔍 Trying catalog search...');
        response = await this.makeRequest('/catalog/search', 'POST', {
          object_types: ['ITEM'],
          include_deleted_objects: false,
          limit: 1000
        });
        console.log('✅ Catalog search successful');
      } catch (searchError) {
        console.log('❌ Catalog search failed:', searchError);
        
        // Method 2: Try catalog/list
        try {
          console.log('🔍 Trying catalog list...');
          response = await this.makeRequest('/catalog/list', 'POST', {
            types: ['ITEM'],
            include_deleted_objects: false
          });
          console.log('✅ Catalog list successful');
        } catch (listError) {
          console.log('❌ Catalog list failed:', listError);
          
          // Method 3: Try without body (GET request)
          try {
            console.log('🔍 Trying catalog list GET...');
            response = await this.makeRequest('/catalog/list?types=ITEM', 'GET');
            console.log('✅ Catalog GET successful');
          } catch (getError) {
            console.log('❌ All catalog methods failed');
            throw getError;
          }
        }
      }
      console.log('📦 Square API Response:', {
        hasObjects: !!response.objects,
        objectCount: response.objects?.length || 0,
        totalResponse: Object.keys(response).length,
        hasRelatedObjects: !!response.related_objects,
        relatedObjectCount: response.related_objects?.length || 0
      });
      
      // Store related objects (which might include categories) for later use
      if (response.related_objects) {
        this.cachedRelatedObjects = response.related_objects;
        console.log('💾 Cached related objects:', {
          count: response.related_objects.length,
          types: [...new Set(response.related_objects.map((obj: any) => obj.type))]
        });
      }
      
      return response.objects || [];
    } catch (error) {
      console.error('❌ Error fetching catalog items:', error);
      return [];
    }
  }

  // Get categories
  async getCategories() {
    try {
      console.log('🔍 Fetching categories from Square...');
      
      // Try multiple approaches to get categories
      let response;
      
      // Method 1: Try catalog/search for categories (most reliable)
      try {
        console.log('🔍 Trying category search...');
        response = await this.makeRequest('/catalog/search', 'POST', {
          object_types: ['CATEGORY'],
          include_deleted_objects: false,
          limit: 1000
        });
        console.log('✅ Category search successful');
      } catch (searchError) {
        console.log('❌ Category search failed:', searchError);
        
        // Method 2: Try catalog/list
        try {
          console.log('🔍 Trying category list...');
          response = await this.makeRequest('/catalog/list', 'POST', {
            types: ['CATEGORY'],
            include_deleted_objects: false
          });
          console.log('✅ Category list successful');
        } catch (listError) {
          console.log('❌ Category list failed:', listError);
          
          // Method 3: Try without body (GET request)
          try {
            console.log('🔍 Trying category list GET...');
            response = await this.makeRequest('/catalog/list?types=CATEGORY', 'GET');
            console.log('✅ Category GET successful');
          } catch (getError) {
            console.log('❌ All category methods failed');
            throw getError;
          }
        }
      }
      
      console.log('📂 Square Categories Response:', {
        hasObjects: !!response.objects,
        objectCount: response.objects?.length || 0,
        totalResponse: Object.keys(response).length,
        hasRelatedObjects: !!response.related_objects,
        relatedObjectCount: response.related_objects?.length || 0
      });
      
      // Also check if there are related objects that might contain categories
      const allObjects = response.objects || [];
      const relatedObjects = response.related_objects || [];
      const cachedObjects = this.cachedRelatedObjects || [];
      
      // Look for categories in main objects, related objects, and cached objects
      const categories = [...allObjects, ...relatedObjects, ...cachedObjects].filter((obj: any) => obj.type === 'CATEGORY');
      
      console.log('📂 Found categories:', {
        fromMainObjects: allObjects.filter((obj: any) => obj.type === 'CATEGORY').length,
        fromRelatedObjects: relatedObjects.filter((obj: any) => obj.type === 'CATEGORY').length,
        fromCachedObjects: cachedObjects.filter((obj: any) => obj.type === 'CATEGORY').length,
        totalCategories: categories.length,
        categoryNames: categories.map((cat: any) => cat.category_data?.name)
      });
      
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Get inventory for a location
  async getInventory() {
    try {
      const response = await this.makeRequest(`/inventory/counts/${this.config.locationId}`);
      return response.counts || [];
    } catch (error) {
      console.error('Error fetching inventory:', error);
      return [];
    }
  }

  // Get inventory counts for all items (batch retrieve)
  async getInventoryCounts() {
    try {
      const response = await this.makeRequest('/inventory/counts/batch-retrieve', 'POST', {
        location_ids: [this.config.locationId]
      });
      
      console.log('📊 Square Inventory Response:', {
        hasInventory: !!response.counts,
        inventoryCount: response.counts?.length || 0
      });
      
      return response.counts || [];
    } catch (error) {
      console.error('Error fetching inventory counts:', error);
      return [];
    }
  }

  // Get image data from Square
  async getImage(imageId: string) {
    try {
      const response = await this.makeRequest(`/catalog/object/${imageId}`, 'GET');
      
      if (response.object && response.object.type === 'IMAGE') {
        const imageData = response.object.image_data;
        return {
          id: imageId,
          url: imageData?.url || null,
          caption: imageData?.caption || '',
          name: imageData?.name || ''
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching image:', error);
      return null;
    }
  }

  // Process payment
  async processPayment(paymentData: {
    sourceId: string;
    amount: number;
    currency: string;
    idempotencyKey: string;
  }) {
    try {
      const response = await this.makeRequest('/payments', 'POST', {
        source_id: paymentData.sourceId,
        idempotency_key: paymentData.idempotencyKey,
        amount_money: {
          amount: Math.round(paymentData.amount * 100), // Convert to cents
          currency: paymentData.currency,
        },
        location_id: this.config.locationId,
      });
      
      return response.payment;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  // Create catalog item
  async createCatalogItem(itemData: {
    name: string;
    description?: string;
    price: number;
    sku?: string;
    categoryId?: string;
  }) {
    try {
      const response = await this.makeRequest('/catalog/object', 'POST', {
        idempotency_key: `${Date.now()}-${Math.random()}`,
        object: {
          type: 'ITEM',
          id: `#${itemData.name.replace(/\s+/g, '_').toLowerCase()}`,
          item_data: {
            name: itemData.name,
            description: itemData.description,
            category_id: itemData.categoryId,
            variations: [{
              type: 'ITEM_VARIATION',
              id: `#${itemData.name.replace(/\s+/g, '_').toLowerCase()}_variation`,
              item_variation_data: {
                item_id: `#${itemData.name.replace(/\s+/g, '_').toLowerCase()}`,
                name: 'Regular',
                sku: itemData.sku,
                pricing_type: 'FIXED_PRICING',
                price_money: {
                  amount: Math.round(itemData.price * 100),
                  currency: 'USD',
                },
              },
            }],
          },
        },
      });
      
      return response.catalog_object;
    } catch (error) {
      console.error('Error creating catalog item:', error);
      throw error;
    }
  }
}

export const squareService = new SquareService();

// Export types for external use
export type { SquareConfig, SquareItem, SquareVariation, SquareCategory };

// Helper functions for transforming Square data
export const transformSquareProduct = (item: SquareItem, categories: SquareCategory[] = [], inventoryCounts: any[] = []) => {
  const itemData = item.item_data;
  const variations = itemData?.variations || [];
  const primaryVariation = variations[0];
  const category = categories.find(cat => cat.id === itemData?.category_id);
  
  // Debug logging
  console.log('🔍 Transforming Square product:', {
    itemId: item.id,
    name: itemData?.name,
    description: itemData?.description,
    hasImages: !!itemData?.image_ids?.length,
    imageIds: itemData?.image_ids,
    categoryId: itemData?.category_id,
    variations: variations.length,
    foundCategory: category?.category_data?.name || 'NOT FOUND',
    availableCategories: categories.length
  });
  
  // Get inventory count for this item
  const inventoryCount = inventoryCounts.find(count => 
    count.catalog_object_id === primaryVariation?.id
  );
  
  // Extract images from Square
  const images = itemData?.image_ids?.map((imageId: string) => {
    // Use our Square image API endpoint
    return `/api/square/image/${imageId}`;
  }) || [];
  
  // Get primary image - use placeholder if no images
  const primaryImage = images.length > 0 ? images[0] : '/images/placeholder.svg';
  
  // Debug logging for images
  console.log('🖼️ Image processing for product:', {
    productName: itemData?.name,
    imageIds: itemData?.image_ids,
    generatedImages: images,
    primaryImage: primaryImage
  });
  
  // Extract all variation details
  const variationData = primaryVariation?.item_variation_data;
  const priceMoney = variationData?.price_money;
  
  // Calculate price (Square stores in cents)
  const price = priceMoney?.amount ? Number(priceMoney.amount) / 100 : 0;
  
  // Get stock quantity
  const stockQuantity = inventoryCount?.quantity ? parseInt(inventoryCount.quantity) : 0;
  
  // Extract weight information
  const weight = variationData?.measurement_unit_id ? {
    value: variationData.weight || 0,
    unit: variationData.measurement_unit_id
  } : null;
  
  return {
    // Basic product info
    id: item.id,
    name: itemData?.name || 'Unnamed Product',
    description: itemData?.description || '',
    
    // Pricing
    price: price,
    currency: priceMoney?.currency || 'USD',
    
    // Product identification
    sku: variationData?.sku || `SKU-${item.id}`,
    gtin: variationData?.upc || '',
    
    // Categorization
    category: category?.category_data?.name || 'Uncategorized',
    categoryId: itemData?.category_id || null,
    
    // Images
    image: primaryImage,
    images: images,
    imageIds: itemData?.image_ids || [],
    
    // Inventory
    stock: stockQuantity,
    stockStatus: stockQuantity > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
    lowStockAlert: stockQuantity <= 5,
    
    // Physical properties
    weight: weight,
    
    // Business details
    brand: 'Shreeji International',
    unit: 'per item',
    minOrderQuantity: 1,
    
    // Visibility and availability
    isVisible: itemData?.available_online !== false,
    isAvailableForPickup: itemData?.available_for_pickup !== false,
    isAvailableElectronically: itemData?.available_electronically !== false,
    
    // Variations (for future use)
    variations: variations.map(variation => ({
      id: variation.id,
      name: variation.item_variation_data?.name || '',
      sku: variation.item_variation_data?.sku || '',
      price: variation.item_variation_data?.price_money?.amount 
        ? Number(variation.item_variation_data.price_money.amount) / 100 
        : 0,
      ordinal: variation.item_variation_data?.ordinal || 0
    })),
    
    // Square-specific data
    squareItemId: item.id,
    squareVariationId: primaryVariation?.id,
    squareVersion: item.version,
    squareType: item.type,
    
    // Metadata
    featured: false, // Can be updated manually
    lastSyncedAt: new Date().toISOString(),
    syncedFromSquare: true,
    
    // Additional Square fields
    abbreviation: itemData?.abbreviation || '',
    labelColor: itemData?.label_color || '',
    availableOnline: itemData?.available_online !== false,
    availableForPickup: itemData?.available_for_pickup !== false,
    availableElectronically: itemData?.available_electronically !== false,
    
    // Custom attributes (if any)
    customAttributes: itemData?.item_options?.map((option: any) => ({
      name: option.item_option_data?.name || '',
      displayName: option.item_option_data?.display_name || '',
      description: option.item_option_data?.description || '',
      showColors: option.item_option_data?.show_colors || false,
      values: option.item_option_data?.values || []
    })) || []
  };
};

export const transformSquareCategory = (category: SquareCategory) => {
  return {
    id: category.id,
    name: category.category_data?.name || 'Unnamed Category',
    squareCategoryId: category.id,
    lastSyncedAt: new Date().toISOString(),
  };
};