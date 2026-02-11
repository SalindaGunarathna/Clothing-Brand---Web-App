const { PRODUCT_CATEGORIES, PRODUCT_SIZES } = require('../config/constants');

const PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=800'
];

module.exports = [
  {
    name: 'Essential Cotton Tee',
    description: 'Soft everyday t-shirt with a relaxed fit.',
    price: 24.99,
    imageUrl: PRODUCT_IMAGES[0],
    category: PRODUCT_CATEGORIES.MEN,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L, PRODUCT_SIZES.XL],
    stockBySize: { S: 30, M: 25, L: 20, XL: 15 }
  },
  {
    name: 'Classic Oxford Shirt',
    description: 'Button-down oxford shirt for work or casual wear.',
    price: 49.99,
    imageUrl: PRODUCT_IMAGES[1],
    category: PRODUCT_CATEGORIES.MEN,
    sizes: [PRODUCT_SIZES.M, PRODUCT_SIZES.L, PRODUCT_SIZES.XL],
    stockBySize: { M: 20, L: 18, XL: 12 }
  },
  {
    name: 'Slim Fit Chino',
    description: 'Stretch chino pants with modern slim fit.',
    price: 59.5,
    imageUrl: PRODUCT_IMAGES[0],
    category: PRODUCT_CATEGORIES.MEN,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 16, M: 14, L: 12 }
  },
  {
    name: 'Unisex Oversized Hoodie',
    description: 'Oversized hoodie with fleece lining.',
    price: 54.0,
    imageUrl: PRODUCT_IMAGES[1],
    category: PRODUCT_CATEGORIES.MEN,
    sizes: [PRODUCT_SIZES.M, PRODUCT_SIZES.L, PRODUCT_SIZES.XL],
    stockBySize: { M: 14, L: 12, XL: 9 }
  },
  {
    name: 'Performance Polo',
    description: 'Breathable polo with moisture-wicking fabric.',
    price: 39.0,
    imageUrl: PRODUCT_IMAGES[0],
    category: PRODUCT_CATEGORIES.MEN,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L, PRODUCT_SIZES.XL],
    stockBySize: { S: 22, M: 20, L: 16, XL: 12 }
  },
  {
    name: 'Linen Shorts',
    description: 'Lightweight shorts for warm weather.',
    price: 34.0,
    imageUrl: PRODUCT_IMAGES[1],
    category: PRODUCT_CATEGORIES.MEN,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 18, M: 16, L: 12 }
  },
  {
    name: 'Denim Jacket',
    description: 'Classic denim jacket with modern fit.',
    price: 79.0,
    imageUrl: PRODUCT_IMAGES[0],
    category: PRODUCT_CATEGORIES.MEN,
    sizes: [PRODUCT_SIZES.M, PRODUCT_SIZES.L, PRODUCT_SIZES.XL],
    stockBySize: { M: 10, L: 8, XL: 6 }
  },
  {
    name: 'Merino Crew Sweater',
    description: 'Soft merino sweater for everyday layering.',
    price: 68.0,
    imageUrl: PRODUCT_IMAGES[1],
    category: PRODUCT_CATEGORIES.MEN,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L, PRODUCT_SIZES.XL],
    stockBySize: { S: 12, M: 10, L: 9, XL: 6 }
  },
  {
    name: 'Floral Summer Dress',
    description: 'Lightweight dress with floral print.',
    price: 64.0,
    imageUrl: PRODUCT_IMAGES[0],
    category: PRODUCT_CATEGORIES.WOMEN,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 12, M: 10, L: 8 }
  },
  {
    name: 'Ribbed Knit Top',
    description: 'Ribbed knit top with a soft stretch feel.',
    price: 34.0,
    imageUrl: PRODUCT_IMAGES[1],
    category: PRODUCT_CATEGORIES.WOMEN,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L, PRODUCT_SIZES.XL],
    stockBySize: { S: 20, M: 18, L: 14, XL: 10 }
  },
  {
    name: 'High-Rise Denim',
    description: 'High-rise jeans with tapered leg.',
    price: 72.0,
    imageUrl: PRODUCT_IMAGES[0],
    category: PRODUCT_CATEGORIES.WOMEN,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 10, M: 9, L: 7 }
  },
  {
    name: 'Relaxed Linen Shirt',
    description: 'Breathable linen shirt for warm weather.',
    price: 58.0,
    imageUrl: PRODUCT_IMAGES[1],
    category: PRODUCT_CATEGORIES.WOMEN,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 15, M: 13, L: 11 }
  },
  {
    name: 'Wrap Midi Skirt',
    description: 'Flowy wrap skirt with adjustable waist.',
    price: 52.0,
    imageUrl: PRODUCT_IMAGES[0],
    category: PRODUCT_CATEGORIES.WOMEN,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 14, M: 12, L: 10 }
  },
  {
    name: 'Cropped Cardigan',
    description: 'Soft cropped cardigan for layering.',
    price: 46.0,
    imageUrl: PRODUCT_IMAGES[1],
    category: PRODUCT_CATEGORIES.WOMEN,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L, PRODUCT_SIZES.XL],
    stockBySize: { S: 16, M: 14, L: 12, XL: 9 }
  },
  {
    name: 'Satin Blouse',
    description: 'Satin blouse with a subtle sheen.',
    price: 55.0,
    imageUrl: PRODUCT_IMAGES[0],
    category: PRODUCT_CATEGORIES.WOMEN,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 11, M: 9, L: 7 }
  },
  {
    name: 'Tailored Blazer',
    description: 'Structured blazer with a clean silhouette.',
    price: 98.0,
    imageUrl: PRODUCT_IMAGES[1],
    category: PRODUCT_CATEGORIES.WOMEN,
    sizes: [PRODUCT_SIZES.M, PRODUCT_SIZES.L, PRODUCT_SIZES.XL],
    stockBySize: { M: 8, L: 7, XL: 5 }
  },
  {
    name: 'Cozy Lounge Set',
    description: 'Matching top and bottom in soft knit.',
    price: 76.0,
    imageUrl: PRODUCT_IMAGES[0],
    category: PRODUCT_CATEGORIES.WOMEN,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L, PRODUCT_SIZES.XL],
    stockBySize: { S: 13, M: 11, L: 9, XL: 7 }
  },
  {
    name: 'Kids Graphic Hoodie',
    description: 'Cozy hoodie with playful graphics.',
    price: 29.99,
    imageUrl: PRODUCT_IMAGES[1],
    category: PRODUCT_CATEGORIES.KIDS,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 18, M: 16, L: 14 }
  },
  {
    name: 'Kids Jogger Pants',
    description: 'Soft jogger pants for everyday play.',
    price: 26.0,
    imageUrl: PRODUCT_IMAGES[0],
    category: PRODUCT_CATEGORIES.KIDS,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 22, M: 18, L: 15 }
  },
  {
    name: 'Kids Rain Jacket',
    description: 'Lightweight water-resistant jacket.',
    price: 38.0,
    imageUrl: PRODUCT_IMAGES[1],
    category: PRODUCT_CATEGORIES.KIDS,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 12, M: 10, L: 8 }
  },
  {
    name: 'Kids Cotton Shorts',
    description: 'Comfortable shorts with elastic waist.',
    price: 19.0,
    imageUrl: PRODUCT_IMAGES[0],
    category: PRODUCT_CATEGORIES.KIDS,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 24, M: 20, L: 16 }
  },
  {
    name: 'Kids Stripe Tee',
    description: 'Classic striped tee for daily wear.',
    price: 18.0,
    imageUrl: PRODUCT_IMAGES[1],
    category: PRODUCT_CATEGORIES.KIDS,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 20, M: 18, L: 14 }
  },
  {
    name: 'Kids Zip Fleece',
    description: 'Soft fleece jacket with zip closure.',
    price: 32.0,
    imageUrl: PRODUCT_IMAGES[0],
    category: PRODUCT_CATEGORIES.KIDS,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 16, M: 14, L: 12 }
  },
  {
    name: 'Kids Denim Overalls',
    description: 'Durable overalls for active days.',
    price: 36.0,
    imageUrl: PRODUCT_IMAGES[1],
    category: PRODUCT_CATEGORIES.KIDS,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 14, M: 12, L: 10 }
  },
  {
    name: 'Kids Puffer Vest',
    description: 'Warm puffer vest for cool weather.',
    price: 34.0,
    imageUrl: PRODUCT_IMAGES[0],
    category: PRODUCT_CATEGORIES.KIDS,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 15, M: 13, L: 11 }
  }
];
