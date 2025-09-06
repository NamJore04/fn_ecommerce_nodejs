import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Define enums locally since they might not be exported from Prisma client
const LoyaltyTier = {
  BRONZE: 'BRONZE',
  SILVER: 'SILVER', 
  GOLD: 'GOLD',
  PLATINUM: 'PLATINUM'
} as const;

const ProductStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  DISCONTINUED: 'DISCONTINUED'
} as const;

const OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
  RETURNED: 'RETURNED'
} as const;

const PaymentStatus = {
  PENDING: 'PENDING',
  AUTHORIZED: 'AUTHORIZED',
  PAID: 'PAID',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED'
} as const;

const FulfillmentStatus = {
  PENDING: 'PENDING',
  PARTIAL: 'PARTIAL',
  FULFILLED: 'FULFILLED',
  RESTOCKED: 'RESTOCKED'
} as const;

const prisma = new PrismaClient();

// ============================================
// SEED DATA CONSTANTS
// ============================================

const COFFEE_CATEGORIES = [
  {
    name: 'Single Origin Coffee',
    slug: 'single-origin-coffee',
    description: 'Premium single origin coffee beans from specific regions around the world',
    metaTitle: 'Single Origin Coffee Beans | Premium Coffee Collection',
    metaDesc: 'Discover our exquisite single origin coffee collection featuring unique flavors from renowned coffee regions.',
    isFeatured: true
  },
  {
    name: 'Coffee Blends',
    slug: 'coffee-blends',
    description: 'Expertly crafted coffee blends combining beans from multiple origins',
    metaTitle: 'Coffee Blends | Signature Coffee Mixtures',
    metaDesc: 'Explore our signature coffee blends, carefully crafted for consistent flavor and aroma.',
    isFeatured: true
  },
  {
    name: 'Decaf Coffee',
    slug: 'decaf-coffee',
    description: 'Premium decaffeinated coffee beans without compromising on taste',
    metaTitle: 'Decaf Coffee | Premium Decaffeinated Beans',
    metaDesc: 'Enjoy the full coffee experience without caffeine with our premium decaf collection.'
  },
  {
    name: 'Organic Coffee',
    slug: 'organic-coffee',
    description: 'Certified organic coffee beans grown without synthetic pesticides or fertilizers',
    metaTitle: 'Organic Coffee | Certified Organic Coffee Beans',
    metaDesc: 'Premium organic coffee beans certified for purity and sustainability.'
  }
];

const TEA_CATEGORIES = [
  {
    name: 'Black Tea',
    slug: 'black-tea',
    description: 'Rich and robust black teas from premium tea gardens',
    metaTitle: 'Black Tea Collection | Premium Black Teas',
    metaDesc: 'Discover our premium black tea collection featuring classic and exotic varieties.',
    isFeatured: true
  },
  {
    name: 'Green Tea',
    slug: 'green-tea',
    description: 'Fresh and delicate green teas with antioxidant benefits',
    metaTitle: 'Green Tea | Premium Green Tea Collection',
    metaDesc: 'Premium green teas rich in antioxidants and natural flavors.'
  },
  {
    name: 'Herbal Tea',
    slug: 'herbal-tea',
    description: 'Caffeine-free herbal teas with natural wellness benefits',
    metaTitle: 'Herbal Tea | Natural Caffeine-Free Teas',
    metaDesc: 'Natural herbal teas perfect for relaxation and wellness.'
  },
  {
    name: 'Oolong Tea',
    slug: 'oolong-tea',
    description: 'Traditional oolong teas with complex flavors and aromas',
    metaTitle: 'Oolong Tea | Traditional Chinese Oolong',
    metaDesc: 'Authentic oolong teas with rich tradition and complex flavor profiles.'
  }
];

