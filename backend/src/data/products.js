const { PRODUCT_CATEGORIES, PRODUCT_SIZES } = require('../config/constants');

const PRODUCT_IMAGES = {
  MEN: [
    'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=800',
    'https://cdn.shopify.com/s/files/1/0761/3674/3200/files/Men_Trouser_480x480.png?v=1733379215',
    'https://i.pinimg.com/736x/01/7e/03/017e039b1bcfcff14a4dacb6be7f7c27.jpg',
    'https://images.jdmagicbox.com/quickquotes/images_main/formal-wear-for-men-sesvbeic.jpg'
  ],
  WOMEN: [
    'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&q=80&w=800',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRs-Wf2waG2wbhh17sD-RZPcxJVlC7WWxC8VyZ5qmxfNQ&s',
    'https://assets.myntassets.com/assets/images/2025/MARCH/24/m1zSdHrp_3362334b7a6748daa17316f4dc876290.jpg',
    'https://i.pinimg.com/736x/f5/d3/9f/f5d39ff72c156406477c03c412315d28.jpg'
  ],
  KIDS: [
    'https://image.made-in-china.com/202f0j00WjQtSrVhuLfT/New-Summer-Children-Dresses-Toddler-Baby-Birthday-Flower-Girls-Dress-for-Girls-Kids-Formal-Wear.webp',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqUlBobasaSZhJbcDTwHPh85PhEdBcJt1DdQ&s',
    'https://www.gld-forkids.com/cdn/shop/files/Satin_Peekaboo_Shoulder_Girls_Dress_Multi_Colour_Royal_Blue_Front_Live_View.jpg?v=1760807726'
  ]
};

