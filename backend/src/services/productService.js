const Product = require('../models/Product');
const ProductType = require('../models/ProductType');
const Attribute = require('../models/Attribute');
const Image = require('../models/Image');
const mongoose = require('mongoose');

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function isValidUrl(s) {
  try { const u = new URL(s); return u.protocol === 'http:' || u.protocol === 'https:'; } catch (e) { return false; }
}

async function createProduct(payload) {
  const {
    name,
    brand,
    productTypeId,
    attributes,
    price,
    salePercent,
    saleStartAt,
    saleEndAt,
    warranty,
    stock,
    description,
    images, // array of URLs
    defaultImageUrl,
    hasVariants,
    variants,
  } = payload;

  const errors = [];
  if (!name || typeof name !== 'string' || name.trim() === '') errors.push('name is required');
  if (!productTypeId || !isValidObjectId(productTypeId)) errors.push('productTypeId is required and must be a valid id');
  if (price === undefined || price === null || isNaN(Number(price))) errors.push('price is required and must be a number');
  if (stock !== undefined && (isNaN(Number(stock)) || Number(stock) < 0)) errors.push('stock must be a non-negative number');
  if (salePercent !== undefined && (isNaN(Number(salePercent)) || Number(salePercent) < 0 || Number(salePercent) > 100)) errors.push('salePercent must be between 0 and 100');
  if (saleStartAt && isNaN(Date.parse(saleStartAt))) errors.push('saleStartAt must be a valid date');
  if (saleEndAt && isNaN(Date.parse(saleEndAt))) errors.push('saleEndAt must be a valid date');
  if (saleStartAt && saleEndAt && Date.parse(saleStartAt) > Date.parse(saleEndAt)) errors.push('saleStartAt must be before saleEndAt');
  if (attributes !== undefined) {
    if (!Array.isArray(attributes)) errors.push('attributes must be an array');
    else {
      attributes.forEach((a, idx) => {
        if (!a || !a.attributeId || !isValidObjectId(a.attributeId)) errors.push(`attributes[${idx}].attributeId is required and must be valid`);
        if (a.value === undefined || typeof a.value !== 'string') errors.push(`attributes[${idx}].value is required and must be a string`);
      });
    }
  }
  if (images !== undefined) {
    if (!Array.isArray(images)) errors.push('images must be an array of URLs');
    else images.forEach((u, idx) => { if (!isValidUrl(u)) errors.push(`images[${idx}] is not a valid URL`); });
  }

  if (errors.length > 0) {
    const err = new Error('Validation failed');
    err.details = errors;
    err.status = 400;
    throw err;
  }

  const product = new Product({
    name,
    brand: brand || '',
    productTypeId,
    attributes: attributes || [],
    price,
    salePercent: salePercent || 0,
    saleStartAt,
    saleEndAt,
    warranty,
    stock: stock || 0,
    description,
    hasVariants: hasVariants || false,
    variants: Array.isArray(variants) ? variants : [],
  });

  await product.save();

  let imageIds = [];
  if (Array.isArray(images) && images.length > 0) {
    for (const url of images) {
      const img = new Image({ url_Image: url, productId: product._id });
      await img.save();
      imageIds.push(img._id);
    }

    product.imageIds = imageIds;
    if (defaultImageUrl) {
      const idx = images.indexOf(defaultImageUrl);
      if (idx !== -1) product.defaultImageId = imageIds[idx];
    }
    if (!product.defaultImageId && imageIds.length > 0) product.defaultImageId = imageIds[0];
  }

  await product.save();
  return product;
}

