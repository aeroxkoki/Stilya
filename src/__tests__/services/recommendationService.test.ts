// Import the module itself to mock later
import * as recommendationModule from '../../services/recommendationService';
import { getSwipeHistory } from '../../services/swipeService';
import { fetchProductsByTags } from '../../services/productService';
import { getProductViewHistory } from '../../services/viewHistoryService';
import { supabase } from '../../services/supabase';

// Extract functions for easier reference
const { analyzeUserPreferences, getRecommendedProducts, getRecommendationsByCategory } = recommendationModule;

// Mock dependencies
jest.mock('../../services/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    containsAny: jest.fn().mockReturnThis(),
  }
}));

jest.mock('../../services/swipeService');
jest.mock('../../services/productService');
jest.mock('../../services/viewHistoryService');

describe('Recommendation Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Mock data
  const mockUserId = 'test-user-123';
  const mockYesProducts = [
    { 
      id: 'product1', 
      title: 'Test Product 1', 
      tags: ['casual', 'summer', 'cotton'], 
      category: 'tops',
      price: 2000,
      imageUrl: 'https://example.com/image1.jpg',
      brand: 'TestBrand',
      affiliateUrl: 'https://example.com/product1',
      description: 'Test description',
      source: 'test',
      createdAt: '2023-01-01'
    },
    { 
      id: 'product2', 
      title: 'Test Product 2', 
      tags: ['formal', 'cotton', 'elegant'], 
      category: 'tops',
      price: 3000,
      imageUrl: 'https://example.com/image2.jpg',
      brand: 'TestBrand',
      affiliateUrl: 'https://example.com/product2',
      description: 'Test description',
      source: 'test',
      createdAt: '2023-01-01'
    }
  ];
  
  const mockNoProducts = [
    { 
      id: 'product3', 
      title: 'Test Product 3', 
      tags: ['sporty', 'winter', 'wool'], 
      category: 'outerwear',
      price: 5000,
      imageUrl: 'https://example.com/image3.jpg',
      brand: 'TestBrand',
      affiliateUrl: 'https://example.com/product3',
      description: 'Test description',
      source: 'test',
      createdAt: '2023-01-01'
    }
  ];
  
  const mockViewedProducts = [
    { 
      id: 'product4', 
      title: 'Test Product 4', 
      tags: ['casual', 'spring', 'linen'], 
      category: 'bottoms',
      price: 2500,
      imageUrl: 'https://example.com/image4.jpg',
      brand: 'TestBrand',
      affiliateUrl: 'https://example.com/product4',
      description: 'Test description',
      source: 'test',
      createdAt: '2023-01-01'
    }
  ];
  
  const mockClickedProducts = [
    { 
      id: 'product5', 
      title: 'Test Product 5', 
      tags: ['casual', 'cotton', 'summer'], 
      category: 'tops',
      price: 1800,
      imageUrl: 'https://example.com/image5.jpg',
      brand: 'TestBrand',
      affiliateUrl: 'https://example.com/product5',
      description: 'Test description',
      source: 'test',
      createdAt: '2023-01-01'
    }
  ];

  describe('analyzeUserPreferences', () => {
    it('should return null when no user activity exists', async () => {
      // Mock empty swipe and view history
      (getSwipeHistory as jest.Mock).mockResolvedValue([]);
      (getProductViewHistory as jest.Mock).mockResolvedValue([]);
      
      const result = await analyzeUserPreferences(mockUserId);
      
      expect(result).toBeNull();
      expect(getSwipeHistory).toHaveBeenCalledWith(mockUserId);
      expect(getProductViewHistory).toHaveBeenCalledWith(mockUserId, 100);
    });
    
    it('should analyze user preferences correctly from swipe history', async () => {
      // Mock swipe history
      (getSwipeHistory as jest.Mock).mockResolvedValue([
        { productId: 'product1', result: 'yes' },
        { productId: 'product2', result: 'yes' },
        { productId: 'product3', result: 'no' }
      ]);
      
      // Mock view history (empty for this test)
      (getProductViewHistory as jest.Mock).mockResolvedValue([]);
      
      // Mock supabase response for click logs
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.order as jest.Mock).mockReturnThis();
      (supabase.limit as jest.Mock).mockResolvedValue({
        data: [{ product_id: 'product5' }],
        error: null
      });
      
      // Mock supabase response for product data
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.in as jest.Mock).mockResolvedValueOnce({
        data: mockYesProducts.map(p => ({
          id: p.id,
          title: p.title,
          brand: p.brand,
          price: p.price,
          image_url: p.imageUrl,
          description: p.description,
          tags: p.tags,
          category: p.category,
          affiliate_url: p.affiliateUrl,
          source: p.source,
          created_at: p.createdAt
        })),
        error: null
      }).mockResolvedValueOnce({
        data: mockNoProducts.map(p => ({
          id: p.id,
          title: p.title,
          brand: p.brand,
          price: p.price,
          image_url: p.imageUrl,
          description: p.description,
          tags: p.tags,
          category: p.category,
          affiliate_url: p.affiliateUrl,
          source: p.source,
          created_at: p.createdAt
        })),
        error: null
      }).mockResolvedValueOnce({
        data: mockClickedProducts.map(p => ({
          id: p.id,
          title: p.title,
          brand: p.brand,
          price: p.price,
          image_url: p.imageUrl,
          description: p.description,
          tags: p.tags,
          category: p.category,
          affiliate_url: p.affiliateUrl,
          source: p.source,
          created_at: p.createdAt
        })),
        error: null
      });
      
      const result = await analyzeUserPreferences(mockUserId);
      
      // Expectations
      expect(result).not.toBeNull();
      expect(result?.userId).toBe(mockUserId);
      expect(result?.tagScores).toBeDefined();
      expect(result?.topTags).toBeDefined();
      expect(result?.topTags.length).toBeGreaterThan(0);
      
      // Check if casual and cotton have higher scores (they appear in both Yes products)
      expect(result?.tagScores['casual']).toBeGreaterThan(0);
      expect(result?.tagScores['cotton']).toBeGreaterThan(0);
      
      // Check if sporty has a negative score (it appears in No product)
      expect(result?.tagScores['sporty']).toBeLessThan(0);
    });
  });

  describe('getRecommendedProducts', () => {
    it('should return popular products when no user preferences exist', async () => {
      // Mock analyzeUserPreferences to return null (no preferences)
      jest.spyOn(recommendationModule, 'analyzeUserPreferences').mockResolvedValue(null);
      
      // Mock supabase response for popular products
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.limit as jest.Mock).mockResolvedValue({
        data: [mockYesProducts[0]].map(p => ({
          id: p.id,
          title: p.title,
          brand: p.brand,
          price: p.price,
          image_url: p.imageUrl,
          description: p.description,
          tags: p.tags,
          category: p.category,
          affiliate_url: p.affiliateUrl,
          source: p.source,
          created_at: p.createdAt
        })),
        error: null
      });
      
      const result = await getRecommendedProducts(mockUserId, 10);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockYesProducts[0].id);
    });
    
    it('should return products based on user preferences', async () => {
      // Mock user preferences
      jest.spyOn(recommendationModule, 'analyzeUserPreferences').mockResolvedValue({
        userId: mockUserId,
        tagScores: { 'casual': 2.0, 'cotton': 1.5, 'formal': 1.0 },
        topTags: ['casual', 'cotton', 'formal'],
        lastUpdated: new Date().toISOString()
      });
      
      // Mock fetchProductsByTags
      (fetchProductsByTags as jest.Mock).mockResolvedValue([...mockYesProducts, mockClickedProducts[0]]);
      
      const result = await getRecommendedProducts(mockUserId, 10, []);
      
      expect(result).toHaveLength(3);
      expect(fetchProductsByTags).toHaveBeenCalledWith(
        ['casual', 'cotton', 'formal'],
        20,  // Limit * 2
        []   // Exclude IDs
      );
    });
    
    it('should exclude already swiped products', async () => {
      // Mock getSwipeHistory
      (getSwipeHistory as jest.Mock).mockResolvedValue([
        { productId: 'product1', result: 'yes' }
      ]);
      
      // Mock user preferences
      jest.spyOn(recommendationModule, 'analyzeUserPreferences').mockResolvedValue({
        userId: mockUserId,
        tagScores: { 'casual': 2.0, 'cotton': 1.5 },
        topTags: ['casual', 'cotton'],
        lastUpdated: new Date().toISOString()
      });
      
      // Mock fetchProductsByTags
      (fetchProductsByTags as jest.Mock).mockResolvedValue([mockYesProducts[1], mockClickedProducts[0]]);
      
      await getRecommendedProducts(mockUserId, 10);
      
      // Check if product1 was excluded
      expect(fetchProductsByTags).toHaveBeenCalledWith(
        ['casual', 'cotton'],
        20,
        ['product1']
      );
    });
  });

  describe('getRecommendationsByCategory', () => {
    it('should return recommendations grouped by category', async () => {
      // Mock user preferences
      jest.spyOn(recommendationModule, 'analyzeUserPreferences').mockResolvedValue({
        userId: mockUserId,
        tagScores: { 'casual': 2.0, 'cotton': 1.5 },
        topTags: ['casual', 'cotton'],
        lastUpdated: new Date().toISOString()
      });
      
      // Mock getSwipeHistory
      (getSwipeHistory as jest.Mock).mockResolvedValue([]);
      
      // Mock supabase responses for each category
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.containsAny as jest.Mock).mockReturnThis();
      (supabase.limit as jest.Mock)
        // tops
        .mockResolvedValueOnce({
          data: [mockYesProducts[0]].map(p => ({
            id: p.id,
            title: p.title,
            brand: p.brand,
            price: p.price,
            image_url: p.imageUrl,
            description: p.description,
            tags: p.tags,
            category: p.category,
            affiliate_url: p.affiliateUrl,
            source: p.source,
            created_at: p.createdAt
          })),
          error: null
        })
        // bottoms
        .mockResolvedValueOnce({
          data: [mockViewedProducts[0]].map(p => ({
            id: p.id,
            title: p.title,
            brand: p.brand,
            price: p.price,
            image_url: p.imageUrl,
            description: p.description,
            tags: p.tags,
            category: p.category,
            affiliate_url: p.affiliateUrl,
            source: p.source,
            created_at: p.createdAt
          })),
          error: null
        })
        // outerwear
        .mockResolvedValueOnce({
          data: [mockNoProducts[0]].map(p => ({
            id: p.id,
            title: p.title,
            brand: p.brand,
            price: p.price,
            image_url: p.imageUrl,
            description: p.description,
            tags: p.tags,
            category: p.category,
            affiliate_url: p.affiliateUrl,
            source: p.source,
            created_at: p.createdAt
          })),
          error: null
        })
        // accessories (empty)
        .mockResolvedValueOnce({
          data: [],
          error: null
        });
      
      const result = await getRecommendationsByCategory(
        mockUserId,
        ['tops', 'bottoms', 'outerwear', 'accessories'],
        5
      );
      
      expect(Object.keys(result)).toHaveLength(4);
      expect(result.tops).toHaveLength(1);
      expect(result.bottoms).toHaveLength(1);
      expect(result.outerwear).toHaveLength(1);
      expect(result.accessories).toHaveLength(0);
      expect(result.tops[0].id).toBe('product1');
      expect(result.bottoms[0].id).toBe('product4');
      expect(result.outerwear[0].id).toBe('product3');
    });
    
    it('should handle empty results for categories', async () => {
      // Mock user preferences
      jest.spyOn(recommendationModule, 'analyzeUserPreferences').mockResolvedValue({
        userId: mockUserId,
        tagScores: { 'casual': 2.0 },
        topTags: ['casual'],
        lastUpdated: new Date().toISOString()
      });
      
      // Mock getSwipeHistory
      (getSwipeHistory as jest.Mock).mockResolvedValue([]);
      
      // Mock empty responses for all categories
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.containsAny as jest.Mock).mockReturnThis();
      (supabase.limit as jest.Mock).mockResolvedValue({
        data: [],
        error: null
      });
      
      const result = await getRecommendationsByCategory(
        mockUserId,
        ['tops', 'bottoms'],
        5
      );
      
      expect(Object.keys(result)).toHaveLength(2);
      expect(result.tops).toHaveLength(0);
      expect(result.bottoms).toHaveLength(0);
    });
  });

  // Edge case tests
  describe('Edge Cases', () => {
    it('should handle products without tags', async () => {
      // Mock getSwipeHistory
      (getSwipeHistory as jest.Mock).mockResolvedValue([
        { productId: 'product1', result: 'yes' }
      ]);
      
      // Mock productViewHistory
      (getProductViewHistory as jest.Mock).mockResolvedValue([]);
      
      // Mock supabase response for click logs (empty)
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.order as jest.Mock).mockReturnThis();
      (supabase.limit as jest.Mock).mockResolvedValue({
        data: [],
        error: null
      });
      
      // Mock product with no tags
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.in as jest.Mock).mockResolvedValue({
        data: [{
          id: 'product1',
          title: 'Test Product No Tags',
          brand: 'TestBrand',
          price: 2000,
          image_url: 'https://example.com/image1.jpg',
          description: 'Test description',
          tags: null, // Product without tags
          category: 'tops',
          affiliate_url: 'https://example.com/product1',
          source: 'test',
          created_at: '2023-01-01'
        }],
        error: null
      });
      
      const result = await analyzeUserPreferences(mockUserId);
      
      // Even with no tags, the function should still return a user preference object
      expect(result).not.toBeNull();
      expect(result?.tagScores).toEqual({});
      expect(result?.topTags).toEqual([]);
    });
    
    it('should handle database errors gracefully', async () => {
      // Mock getSwipeHistory
      (getSwipeHistory as jest.Mock).mockResolvedValue([
        { productId: 'product1', result: 'yes' }
      ]);
      
      // Mock productViewHistory
      (getProductViewHistory as jest.Mock).mockResolvedValue([]);
      
      // Mock supabase response for click logs
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.order as jest.Mock).mockReturnThis();
      (supabase.limit as jest.Mock).mockResolvedValue({
        data: [],
        error: null
      });
      
      // Mock database error for products
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.in as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });
      
      const result = await analyzeUserPreferences(mockUserId);
      
      // Should return null on error
      expect(result).toBeNull();
    });
  });
});