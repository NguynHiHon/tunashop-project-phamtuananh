const productService = require('../services/productService');

// Create product: delegates validation/business logic to service (supports sale fields)
exports.createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    return res.status(201).json({ message: 'Product created', data: product });
  } catch (err) {
    console.error('createProduct error', err);
    return res.status(err.status || 500).json({ message: err.message || 'Internal server error', errors: err.details || undefined });
  }
};

// Update product (includes sale fields)
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

// Update sale-only fields to avoid accidental product edits from sale manager
exports.updateProductSale = async (req, res) => {
  try {
    const { id } = req.params;
    const { salePercent, saleStartAt, saleEndAt } = req.body;
    const product = await productService.updateProduct(id, { salePercent, saleStartAt, saleEndAt });
    return res.json({ message: 'Sale updated', data: product });
  } catch (err) {
    console.error('updateProductSale error', err);
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
    const result = await productService.getProducts(req.query);
    return res.json(result);
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
exports.getBrands = async (req, res) => {
  try {
    const brands = await productService.getBrands();
    return res.json({ data: brands });
  } catch (err) {
    console.error('getBrands error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