const SAMPLE_PRODUCTS = [
  // Coffee Products
  {
    name: 'Ethiopian Yirgacheffe Single Origin',
    slug: 'ethiopian-yirgacheffe-single-origin',
    description: 'A bright and floral coffee with wine-like acidity and citrus notes. Grown at high altitudes in the Yirgacheffe region of Ethiopia, this coffee offers a clean and complex cup with notes of lemon, bergamot, and tea-like qualities.',
    shortDesc: 'Bright and floral Ethiopian coffee with citrus notes and wine-like acidity.',
    sku: 'COFFEE-ETH-YIR-001',
    basePrice: 24.99,
    comparePrice: 29.99,
    stockQuantity: 150,
    weight: 340, // 12oz
    roastLevel: 'Medium',
    origin: 'Ethiopia',
    caffeineLevell: 'High',
    categorySlug: 'single-origin-coffee',
    tags: ['single-origin', 'ethiopia', 'floral', 'citrus'],
    attributes: {
      'processing': 'Washed',
      'altitude': '1900-2200m',
      'varietal': 'Heirloom',
      'harvest': '2023',
      'cupping_score': 87
    },
    images: [
      {
        url: 'https://example.com/images/ethiopian-yirgacheffe-1.jpg',
        alt: 'Ethiopian Yirgacheffe Coffee Beans',
        isPrimary: true
      }
    ],
    isFeatured: true,
    variants: [
      { name: '12oz Whole Bean', type: 'grind', value: 'whole-bean', adjustment: 0, stock: 150, sku: 'COFFEE-ETH-YIR-001-WB-12' },
      { name: '12oz Ground', type: 'grind', value: 'ground', adjustment: 0, stock: 100, sku: 'COFFEE-ETH-YIR-001-GR-12' },
      { name: '2lb Whole Bean', type: 'size', value: '2lb', adjustment: 45.00, stock: 50, sku: 'COFFEE-ETH-YIR-001-WB-2LB' }
    ]
  },
  {
    name: 'House Blend Coffee',
    slug: 'house-blend-coffee',
    description: 'Our signature house blend combines beans from Central and South America to create a well-balanced cup with chocolate and caramel notes. Perfect for everyday brewing with consistent flavor and moderate acidity.',
    shortDesc: 'Signature house blend with chocolate and caramel notes, perfect for daily brewing.',
    sku: 'COFFEE-BLEND-HOUSE-001',
    basePrice: 18.99,
    comparePrice: 22.99,
    stockQuantity: 300,
    weight: 340,
    roastLevel: 'Medium-Dark',
    origin: 'Blend',
    caffeineLevell: 'Medium',
    categorySlug: 'coffee-blends',
    tags: ['blend', 'chocolate', 'caramel', 'everyday'],
    attributes: {
      'components': ['Colombian', 'Brazilian', 'Guatemalan'],
      'flavor_profile': 'Chocolate, Caramel, Nuts',
      'body': 'Medium-Full'
    },
    isFeatured: true,
    variants: [
      { name: '12oz Whole Bean', type: 'grind', value: 'whole-bean', adjustment: 0, stock: 300, sku: 'COFFEE-BLEND-HOUSE-001-WB-12' },
      { name: '12oz Ground', type: 'grind', value: 'ground', adjustment: 0, stock: 250, sku: 'COFFEE-BLEND-HOUSE-001-GR-12' },
      { name: '5lb Bulk', type: 'size', value: '5lb', adjustment: 65.00, stock: 25, sku: 'COFFEE-BLEND-HOUSE-001-BULK-5LB' }
    ]
  },
  {
    name: 'Swiss Water Decaf Colombia',
    slug: 'swiss-water-decaf-colombia',
    description: 'Premium Colombian coffee decaffeinated using the Swiss Water Process, preserving the original flavor while removing 99.9% of caffeine. Smooth and balanced with notes of chocolate and nuts.',
    shortDesc: 'Swiss Water Process decaf with full flavor and chocolate notes.',
    sku: 'COFFEE-DECAF-COL-001',
    basePrice: 21.99,
    stockQuantity: 120,
    weight: 340,
    roastLevel: 'Medium',
    origin: 'Colombia',
    caffeineLevell: 'Decaf',
    categorySlug: 'decaf-coffee',
    tags: ['decaf', 'swiss-water', 'colombia', 'chocolate'],
    attributes: {
      'decaf_process': 'Swiss Water',
      'caffeine_content': '<0.1%',
      'region': 'Huila'
    },
    variants: [
      { name: '12oz Whole Bean', type: 'grind', value: 'whole-bean', adjustment: 0, stock: 120, sku: 'COFFEE-DECAF-COL-001-WB-12' },
      { name: '12oz Ground', type: 'grind', value: 'ground', adjustment: 0, stock: 80, sku: 'COFFEE-DECAF-COL-001-GR-12' }
    ]
  },
  // Tea Products
  {
    name: 'Earl Grey Supreme Black Tea',
    slug: 'earl-grey-supreme-black-tea',
    description: 'A premium version of the classic Earl Grey, blended with Ceylon black tea, bergamot oil, cornflower petals, and lavender. This elegant tea offers a sophisticated citrus aroma with floral undertones.',
    shortDesc: 'Premium Earl Grey with bergamot, cornflower petals, and lavender.',
    sku: 'TEA-BLACK-EARL-001',
    basePrice: 16.99,
    stockQuantity: 200,
    weight: 113, // 4oz
    caffeineLevell: 'Medium',
    categorySlug: 'black-tea',
    tags: ['earl-grey', 'bergamot', 'lavender', 'premium'],
    attributes: {
      'base_tea': 'Ceylon Black Tea',
      'ingredients': ['Bergamot Oil', 'Cornflower Petals', 'Lavender'],
      'steeping_temp': '212°F',
      'steeping_time': '3-5 minutes'
    },
    isFeatured: true,
    variants: [
      { name: '4oz Loose Leaf', type: 'packaging', value: 'loose-leaf', adjustment: 0, stock: 200, sku: 'TEA-BLACK-EARL-001-LOOSE-4OZ' },
      { name: '20 Tea Bags', type: 'packaging', value: 'tea-bags', adjustment: -2.00, stock: 150, sku: 'TEA-BLACK-EARL-001-BAGS-20' }
    ]
  },
  {
    name: 'Organic Sencha Green Tea',
    slug: 'organic-sencha-green-tea',
    description: 'Authentic Japanese Sencha green tea from certified organic tea gardens. This tea offers a fresh, grassy flavor with a clean finish and high antioxidant content. Perfect for daily wellness routines.',
    shortDesc: 'Authentic organic Japanese Sencha with fresh, grassy flavor.',
    sku: 'TEA-GREEN-SENCHA-001',
    basePrice: 19.99,
    stockQuantity: 180,
    weight: 113,
    origin: 'Japan',
    caffeineLevell: 'Low',
    categorySlug: 'green-tea',
    tags: ['sencha', 'organic', 'japan', 'antioxidant'],
    attributes: {
      'certification': 'USDA Organic',
      'region': 'Shizuoka',
      'harvest': 'First Flush',
      'steeping_temp': '175°F',
      'steeping_time': '2-3 minutes'
    },
    variants: [
      { name: '4oz Loose Leaf', type: 'packaging', value: 'loose-leaf', adjustment: 0, stock: 180, sku: 'TEA-GREEN-SENCHA-001-LOOSE-4OZ' },
      { name: '8oz Bulk', type: 'size', value: '8oz', adjustment: 15.00, stock: 50, sku: 'TEA-GREEN-SENCHA-001-BULK-8OZ' }
    ]
  },
  {
    name: 'Chamomile Dreams Herbal Tea',
    slug: 'chamomile-dreams-herbal-tea',
    description: 'A soothing blend of premium chamomile flowers with hints of honey and apple. This caffeine-free herbal tea is perfect for evening relaxation and promotes restful sleep. All natural ingredients.',
    shortDesc: 'Soothing caffeine-free chamomile blend perfect for evening relaxation.',
    sku: 'TEA-HERBAL-CHAM-001',
    basePrice: 14.99,
    stockQuantity: 220,
    weight: 85, // 3oz
    caffeineLevell: 'Caffeine-Free',
    categorySlug: 'herbal-tea',
    tags: ['chamomile', 'caffeine-free', 'relaxation', 'bedtime'],
    attributes: {
      'ingredients': ['Chamomile Flowers', 'Apple Pieces', 'Natural Honey Flavor'],
      'benefits': ['Relaxation', 'Sleep Aid', 'Digestive Support'],
      'steeping_temp': '212°F',
      'steeping_time': '5-7 minutes'
    },
    variants: [
      { name: '3oz Loose Leaf', type: 'packaging', value: 'loose-leaf', adjustment: 0, stock: 220, sku: 'TEA-HERBAL-CHAM-001-LOOSE-3OZ' },
      { name: '25 Tea Bags', type: 'packaging', value: 'tea-bags', adjustment: -1.00, stock: 180, sku: 'TEA-HERBAL-CHAM-001-BAGS-25' }
    ]
  }
];

