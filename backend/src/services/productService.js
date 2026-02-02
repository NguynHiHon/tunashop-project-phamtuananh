const Product = require('../models/Product');
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
    productTypeId,
    attributes,
    price,
    warranty,
    stock,
    description,
    images, // array of URLs
    defaultImageUrl,
  } = payload;

  const errors = [];
  if (!name || typeof name !== 'string' || name.trim() === '') errors.push('name is required');
  if (!productTypeId || !isValidObjectId(productTypeId)) errors.push('productTypeId is required and must be a valid id');
  if (price === undefined || price === null || isNaN(Number(price))) errors.push('price is required and must be a number');
  if (stock !== undefined && (isNaN(Number(stock)) || Number(stock) < 0)) errors.push('stock must be a non-negative number');
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
    productTypeId,
    attributes: attributes || [],
    price,
    warranty,
    stock: stock || 0,
    description,
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
    productTypeId,
    attributes,
    price,
    warranty,
    stock,
    description,
    images,
    defaultImageUrl,
  } = payload;

  const errors = [];
  if (productTypeId !== undefined && !isValidObjectId(productTypeId)) errors.push('productTypeId must be a valid id');
  if (price !== undefined && isNaN(Number(price))) errors.push('price must be a number');
  if (stock !== undefined && (isNaN(Number(stock)) || Number(stock) < 0)) errors.push('stock must be a non-negative number');
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
  if (productTypeId !== undefined) product.productTypeId = productTypeId;
  if (attributes !== undefined) product.attributes = attributes;
  if (price !== undefined) product.price = price;
  if (warranty !== undefined) product.warranty = warranty;
  if (stock !== undefined) product.stock = stock;
  if (description !== undefined) product.description = description;

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
  const product = await Product.findById(id).populate('defaultImageId').populate('imageIds');
  if (!product) { const err = new Error('Product not found'); err.status = 404; throw err; }
  return product;
}

async function getProducts() {
  const products = await Product.find().populate('defaultImageId');
  return products;
}

async function deleteProduct(id) {
  if (!isValidObjectId(id)) { const err = new Error('Invalid product id'); err.status = 400; throw err; }
  const product = await Product.findById(id);
  if (!product) { const err = new Error('Product not found'); err.status = 404; throw err; }
  await Image.deleteMany({ productId: product._id });
  await product.remove();
  return;
}

module.exports = { createProduct, updateProduct, getProduct, getProducts, deleteProduct };
