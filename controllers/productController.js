const Product = require('../models/Product');

const withTimeout = (promise, timeoutMs = 15000) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), timeoutMs)),
  ]);

// Create product
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Math.min(Number(req.query.limit || 100), 500); // limit 500 for safety
    const offset = (page - 1) * limit;

    const result = await withTimeout(
      Product.findAndCountAll({
        limit,
        offset,
        order: [['id', 'ASC']],
      }),
      15000
    );

    // Maintain compatibility: return only the array; put count in headers
    res.set('X-Total-Count', String(result.count || 0));
    res.json(result.rows);
  } catch (err) {
    const status = err.message === 'Query timeout' ? 408 : 500;
    res.status(status).json({ error: 'Error fetching products', details: err.message });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await withTimeout(Product.findByPk(req.params.id));
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    const status = err.message === 'Query timeout' ? 408 : 500;
    res.status(status).json({ error: 'Error fetching product', details: err.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const [updated] = await withTimeout(Product.update(req.body, { where: { id: req.params.id } }));
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    const product = await withTimeout(Product.findByPk(req.params.id));
    res.json(product);
  } catch (err) {
    const status = err.message === 'Query timeout' ? 408 : 400;
    res.status(status).json({ error: 'Error updating product', details: err.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await withTimeout(Product.destroy({ where: { id: req.params.id } }));
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    const status = err.message === 'Query timeout' ? 408 : 500;
    res.status(status).json({ error: 'Error deleting product', details: err.message });
  }
};

// Health endpoint for diagnostics without mutating the DB
exports.getProductsHealth = async (_req, res) => {
  try {
    const start = Date.now();
    const count = await withTimeout(Product.count(), 5000);
    res.json({ ok: true, count, latencyMs: Date.now() - start, time: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message, time: new Date().toISOString() });
  }
};