const SAMPLE_USERS = [
  {
    email: 'admin@coffeetea.com',
    password: 'Admin123!@#',
    fullName: 'System Administrator',
    phone: '+1-555-0001',
    loyaltyTier: LoyaltyTier.PLATINUM,
    loyaltyPoints: 10000,
    isVerified: true,
    isAdmin: true
  },
  {
    email: 'john.doe@example.com',
    password: 'User123!@#',
    fullName: 'John Doe',
    phone: '+1-555-0002',
    loyaltyTier: LoyaltyTier.GOLD,
    loyaltyPoints: 2500,
    isVerified: true,
    dateOfBirth: new Date('1985-06-15'),
    gender: 'male',
    preferences: {
      'coffee_preference': 'medium_roast',
      'preferred_grind': 'whole_bean',
      'dietary_restrictions': [],
      'flavor_preferences': ['chocolate', 'nuts', 'caramel']
    }
  },
  {
    email: 'jane.smith@example.com',
    password: 'User123!@#',
    fullName: 'Jane Smith',
    phone: '+1-555-0003',
    loyaltyTier: LoyaltyTier.SILVER,
    loyaltyPoints: 1200,
    isVerified: true,
    dateOfBirth: new Date('1990-03-22'),
    gender: 'female',
    preferences: {
      'tea_preference': 'green_tea',
      'preferred_strength': 'light',
      'dietary_restrictions': ['organic_only'],
      'flavor_preferences': ['floral', 'citrus', 'herbal']
    }
  },
  {
    email: 'coffee.lover@example.com',
    password: 'User123!@#',
    fullName: 'Coffee Enthusiast',
    phone: '+1-555-0004',
    loyaltyTier: LoyaltyTier.BRONZE,
    loyaltyPoints: 450,
    isVerified: true,
    preferences: {
      'coffee_preference': 'single_origin',
      'roast_level': 'light',
      'brewing_method': 'pour_over'
    }
  }
];