async function updateProduct(id, payload) {
  if (!isValidObjectId(id)) {
    const err = new Error('Invalid product id'); err.status = 400; throw err;
  }

  const product = await Product.findById(id);
  if (!product) { const err = new Error('Product not found'); err.status = 404; throw err; }

  const {
    name,
    brand,
    productTypeId,
    attributes,
    price,
    salePercent,
    saleStartAt,
    saleEndAt,
    warranty,
    stock,
    description,
    images,
    defaultImageUrl,
    hasVariants,
    variants,
  } = payload;

  const errors = [];
  if (productTypeId !== undefined && !isValidObjectId(productTypeId)) errors.push('productTypeId must be a valid id');
  if (price !== undefined && isNaN(Number(price))) errors.push('price must be a number');
  if (stock !== undefined && (isNaN(Number(stock)) || Number(stock) < 0)) errors.push('stock must be a non-negative number');
  if (salePercent !== undefined && (isNaN(Number(salePercent)) || Number(salePercent) < 0 || Number(salePercent) > 100)) errors.push('salePercent must be between 0 and 100');
  if (saleStartAt && isNaN(Date.parse(saleStartAt))) errors.push('saleStartAt must be a valid date');
  if (saleEndAt && isNaN(Date.parse(saleEndAt))) errors.push('saleEndAt must be a valid date');
  if (saleStartAt && saleEndAt && Date.parse(saleStartAt) > Date.parse(saleEndAt)) errors.push('saleStartAt must be before saleEndAt');
  if (attributes !== undefined) {
    if (!Array.isArray(attributes)) errors.push('attributes must be an array');
    else attributes.forEach((a, idx) => {
      if (!a || !a.attributeId || !isValidObjectId(a.attributeId)) errors.push(`attributes[${idx}].attributeId is required and must be valid`);
      if (a.value === undefined || typeof a.value !== 'string') errors.push(`attributes[${idx}].value is required and must be a string`);
    });
  }
  if (images !== undefined) {
    if (!Array.isArray(images)) errors.push('images must be an array of URLs');
    else images.forEach((u, idx) => { if (!isValidUrl(u)) errors.push(`images[${idx}] is not a valid URL`); });
  }

  if (errors.length > 0) { const err = new Error('Validation failed'); err.details = errors; err.status = 400; throw err; }

  if (name !== undefined) product.name = name;
  if (brand !== undefined) product.brand = brand;
  if (productTypeId !== undefined) product.productTypeId = productTypeId;
  if (attributes !== undefined) product.attributes = attributes;
  if (price !== undefined) product.price = price;
  if (salePercent !== undefined) product.salePercent = salePercent;
  if (saleStartAt !== undefined) product.saleStartAt = saleStartAt;
  if (saleEndAt !== undefined) product.saleEndAt = saleEndAt;
  if (warranty !== undefined) product.warranty = warranty;
  if (stock !== undefined) product.stock = stock;
  if (description !== undefined) product.description = description;
  if (hasVariants !== undefined) product.hasVariants = hasVariants;
  if (variants !== undefined && Array.isArray(variants)) product.variants = variants;

  if (Array.isArray(images)) {
    const imageIds = [];
    for (const url of images) {
      const img = new Image({ url_Image: url, productId: product._id });
      await img.save();
      imageIds.push(img._id);
    }
    product.imageIds = imageIds;
    if (defaultImageUrl) {
      const idx = images.indexOf(defaultImageUrl);
      if (idx !== -1) product.defaultImageId = imageIds[idx];
    }
    if (!product.defaultImageId && imageIds.length > 0) product.defaultImageId = imageIds[0];
  }

  await product.save();
  return product;
}

async function getProduct(id) {
  if (!isValidObjectId(id)) { const err = new Error('Invalid product id'); err.status = 400; throw err; }
  const product = await Product.findById(id)
    .populate('defaultImageId')
    .populate('imageIds')
    .populate({
      path: 'productTypeId',
      populate: { path: 'listAttributeIds' }
    })
    .populate('attributes.attributeId');
  if (!product) { const err = new Error('Product not found'); err.status = 404; throw err; }
  return product;
}

