const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/error');

const parseNumber = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

const normalizeStockBySize = (stockBySize) => {
  if (!stockBySize || typeof stockBySize !== 'object') return undefined;
  const normalized = {};
  for (const [size, qty] of Object.entries(stockBySize)) {
    normalized[String(size).toUpperCase()] = Number(qty);
  }
  return normalized;
};

const listProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    size,
    minPrice,
    maxPrice,
    page = 1,
    limit = 10,
    sort
  } = req.query;

  const filter = { isActive: true };

  if (search) {
    filter.$text = { $search: String(search) };
  }

  if (category) {
    filter.category = String(category).toUpperCase();
  }

  if (size) {
    filter.sizes = { $in: [String(size).toUpperCase()] };
  }

  const min = parseNumber(minPrice);
  const max = parseNumber(maxPrice);
  if (min !== undefined || max !== undefined) {
    filter.price = {};
    if (min !== undefined) filter.price.$gte = min;
    if (max !== undefined) filter.price.$lte = max;
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const sortMap = {
    price: 'price',
    '-price': '-price',
    createdAt: 'createdAt',
    '-createdAt': '-createdAt',
    name: 'name',
    '-name': '-name'
  };

  let sortBy = sortMap[sort];
  if (!sortBy && search) {
    sortBy = { score: { $meta: 'textScore' }, createdAt: -1 };
  }
  if (!sortBy) sortBy = '-createdAt';

  const query = Product.find(filter)
    .select(
      search ? { score: { $meta: 'textScore' }, stockBySize: 0 } : '-stockBySize'
    )
    .sort(sortBy)
    .skip(skip)
    .limit(limitNum);

  const [products, total] = await Promise.all([
    query.lean(),
    Product.countDocuments(filter)
  ]);

  res.json({
    data: products,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum)
    }
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    isActive: true
  })
    .select('-stockBySize')
    .lean();

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.json({ data: product });
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, imageUrl, category, sizes, stockBySize } =
    req.body;

  const product = await Product.create({
    name: name.trim(),
    description: description.trim(),
    price: Number(price),
    imageUrl: imageUrl.trim(),
    category: String(category).toUpperCase(),
    sizes: sizes.map((size) => String(size).toUpperCase()),
    stockBySize: normalizeStockBySize(stockBySize)
  });

  res.status(201).json({ data: product });
});

module.exports = { listProducts, getProductById, createProduct };