// ============================================
// SEEDING FUNCTIONS
// ============================================

async function seedCategories() {
  console.log('🌱 Seeding categories...');
  
  const allCategories = [...COFFEE_CATEGORIES, ...TEA_CATEGORIES];
  
  for (const categoryData of allCategories) {
    await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: categoryData,
      create: {
        id: uuidv4(),
        ...categoryData,
        sortOrder: allCategories.indexOf(categoryData)
      }
    });
  }
  
  console.log(`✅ Created ${allCategories.length} categories`);
}

async function seedUsers() {
  console.log('🌱 Seeding users...');
  
  for (const userData of SAMPLE_USERS) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        fullName: userData.fullName,
        phone: userData.phone,
        loyaltyTier: userData.loyaltyTier,
        loyaltyPoints: userData.loyaltyPoints,
        isVerified: userData.isVerified,
        preferences: userData.preferences as any
      },
      create: {
        id: uuidv4(),
        email: userData.email,
        passwordHash: hashedPassword,
        fullName: userData.fullName,
        phone: userData.phone,
        loyaltyTier: userData.loyaltyTier,
        loyaltyPoints: userData.loyaltyPoints,
        isVerified: userData.isVerified,
        dateOfBirth: userData.dateOfBirth,
        gender: userData.gender,
        preferences: userData.preferences as any
      }
    });

    // Add sample addresses for each user
    if (user) {
      await prisma.userAddress.upsert({
        where: {
          id: uuidv4() // This won't match, so it will create
        },
        update: {},
        create: {
          id: uuidv4(),
          userId: user.id,
          type: 'SHIPPING',
          label: 'Home',
          fullName: userData.fullName,
          address1: '123 Coffee Street',
          city: 'Seattle',
          state: 'WA',
          postalCode: '98101',
          country: 'US',
          phone: userData.phone,
          isDefault: true
        }
      });
    }
  }
  
  console.log(`✅ Created ${SAMPLE_USERS.length} users with addresses`);
}