async function getProducts(params = {}) {
  const { page, limit, productTypeId, productType, brand, minPrice, maxPrice, sort, search, isOnSale, ...rest } = params;

  const query = {};

  // Filter products currently on sale
  if (isOnSale === 'true' || isOnSale === true) {
    const now = new Date();
    query.salePercent = { $gt: 0 };
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { saleStartAt: { $exists: false } },
        { saleStartAt: null },
        { saleStartAt: { $lte: now } }
      ]
    });
    query.$and.push({
      $or: [
        { saleEndAt: { $exists: false } },
        { saleEndAt: null },
        { saleEndAt: { $gte: now } }
      ]
    });
  }

  // Support filtering by productType name (unique) or productTypeId
  if (productType) {
    const pt = await ProductType.findOne({ name: { $regex: `^${productType}$`, $options: 'i' } });
    if (pt) query.productTypeId = pt._id;
    else query.productTypeId = null; // no match → return empty
  } else if (productTypeId && isValidObjectId(productTypeId)) {
    query.productTypeId = productTypeId;
  }

  // Brand filter: comma-separated brand names
  if (brand) {
    const brands = String(brand).split(',').map(b => b.trim()).filter(Boolean);
    if (brands.length > 0) {
      query.brand = { $in: brands.map(b => new RegExp(`^${b}$`, 'i')) };
    }
  }
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (search) {
    // Mở rộng tìm kiếm: tên, thương hiệu, mô tả, và giá trị thuộc tính
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'attributes.value': { $regex: search, $options: 'i' } }
    ];
  }

  // Attribute filters: attr_<attributeId>=value1,value2
  const attrConditions = [];
  for (const [key, val] of Object.entries(rest)) {
    if (key.startsWith('attr_') && val) {
      const attrId = key.replace('attr_', '');

      if (isValidObjectId(attrId)) {
        // Parse comma-separated values, handle URL encoding và trim spaces
        const values = String(val).split(',').map(v => decodeURIComponent(v.trim())).filter(Boolean);

        if (values.length > 0) {
          // Tạo regex patterns để handle trailing spaces trong database
          const regexValues = values.map(v => {
            const escapedValue = v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // Thêm optional trailing spaces: \s* 
            return new RegExp(`^${escapedValue}\\s*$`, 'i');
          });

          attrConditions.push({
            attributes: {
              $elemMatch: {
                attributeId: new mongoose.Types.ObjectId(attrId),
                value: { $in: regexValues }
              }
            }
          });
        }
      }
    }
  }

  if (attrConditions.length > 0) {
    query.$and = (query.$and || []).concat(attrConditions);
  }

  let sortOption = { createdAt: -1 };
  switch (sort) {
    case 'price_asc': sortOption = { price: 1 }; break;
    case 'price_desc': sortOption = { price: -1 }; break;
    case 'name_asc': sortOption = { name: 1 }; break;
    case 'name_desc': sortOption = { name: -1 }; break;
    case 'newest': sortOption = { createdAt: -1 }; break;
  }

  const isPaginated = page !== undefined || limit !== undefined;

  if (isPaginated) {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query).populate('defaultImageId').populate('productTypeId').sort(sortOption).skip(skip).limit(limitNum),
      Product.countDocuments(query)
    ]);

    return { data: products, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) };
  } else {
    const products = await Product.find(query).populate('defaultImageId').populate('productTypeId').sort(sortOption);
    return { data: products };
  }
}

async function deleteProduct(id) {
  if (!isValidObjectId(id)) { const err = new Error('Invalid product id'); err.status = 400; throw err; }
  const product = await Product.findById(id);
  if (!product) { const err = new Error('Product not found'); err.status = 404; throw err; }
  await Image.deleteMany({ productId: product._id });
  await product.remove();
  return;
}

const DEFAULT_BRANDS = ['Victor', 'Yonex', 'Li-Ning', 'Mizuno', 'Kumbo', 'Acer'];

async function getBrands() {
  // Try to find the "brand" attribute in Attribute schema
  const brandAttr = await Attribute.findOne({ name: { $regex: /^brand$/i } });
  if (brandAttr && brandAttr.options && brandAttr.options.length > 0) {
    return brandAttr.options;
  }
  return DEFAULT_BRANDS;
}

module.exports = { createProduct, updateProduct, getProduct, getProducts, deleteProduct, getBrands };
