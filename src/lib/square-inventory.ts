// Square Inventory Management System
// Handles catalog, inventory, and payment integration

import { squareService } from './square-simple';

export interface SquareProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  categoryId?: string;
  imageUrl?: string;
  sku?: string;
  trackInventory: boolean;
  inStock: boolean;
  stockQuantity?: number;
  locationIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SquareCategory {
  id: string;
  name: string;
  imageUrl?: string;
  productCount: number;
}

export interface InventoryCount {
  catalogObjectId: string;
  locationId: string;
  quantity: number;
  calculatedAt: string;
}

export class SquareInventoryManager {
  // Get all catalog items (products and categories)
  static async getAllCatalogItems(): Promise<{
    products: SquareProduct[];
    categories: SquareCategory[];
  }> {
    try {
      console.log('📦 Fetching Square catalog...');
      
      const response = await squareService.makeRequest('/catalog/list', 'POST', {
        types: ['ITEM', 'CATEGORY'],
        include_deleted_objects: false
      });

      if (!response.objects) {
        return { products: [], categories: [] };
      }

      const products: SquareProduct[] = [];
      const categories: SquareCategory[] = [];

      response.objects.forEach((object: any) => {
        if (object.type === 'ITEM' && object.item_data) {
          const item = object.item_data;
          const variation = item.variations?.[0]?.item_variation_data;
          
          if (variation) {
            products.push({
              id: object.id,
              name: item.name,
              description: item.description,
              price: variation.price_money?.amount ? variation.price_money.amount / 100 : 0,
              currency: variation.price_money?.currency || 'USD',
              categoryId: item.category_id,
              imageUrl: item.image_ids?.[0], // Will need to resolve image URLs separately
              sku: variation.sku,
              trackInventory: variation.track_inventory || false,
              inStock: true, // Will be updated with inventory check
              stockQuantity: 0, // Will be updated with inventory check
              locationIds: variation.location_overrides?.map((o: any) => o.location_id) || [],
              createdAt: object.created_at,
              updatedAt: object.updated_at
            });
          }
        } else if (object.type === 'CATEGORY' && object.category_data) {
          categories.push({
            id: object.id,
            name: object.category_data.name,
            imageUrl: undefined, // Categories don't typically have images in Square
            productCount: 0 // Will be calculated
          });
        }
      });

      // Update product count for categories
      categories.forEach(category => {
        category.productCount = products.filter(p => p.categoryId === category.id).length;
      });

      console.log(`✅ Retrieved ${products.length} products and ${categories.length} categories`);
      return { products, categories };

    } catch (error) {
      console.error('❌ Error fetching catalog:', error);
      throw error;
    }
  }

  // Get inventory counts for all locations
  static async getInventoryCounts(locationIds?: string[]): Promise<InventoryCount[]> {
    try {
      console.log('📊 Fetching inventory counts...');
      
      const response = await squareService.makeRequest('/inventory/counts/batch-retrieve', 'POST', {
        location_ids: locationIds,
        updated_after: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Last 24 hours
      });

      if (!response.counts) {
        return [];
      }

      const inventoryCounts: InventoryCount[] = response.counts.map((count: any) => ({
        catalogObjectId: count.catalog_object_id,
        locationId: count.location_id,
        quantity: parseInt(count.quantity || '0'),
        calculatedAt: count.calculated_at
      }));

      console.log(`✅ Retrieved inventory for ${inventoryCounts.length} items`);
      return inventoryCounts;

    } catch (error) {
      console.error('❌ Error fetching inventory:', error);
      throw error;
    }
  }

  // Update product inventory from Square
  static async updateProductInventory(products: SquareProduct[], locationId?: string): Promise<SquareProduct[]> {
    try {
      const inventoryCounts = await this.getInventoryCounts(locationId ? [locationId] : undefined);
      
      // Create a map for quick lookup
      const inventoryMap = new Map<string, number>();
      inventoryCounts.forEach(count => {
        const key = locationId ? count.catalogObjectId : `${count.catalogObjectId}-${count.locationId}`;
        const existing = inventoryMap.get(count.catalogObjectId) || 0;
        inventoryMap.set(count.catalogObjectId, existing + count.quantity);
      });

      // Update products with inventory data
      const updatedProducts = products.map(product => {
        const quantity = inventoryMap.get(product.id) || 0;
        return {
          ...product,
          stockQuantity: quantity,
          inStock: quantity > 0
        };
      });

      return updatedProducts;

    } catch (error) {
      console.error('❌ Error updating inventory:', error);
      return products; // Return original products if inventory update fails
    }
  }

