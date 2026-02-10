const { PRODUCT_CATEGORIES, PRODUCT_SIZES } = require('../config/constants');

module.exports = [
  {
    name: 'Essential Cotton Tee',
    description: 'Soft everyday t-shirt with a relaxed fit.',
    price: 24.99,
    imageUrl: 'https://images.example.com/products/men-tee-1.jpg',
    category: PRODUCT_CATEGORIES.MEN,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L, PRODUCT_SIZES.XL],
    stockBySize: { S: 30, M: 25, L: 20, XL: 15 }
  },
  {
    name: 'Classic Oxford Shirt',
    description: 'Button-down oxford shirt for work or casual wear.',
    price: 49.99,
    imageUrl: 'https://images.example.com/products/men-oxford-1.jpg',
    category: PRODUCT_CATEGORIES.MEN,
    sizes: [PRODUCT_SIZES.M, PRODUCT_SIZES.L, PRODUCT_SIZES.XL],
    stockBySize: { M: 20, L: 18, XL: 12 }
  },
  {
    name: 'Slim Fit Chino',
    description: 'Stretch chino pants with modern slim fit.',
    price: 59.5,
    imageUrl: 'https://images.example.com/products/men-chino-1.jpg',
    category: PRODUCT_CATEGORIES.MEN,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 16, M: 14, L: 12 }
  },
  {
    name: 'Floral Summer Dress',
    description: 'Lightweight dress with floral print.',
    price: 64.0,
    imageUrl: 'https://images.example.com/products/women-dress-1.jpg',
    category: PRODUCT_CATEGORIES.WOMEN,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 12, M: 10, L: 8 }
  },
  {
    name: 'Ribbed Knit Top',
    description: 'Ribbed knit top with a soft stretch feel.',
    price: 34.0,
    imageUrl: 'https://images.example.com/products/women-top-1.jpg',
    category: PRODUCT_CATEGORIES.WOMEN,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L, PRODUCT_SIZES.XL],
    stockBySize: { S: 20, M: 18, L: 14, XL: 10 }
  },
  {
    name: 'High-Rise Denim',
    description: 'High-rise jeans with tapered leg.',
    price: 72.0,
    imageUrl: 'https://images.example.com/products/women-denim-1.jpg',
    category: PRODUCT_CATEGORIES.WOMEN,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 10, M: 9, L: 7 }
  },
  {
    name: 'Kids Graphic Hoodie2',
    description: 'Cozy hoodie with playful graphics.',
    price: 29.99,
    imageUrl: 'https://images.example.com/products/kids-hoodie-1.jpg',
    category: PRODUCT_CATEGORIES.KIDS,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 18, M: 16, L: 14 }
  },
  {
    name: 'Kids Jogger Pants',
    description: 'Soft jogger pants for everyday play.',
    price: 26.0,
    imageUrl: 'https://images.example.com/products/kids-jogger-1.jpg',
    category: PRODUCT_CATEGORIES.KIDS,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 22, M: 18, L: 15 }
  },
  {
    name: 'Kids Rain Jacket',
    description: 'Lightweight water-resistant jacket.',
    price: 38.0,
    imageUrl: 'https://images.example.com/products/kids-jacket-1.jpg',
    category: PRODUCT_CATEGORIES.KIDS,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 12, M: 10, L: 8 }
  },
  {
    name: 'Unisex Oversized Hoodie',
    description: 'Oversized hoodie with fleece lining.',
    price: 54.0,
    imageUrl: 'https://images.example.com/products/unisex-hoodie-1.jpg',
    category: PRODUCT_CATEGORIES.MEN,
    sizes: [PRODUCT_SIZES.M, PRODUCT_SIZES.L, PRODUCT_SIZES.XL],
    stockBySize: { M: 14, L: 12, XL: 9 }
  },
  {
    name: 'Relaxed Linen Shirt',
    description: 'Breathable linen shirt for warm weather.',
    price: 58.0,
    imageUrl: 'https://images.example.com/products/women-linen-1.jpg',
    category: PRODUCT_CATEGORIES.WOMEN,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 15, M: 13, L: 11 }
  },
  {
    name: 'Kids Cotton Shorts2',
    description: 'Comfortable shorts with elastic waist.',
    price: 19.0,
    imageUrl: 'https://images.example.com/products/kids-shorts-1.jpg',
    category: PRODUCT_CATEGORIES.KIDS,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 24, M: 20, L: 16 }
  }
];
