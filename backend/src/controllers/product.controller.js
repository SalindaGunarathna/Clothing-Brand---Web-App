const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/error');
const logger = require('../config/logger');

const parseNumber = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

// Normalize stock map keys to uppercase size labels.
const normalizeStockBySize = (stockBySize) => {
  if (!stockBySize || typeof stockBySize !== 'object') return undefined;
  const normalized = {};
  for (const [size, qty] of Object.entries(stockBySize)) {
    normalized[String(size).toUpperCase()] = Number(qty);
  }
  return normalized;
};

const buildSort = (sort, search) => {
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
    // When searching, prioritize text relevance then newest items.
    sortBy = { score: { $meta: 'textScore' }, createdAt: -1 };
  }
  if (!sortBy) sortBy = '-createdAt';
  return sortBy;
};

const applySearchFilter = (filter, search) => {
  if (search) {
    filter.$text = { $search: String(search) };
  }
};

// Public product listing with search, filters, sorting, and pagination.
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

  // Text search relies on the Product text index and enables relevance sorting.
  applySearchFilter(filter, search);

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

  const sortBy = buildSort(sort, search);

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

  logger.debug(
    {
      hasSearch: Boolean(search),
      category: category ? String(category).toUpperCase() : undefined,
      size: size ? String(size).toUpperCase() : undefined,
      minPrice: min,
      maxPrice: max,
      page: pageNum,
      limit: limitNum,
      total,
      returned: products.length
    },
    'DEBUG Products listed'
  );

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

// Admin product listing with filters, sorting, and pagination.
const listAdminProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    size,
    minPrice,
    maxPrice,
    status,
    page = 1,
    limit = 10,
    sort
  } = req.query;

  const filter = {};
  applySearchFilter(filter, search);

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

  if (status && String(status).toLowerCase() !== 'all') {
    filter.isActive = String(status).toLowerCase() === 'active';
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const skip = (pageNum - 1) * limitNum;
  const sortBy = buildSort(sort, search);

  const query = Product.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limitNum);

  if (search) {
    query.select({ score: { $meta: 'textScore' } });
  }

  const [products, total] = await Promise.all([
    query.lean(),
    Product.countDocuments(filter)
  ]);

  logger.debug(
    {
      hasSearch: Boolean(search),
      category: category ? String(category).toUpperCase() : undefined,
      size: size ? String(size).toUpperCase() : undefined,
      minPrice: min,
      maxPrice: max,
      status: status ? String(status).toLowerCase() : 'all',
      page: pageNum,
      limit: limitNum,
      total,
      returned: products.length
    },
    'DEBUG Admin products listed'
  );

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

// Public product detail endpoint.
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

  logger.debug({ productId: product._id }, 'DEBUG Product fetched');

  res.json({ data: product });
});

// Admin-only product creation.
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

  logger.info(
    {
      productId: product._id,
      category: product.category,
      price: product.price
    },
    'INFO Product created'
  );

  res.status(201).json({ data: product });
});

// Admin-only product detail endpoint.
const getAdminProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).lean();

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  logger.debug({ productId: product._id }, 'DEBUG Admin product fetched');

  res.json({ data: product });
});

// Admin-only product update.
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    imageUrl,
    category,
    sizes,
    stockBySize,
    isActive
  } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  if (name !== undefined) {
    product.name = String(name).trim();
  }

  if (description !== undefined) {
    product.description = String(description).trim();
  }

  if (price !== undefined) {
    product.price = Number(price);
  }

  if (imageUrl !== undefined) {
    product.imageUrl = String(imageUrl).trim();
  }

  if (category !== undefined) {
    product.category = String(category).toUpperCase();
  }

  let normalizedSizes;
  const hasSizeUpdate = Array.isArray(sizes);
  if (hasSizeUpdate) {
    normalizedSizes = sizes.map((size) => String(size).toUpperCase());
    product.sizes = normalizedSizes;
  }

  if (stockBySize !== undefined) {
    product.stockBySize = normalizeStockBySize(stockBySize);
  } else if (hasSizeUpdate && product.stockBySize) {
    const allowed = new Set(normalizedSizes);
    const pruned = {};
    for (const [size, qty] of product.stockBySize.entries()) {
      if (allowed.has(size)) {
        pruned[size] = qty;
      }
    }
    product.stockBySize = Object.keys(pruned).length ? pruned : undefined;
  }

  if (isActive !== undefined) {
    product.isActive = isActive;
  }

  await product.save();

  logger.info({ productId: product._id }, 'INFO Product updated');

  res.json({ data: product });
});

module.exports = {
  listProducts,
  listAdminProducts,
  getProductById,
  createProduct,
  getAdminProductById,
  updateProduct
};