async function seedProducts() {
  console.log('🌱 Seeding products...');
  
  for (const productData of SAMPLE_PRODUCTS) {
    // Find category
    const category = await prisma.category.findUnique({
      where: { slug: productData.categorySlug }
    });
    
    if (!category) {
      console.error(`Category not found: ${productData.categorySlug}`);
      continue;
    }

    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {
        name: productData.name,
        description: productData.description,
        shortDesc: productData.shortDesc,
        basePrice: productData.basePrice,
        comparePrice: productData.comparePrice,
        stockQuantity: productData.stockQuantity,
        weight: productData.weight,
        roastLevel: productData.roastLevel,
        origin: productData.origin,
        caffeineLevell: productData.caffeineLevell,
        tags: productData.tags,
        attributes: productData.attributes as any,
        images: productData.images as any,
        isFeatured: productData.isFeatured || false,
        status: ProductStatus.ACTIVE
      },
      create: {
        id: uuidv4(),
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        shortDesc: productData.shortDesc,
        sku: productData.sku,
        basePrice: productData.basePrice,
        comparePrice: productData.comparePrice,
        stockQuantity: productData.stockQuantity,
        weight: productData.weight,
        roastLevel: productData.roastLevel,
        origin: productData.origin,
        caffeineLevell: productData.caffeineLevell,
        tags: productData.tags,
        attributes: productData.attributes as any,
        images: productData.images as any,
        metaTitle: `${productData.name} | Coffee & Tea Store`,
        metaDesc: productData.shortDesc,
        isFeatured: productData.isFeatured || false,
        status: ProductStatus.ACTIVE,
        categoryId: category.id
      }
    });

    // Create product variants
    if (productData.variants && product) {
      for (const variantData of productData.variants) {
        await prisma.productVariant.upsert({
          where: { sku: variantData.sku },
          update: {
            variantName: variantData.name,
            variantType: variantData.type,
            variantValue: variantData.value,
            priceAdjustment: variantData.adjustment,
            stockQuantity: variantData.stock
          },
          create: {
            id: uuidv4(),
            productId: product.id,
            variantName: variantData.name,
            variantType: variantData.type,
            variantValue: variantData.value,
            priceAdjustment: variantData.adjustment,
            stockQuantity: variantData.stock,
            sku: variantData.sku
          }
        });
      }
    }
  }
  
  console.log(`✅ Created ${SAMPLE_PRODUCTS.length} products with variants`);
}

async function seedSampleOrders() {
  console.log('🌱 Seeding sample orders...');
  
  const users = await prisma.user.findMany({
    where: {
      email: {
        not: 'admin@coffeetea.com'
      }
    }
  });
  
  const products = await prisma.product.findMany({
    include: {
      variants: true
    }
  });
  
  // Create sample orders for each user
  for (const user of users.slice(0, 2)) { // Limit to 2 users for demo
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const order = await prisma.order.create({
      data: {
        id: uuidv4(),
        orderNumber,
        userId: user.id,
        status: OrderStatus.DELIVERED,
        fulfillmentStatus: FulfillmentStatus.FULFILLED,
        paymentStatus: PaymentStatus.PAID,
        subtotal: 45.98,
        taxAmount: 3.68,
        shippingAmount: 5.99,
        totalAmount: 55.65,
        shippingAddress: {
          fullName: user.fullName,
          address1: '123 Coffee Street',
          city: 'Seattle',
          state: 'WA',
          postalCode: '98101',
          country: 'US',
          phone: user.phone
        },
        paymentMethod: 'credit_card',
        shippingMethod: 'standard',
        pointsEarned: 55,
        deliveredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      }
    });

    // Add order items
    const selectedProducts = products.slice(0, 2); // First 2 products
    
    for (const product of selectedProducts) {
      const variant = product.variants[0]; // Use first variant
      
      await prisma.orderItem.create({
        data: {
          id: uuidv4(),
          orderId: order.id,
          productId: product.id,
          variantId: variant?.id,
          productName: product.name,
          variantName: variant?.variantName,
          sku: variant?.sku || product.sku,
          quantity: 1,
          unitPrice: product.basePrice.add(variant?.priceAdjustment || 0),
          totalPrice: product.basePrice.add(variant?.priceAdjustment || 0),
          productSnapshot: {
            name: product.name,
            description: product.description,
            images: product.images
          }
        }
      });
    }

    // Add order status history
    await prisma.orderStatusHistory.createMany({
      data: [
        {
          id: uuidv4(),
          orderId: order.id,
          fromStatus: null,
          toStatus: OrderStatus.PENDING,
          reason: 'Order placed',
          isAutomatic: true,
          createdAt: new Date(order.createdAt.getTime())
        },
        {
          id: uuidv4(),
          orderId: order.id,
          fromStatus: OrderStatus.PENDING,
          toStatus: OrderStatus.CONFIRMED,
          reason: 'Payment confirmed',
          isAutomatic: true,
          createdAt: new Date(order.createdAt.getTime() + 5 * 60 * 1000) // 5 minutes later
        },
        {
          id: uuidv4(),
          orderId: order.id,
          fromStatus: OrderStatus.CONFIRMED,
          toStatus: OrderStatus.SHIPPED,
          reason: 'Order shipped',
          isAutomatic: true,
          createdAt: new Date(order.createdAt.getTime() + 24 * 60 * 60 * 1000) // 1 day later
        },
        {
          id: uuidv4(),
          orderId: order.id,
          fromStatus: OrderStatus.SHIPPED,
          toStatus: OrderStatus.DELIVERED,
          reason: 'Order delivered',
          isAutomatic: true,
          createdAt: order.deliveredAt!
        }
      ]
    });
  }
  
  console.log(`✅ Created sample orders for ${users.slice(0, 2).length} users`);
}