  // Create a new product in Square catalog
  static async createProduct(productData: {
    name: string;
    description?: string;
    price: number;
    categoryId?: string;
    sku?: string;
    trackInventory?: boolean;
  }): Promise<SquareProduct | null> {
    try {
      console.log('➕ Creating new product in Square:', productData.name);

      const catalogObject = {
        type: 'ITEM',
        id: `#${productData.name.replace(/\s+/g, '_').toLowerCase()}`,
        item_data: {
          name: productData.name,
          description: productData.description,
          category_id: productData.categoryId,
          variations: [{
            type: 'ITEM_VARIATION',
            id: `#${productData.name.replace(/\s+/g, '_').toLowerCase()}_variation`,
            item_variation_data: {
              name: 'Regular',
              pricing_type: 'FIXED_PRICING',
              price_money: {
                amount: Math.round(productData.price * 100), // Convert to cents
                currency: 'USD'
              },
              sku: productData.sku,
              track_inventory: productData.trackInventory || false
            }
          }]
        }
      };

      const response = await squareService.makeRequest('/catalog/object', 'POST', {
        object: catalogObject
      });

      if (response.catalog_object) {
        const object = response.catalog_object;
        const item = object.item_data;
        const variation = item.variations[0].item_variation_data;

        return {
          id: object.id,
          name: item.name,
          description: item.description,
          price: variation.price_money.amount / 100,
          currency: variation.price_money.currency,
          categoryId: item.category_id,
          sku: variation.sku,
          trackInventory: variation.track_inventory,
          inStock: false,
          stockQuantity: 0,
          locationIds: [],
          createdAt: object.created_at,
          updatedAt: object.updated_at
        };
      }

      return null;

    } catch (error) {
      console.error('❌ Error creating product:', error);
      throw error;
    }
  }

  // Update inventory count for a product
  static async updateInventoryCount(
    catalogObjectId: string,
    locationId: string,
    quantity: number,
    reason: 'RESTOCK' | 'SALE' | 'ADJUSTMENT' = 'ADJUSTMENT'
  ): Promise<boolean> {
    try {
      console.log(`📦 Updating inventory: ${catalogObjectId} to ${quantity}`);

      const response = await squareService.makeRequest('/inventory/changes/batch-create', 'POST', {
        changes: [{
          type: 'PHYSICAL_COUNT',
          physical_count: {
            catalog_object_id: catalogObjectId,
            location_id: locationId,
            quantity: quantity.toString(),
            occurred_at: new Date().toISOString(),
            reference_id: `adjustment_${Date.now()}`
          }
        }]
      });

      return !!response.changes;

    } catch (error) {
      console.error('❌ Error updating inventory:', error);
      return false;
    }
  }

  // Sync products from Square to Firestore
  static async syncToFirestore(): Promise<{ success: boolean; synced: number; errors: number }> {
    try {
      console.log('🔄 Starting Square to Firestore sync...');
      
      const { products, categories } = await this.getAllCatalogItems();
      const updatedProducts = await this.updateProductInventory(products);

      let synced = 0;
      let errors = 0;

      // Import dynamically to avoid build issues
      const { db } = await import('./firebase');
      const { doc, setDoc, collection } = await import('firebase/firestore');

      // Sync categories
      for (const category of categories) {
        try {
          await setDoc(doc(db, 'categories', category.id), {
            ...category,
            source: 'square',
            lastSynced: new Date().toISOString()
          });
        } catch (error) {
          console.error(`❌ Error syncing category ${category.id}:`, error);
          errors++;
        }
      }

      // Sync products
      for (const product of updatedProducts) {
        try {
          await setDoc(doc(db, 'products', product.id), {
            ...product,
            images: product.imageUrl ? [product.imageUrl] : [],
            category: categories.find(c => c.id === product.categoryId)?.name || 'Uncategorized',
            source: 'square',
            lastSynced: new Date().toISOString()
          });
          synced++;
        } catch (error) {
          console.error(`❌ Error syncing product ${product.id}:`, error);
          errors++;
        }
      }

      console.log(`✅ Sync complete: ${synced} products synced, ${errors} errors`);
      return { success: true, synced, errors };

    } catch (error) {
      console.error('❌ Sync failed:', error);
      return { success: false, synced: 0, errors: 1 };
    }
  }
}

// Note: Types are already exported via interface declarations above