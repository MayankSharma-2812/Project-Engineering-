import { getProducts, getProductById } from './product.service.js';

const ALLOWED_FIELDS = ['id', 'name', 'description', 'price', 'category', 'stock', 'imageUrl', 'isActive', 'createdAt', 'updatedAt'];

export async function listProducts(req, res) {
  try {
    let { page = '1', limit = '20', sortBy = 'id', order = 'asc', fields } = req.query;

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    if (isNaN(parsedPage) || parsedPage <= 0) {
      return res.status(400).json({ error: 'Invalid page parameter' });
    }
    
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      return res.status(400).json({ error: 'Invalid limit parameter' });
    }

    const finalLimit = Math.min(parsedLimit, 100);

    if (!ALLOWED_FIELDS.includes(sortBy)) {
      return res.status(400).json({ error: 'Invalid sortBy parameter' });
    }

    if (order !== 'asc' && order !== 'desc') {
      return res.status(400).json({ error: 'Invalid order parameter' });
    }

    let selectFields = undefined;
    if (fields) {
      const requestedFields = fields.split(',').map(f => f.trim());
      selectFields = {};
      for (const field of requestedFields) {
        if (!ALLOWED_FIELDS.includes(field)) {
          return res.status(400).json({ error: `Invalid field requested: ${field}` });
        }
        selectFields[field] = true;
      }
    }

    const { data, meta } = await getProducts({ 
      page: parsedPage, 
      limit: finalLimit, 
      sortBy, 
      order, 
      selectFields 
    });
    
    res.json({ data, meta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getProduct(req, res) {
  try {
    const id = parseInt(req.params.id);
    const product = await getProductById(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}