async function seedProductReviews() {
  console.log('🌱 Seeding product reviews...');
  
  const users = await prisma.user.findMany({
    where: {
      email: {
        not: 'admin@coffeetea.com'
      }
    }
  });
  
  const products = await prisma.product.findMany();
  
  const sampleReviews = [
    {
      rating: 5,
      title: 'Exceptional Quality',
      comment: 'This coffee exceeded my expectations. The flavor profile is exactly as described, and the beans are clearly of premium quality. Will definitely order again!',
      pros: 'Great flavor, fresh beans, excellent packaging',
      cons: 'A bit pricey, but worth it'
    },
    {
      rating: 4,
      title: 'Very Good Product',
      comment: 'Really enjoyed this tea. The aroma is wonderful and the taste is smooth. Perfect for my morning routine.',
      pros: 'Great aroma, smooth taste, good value',
      cons: 'Could be a bit stronger'
    },
    {
      rating: 5,
      title: 'Perfect for Relaxation',
      comment: 'This herbal tea is exactly what I needed for evening wind-down. The chamomile is soothing and the flavor is pleasant.',
      pros: 'Very relaxing, caffeine-free, great for bedtime',
      cons: 'None'
    }
  ];
  
  // Create reviews for first few products
  for (let i = 0; i < Math.min(products.length, 3); i++) {
    const product = products[i];
    const user = users[i % users.length];
    const reviewData = sampleReviews[i];
    
    await prisma.productReview.upsert({
      where: {
        productId_userId: {
          productId: product.id,
          userId: user.id
        }
      },
      update: reviewData,
      create: {
        id: uuidv4(),
        productId: product.id,
        userId: user.id,
        ...reviewData,
        isVerified: true,
        isApproved: true,
        isHelpful: Math.floor(Math.random() * 10) + 1
      }
    });
  }
  
  console.log(`✅ Created ${Math.min(products.length, 3)} product reviews`);
}

// ============================================
// MAIN SEEDING FUNCTION
// ============================================

async function main() {
  console.log('🚀 Starting database seeding...');
  
  try {
    // Clear existing data (in development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('🧹 Clearing existing data...');
      
      // Delete in correct order to avoid foreign key constraints
      await prisma.productReview.deleteMany({});
      await prisma.wishlistItem.deleteMany({});
      await prisma.cartItem.deleteMany({});
      await prisma.orderStatusHistory.deleteMany({});
      await prisma.orderItem.deleteMany({});
      await prisma.order.deleteMany({});
      await prisma.loyaltyTransaction.deleteMany({});
      await prisma.inventoryLog.deleteMany({});
      await prisma.productVariant.deleteMany({});
      await prisma.product.deleteMany({});
      await prisma.userAddress.deleteMany({});
      await prisma.user.deleteMany({});
      await prisma.category.deleteMany({});
      
      console.log('✅ Existing data cleared');
    }
    
    // Seed data in correct order
    await seedCategories();
    await seedUsers();
    await seedProducts();
    await seedSampleOrders();
    await seedProductReviews();
    
    console.log('🎉 Database seeding completed successfully!');
    
    // Print summary
    const counts = {
      categories: await prisma.category.count(),
      users: await prisma.user.count(),
      products: await prisma.product.count(),
      variants: await prisma.productVariant.count(),
      orders: await prisma.order.count(),
      reviews: await prisma.productReview.count()
    };
    
    console.log('\n📊 Seeding Summary:');
    console.log(`Categories: ${counts.categories}`);
    console.log(`Users: ${counts.users}`);
    console.log(`Products: ${counts.products}`);
    console.log(`Product Variants: ${counts.variants}`);
    console.log(`Orders: ${counts.orders}`);
    console.log(`Reviews: ${counts.reviews}`);
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
