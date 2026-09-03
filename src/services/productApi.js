import api from './api';

const normalizeImage = (img) => {
  if (!img) return null;
  if (typeof img === 'string') return img;
  return img.url || img.localPath || null;
};

const normalizeCategory = (category) => {
  if (!category) return { id: '', name: 'غير مصنف' };
  if (typeof category === 'string') return { id: category, name: 'غير مصنف' };
  return {
    id: category._id || category.id || '',
    name: category.name || 'غير مصنف',
  };
};

export const normalizeProduct = (product) => {
  if (!product) return null;
  const mainImage = normalizeImage(product.mainImage);
  const subImages = (product.subImages || [])
    .map(normalizeImage)
    .filter(Boolean);

  return {
    id: product._id || product.id,
    name: product.name || product.title,
    description: product.description || '',
    price: product.price ?? 0,
    originalPrice: product.originalPrice ?? null,
    stock: product.stock ?? 0,
    image: mainImage,
    gallery: subImages.length ? [mainImage, ...subImages].filter(Boolean) : [mainImage].filter(Boolean),
    category: normalizeCategory(product.category),
    rating: product.rating ?? 4.8,
    badge: product.badge || null,
  };
};

export const productApi = {
  async fetchCategories() {
    const res = await api.get('/ecommerce/categories');
    const categories = res?.data?.categories || res?.data || [];
    return categories.map((category) => category);
  },

  async fetchProducts({ page = 1, limit = 12, query = '', category = '' } = {}) {
    const params = { page, limit };
    if (query) params.query = query;
    if (category) params.category = category;

    const res = await api.get('/ecommerce/products', { params });
    const data = res?.data || res || {};

    return {
      products: (data.products || []).map(normalizeProduct),
      totalProducts: data.totalProducts || 0,
      totalPages: data.totalPages || 1,
      page: data.page || page,
      limit: data.limit || limit,
      hasNextPage: !!data.hasNextPage,
      hasPrevPage: !!data.hasPrevPage,
    };
  },

  async fetchProductById(id) {
    const res = await api.get(`/ecommerce/products/${id}`);
    const product = res?.data?.product || res?.data || res;
    return normalizeProduct(product);
  },
};

export default productApi;
