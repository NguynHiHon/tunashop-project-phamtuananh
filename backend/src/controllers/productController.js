const Product = require('../models/Product');
const Image = require('../models/Image');
const mongoose = require('mongoose');

const productService = require('../services/productService');

// Create product: accepts images as array of URLs
exports.createProduct = async (req, res) => {
  try {
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
    } = req.body;

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

    // If images provided (array of URLs), create Image docs
    let imageIds = [];
    if (Array.isArray(images) && images.length > 0) {
      for (const url of images) {
        // URL already validated above
        const img = new Image({ url_Image: url, productId: product._id });
        await img.save();
        imageIds.push(img._id);
      }

      product.imageIds = imageIds;

      // determine defaultImageId (ensure defaultImageUrl belongs to images)
      if (defaultImageUrl) {
        const idx = images.indexOf(defaultImageUrl);
        if (idx !== -1) product.defaultImageId = imageIds[idx];
        else {
          // if provided defaultImageUrl not in images, ignore it
        }
      }
      if (!product.defaultImageId && imageIds.length > 0) product.defaultImageId = imageIds[0];
    }

    await product.save();

    return res.status(201).json({ message: 'Product created', data: product });
  } catch (err) {
    console.error('createProduct error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
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
    } = req.body;

    if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid product id' });
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await product.save();

    return res.json({ message: 'Product updated', data: product });
  } catch (err) {
    console.error('updateProduct error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Simple get product
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate('defaultImageId').populate('imageIds');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    return res.json({ data: product });
  } catch (err) {
    console.error('getProduct error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// List products (no pagination for simplicity)
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('defaultImageId');
    return res.json({ data: products });
  } catch (err) {
    console.error('getProducts error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Optionally remove associated Image docs
    await Image.deleteMany({ productId: product._id });
    await product.remove();

    return res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('deleteProduct error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.updateProduct(id, req.body);
    return res.json({ message: 'Product updated', data: product });
  } catch (err) {
    console.error('updateProduct error', err);
    return res.status(err.status || 500).json({ message: err.message || 'Internal server error', errors: err.details || undefined });
  }
};
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.getProduct(id);
    return res.json({ data: product });
  } catch (err) {
    console.error('getProduct error', err);
    return res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
  }
};
exports.getProducts = async (req, res) => {
  try {
    const products = await productService.getProducts();
    return res.json({ data: products });
  } catch (err) {
    console.error('getProducts error', err);
    return res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
  }
};
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(id);
    return res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('deleteProduct error', err);
    return res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
  }
};