module.exports = [
  {
    name: 'Men Classic T-Shirt',
    description: 'Soft cotton t-shirt with a relaxed fit.',
    price: 24.99,
    imageUrl: PRODUCT_IMAGES.MEN[0],
    category: PRODUCT_CATEGORIES.MEN,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L, PRODUCT_SIZES.XL],
    stockBySize: { S: 30, M: 25, L: 20, XL: 15 }
  },
  {
    name: 'Men Casual Trouser',
    description: 'Everyday trouser with a clean tapered fit.',
    price: 52.0,
    imageUrl: PRODUCT_IMAGES.MEN[1],
    category: PRODUCT_CATEGORIES.MEN,
    sizes: [PRODUCT_SIZES.M, PRODUCT_SIZES.L, PRODUCT_SIZES.XL],
    stockBySize: { M: 20, L: 18, XL: 12 }
  },
  {
    name: 'Men Graphic T-Shirt',
    description: 'Breathable tee with modern graphic print.',
    price: 29.5,
    imageUrl: PRODUCT_IMAGES.MEN[2],
    category: PRODUCT_CATEGORIES.MEN,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 16, M: 14, L: 12 }
  },
  {
    name: 'Men Formal Shirt',
    description: 'Crisp formal shirt for office or events.',
    price: 46.0,
    imageUrl: PRODUCT_IMAGES.MEN[3],
    category: PRODUCT_CATEGORIES.MEN,
    sizes: [PRODUCT_SIZES.M, PRODUCT_SIZES.L, PRODUCT_SIZES.XL],
    stockBySize: { M: 14, L: 12, XL: 9 }
  },
  {
    name: 'Men Performance Polo',
    description: 'Breathable polo with moisture-wicking fabric.',
    price: 39.0,
    imageUrl: PRODUCT_IMAGES.MEN[0],
    category: PRODUCT_CATEGORIES.MEN,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L, PRODUCT_SIZES.XL],
    stockBySize: { S: 22, M: 20, L: 16, XL: 12 }
  },
  {
    name: 'Men Linen Shorts',
    description: 'Lightweight shorts for warm weather.',
    price: 34.0,
    imageUrl: PRODUCT_IMAGES.MEN[1],
    category: PRODUCT_CATEGORIES.MEN,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 18, M: 16, L: 12 }
  },
  {
    name: 'Men Denim Jacket',
    description: 'Classic denim jacket with modern fit.',
    price: 79.0,
    imageUrl: PRODUCT_IMAGES.MEN[2],
    category: PRODUCT_CATEGORIES.MEN,
    sizes: [PRODUCT_SIZES.M, PRODUCT_SIZES.L, PRODUCT_SIZES.XL],
    stockBySize: { M: 10, L: 8, XL: 6 }
  },
  {
    name: 'Men Crew Sweater',
    description: 'Soft sweater for everyday layering.',
    price: 68.0,
    imageUrl: PRODUCT_IMAGES.MEN[3],
    category: PRODUCT_CATEGORIES.MEN,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L, PRODUCT_SIZES.XL],
    stockBySize: { S: 12, M: 10, L: 9, XL: 6 }
  },
  {
    name: 'Floral Summer Dress',
    description: 'Lightweight dress with floral print.',
    price: 64.0,
    imageUrl: PRODUCT_IMAGES.WOMEN[0],
    category: PRODUCT_CATEGORIES.WOMEN,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 12, M: 10, L: 8 }
  },
  {
    name: 'Ribbed Knit Top',
    description: 'Ribbed knit top with a soft stretch feel.',
    price: 34.0,
    imageUrl: PRODUCT_IMAGES.WOMEN[1],
    category: PRODUCT_CATEGORIES.WOMEN,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L, PRODUCT_SIZES.XL],
    stockBySize: { S: 20, M: 18, L: 14, XL: 10 }
  },
  {
    name: 'High-Rise Denim',
    description: 'High-rise jeans with tapered leg.',
    price: 72.0,
    imageUrl: PRODUCT_IMAGES.WOMEN[2],
    category: PRODUCT_CATEGORIES.WOMEN,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 10, M: 9, L: 7 }
  },
  {
    name: 'Relaxed Linen Shirt',
    description: 'Breathable linen shirt for warm weather.',
    price: 58.0,
    imageUrl: PRODUCT_IMAGES.WOMEN[3],
    category: PRODUCT_CATEGORIES.WOMEN,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 15, M: 13, L: 11 }
  },
  {
    name: 'Wrap Midi Skirt',
    description: 'Flowy wrap skirt with adjustable waist.',
    price: 52.0,
    imageUrl: PRODUCT_IMAGES.WOMEN[0],
    category: PRODUCT_CATEGORIES.WOMEN,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 14, M: 12, L: 10 }
  },
  {
    name: 'Cropped Cardigan',
    description: 'Soft cropped cardigan for layering.',
    price: 46.0,
    imageUrl: PRODUCT_IMAGES.WOMEN[1],
    category: PRODUCT_CATEGORIES.WOMEN,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L, PRODUCT_SIZES.XL],
    stockBySize: { S: 16, M: 14, L: 12, XL: 9 }
  },
  {
    name: 'Satin Blouse',
    description: 'Satin blouse with a subtle sheen.',
    price: 55.0,
    imageUrl: PRODUCT_IMAGES.WOMEN[2],
    category: PRODUCT_CATEGORIES.WOMEN,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 11, M: 9, L: 7 }
  },
  {
    name: 'Tailored Blazer',
    description: 'Structured blazer with a clean silhouette.',
    price: 98.0,
    imageUrl: PRODUCT_IMAGES.WOMEN[3],
    category: PRODUCT_CATEGORIES.WOMEN,
    sizes: [PRODUCT_SIZES.M, PRODUCT_SIZES.L, PRODUCT_SIZES.XL],
    stockBySize: { M: 8, L: 7, XL: 5 }
  },
  {
    name: 'Cozy Lounge Set',
    description: 'Matching top and bottom in soft knit.',
    price: 76.0,
    imageUrl: PRODUCT_IMAGES.WOMEN[0],
    category: PRODUCT_CATEGORIES.WOMEN,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L, PRODUCT_SIZES.XL],
    stockBySize: { S: 13, M: 11, L: 9, XL: 7 }
  },
  {
    name: 'Kids Floral Frock',
    description: 'Lightweight frock with floral patterns.',
    price: 29.99,
    imageUrl: PRODUCT_IMAGES.KIDS[0],
    category: PRODUCT_CATEGORIES.KIDS,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 18, M: 16, L: 14 }
  },
  {
    name: 'Kids Party Frock',
    description: 'Party-ready frock with a soft inner lining.',
    price: 26.0,
    imageUrl: PRODUCT_IMAGES.KIDS[1],
    category: PRODUCT_CATEGORIES.KIDS,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 22, M: 18, L: 15 }
  },
  {
    name: 'Kids Satin Frock',
    description: 'Satin finish frock with a gentle shine.',
    price: 38.0,
    imageUrl: PRODUCT_IMAGES.KIDS[2],
    category: PRODUCT_CATEGORIES.KIDS,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 12, M: 10, L: 8 }
  },
  {
    name: 'Kids Printed Frock',
    description: 'Printed frock for everyday comfort.',
    price: 19.0,
    imageUrl: PRODUCT_IMAGES.KIDS[0],
    category: PRODUCT_CATEGORIES.KIDS,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 24, M: 20, L: 16 }
  },
  {
    name: 'Kids Ruffle Frock',
    description: 'Ruffled frock with soft layers.',
    price: 18.0,
    imageUrl: PRODUCT_IMAGES.KIDS[1],
    category: PRODUCT_CATEGORIES.KIDS,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 20, M: 18, L: 14 }
  },
  {
    name: 'Kids Sleeveless Frock',
    description: 'Sleeveless frock for warm days.',
    price: 32.0,
    imageUrl: PRODUCT_IMAGES.KIDS[2],
    category: PRODUCT_CATEGORIES.KIDS,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 16, M: 14, L: 12 }
  },
  {
    name: 'Kids Bow Frock',
    description: 'Frock with a decorative bow detail.',
    price: 36.0,
    imageUrl: PRODUCT_IMAGES.KIDS[0],
    category: PRODUCT_CATEGORIES.KIDS,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 14, M: 12, L: 10 }
  },
  {
    name: 'Kids Summer Frock',
    description: 'Airy summer frock with soft fabric.',
    price: 34.0,
    imageUrl: PRODUCT_IMAGES.KIDS[1],
    category: PRODUCT_CATEGORIES.KIDS,
    sizes: [PRODUCT_SIZES.S, PRODUCT_SIZES.M, PRODUCT_SIZES.L],
    stockBySize: { S: 15, M: 13, L: 11 }
  }
];
