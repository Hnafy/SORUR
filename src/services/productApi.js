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

// Preserves raw server shape needed by the admin editor: sub-images keep their
// _id so they can be removed individually via removeSubImage.
export const normalizeProductAdmin = (product) => {
  if (!product) return null;
  const mainImageUrl =
    typeof product.mainImage === 'string'
      ? product.mainImage
      : product.mainImage?.url || product.mainImage?.localPath || '';
  const subImages = (product.subImages || [])
    .map((img) => ({
      id: img._id || null,
      url: typeof img === 'string' ? img : img?.url || img?.localPath || '',
    }))
    .filter((s) => s.url);
  const category = product.category;
  return {
    id: product._id || product.id,
    name: product.name || product.title || '',
    description: product.description || '',
    price: product.price ?? 0,
    stock: product.stock ?? 0,
    categoryId: typeof category === 'object' && category ? category._id || category.id || '' : String(category || ''),
    categoryName: typeof category === 'object' && category ? category.name || '' : '',
    mainImage: mainImageUrl,
    subImages,
  };
};

const buildProductFormData = (payload) => {
  const fd = new FormData();
  fd.append('name', payload.name);
  fd.append('description', payload.description || '');
  fd.append('category', payload.category);
  fd.append('price', payload.price);
  fd.append('stock', payload.stock);
  if (payload.mainImage instanceof File) {
    fd.append('mainImage', payload.mainImage);
  }
  (payload.subImages || []).forEach((f) => {
    if (f instanceof File) fd.append('subImages', f);
  });
  return fd;
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

  // Admin list (richer shape for the admin table/edit form)
  async fetchAdminProducts({ page = 1, limit = 10 } = {}) {
    const res = await api.get('/ecommerce/products', { params: { page, limit } });
    const data = res?.data || res || {};
    return {
      products: (data.products || []).map(normalizeProductAdmin),
      totalProducts: data.totalProducts || 0,
      totalPages: data.totalPages || 1,
      page: data.page || page,
      limit: data.limit || limit,
      hasNextPage: !!data.hasNextPage,
      hasPrevPage: !!data.hasPrevPage,
    };
  },

  // Flat category list for the product form dropdown
  async fetchAllCategories({ limit = 100 } = {}) {
    const res = await api.get('/ecommerce/categories', { params: { page: 1, limit } });
    const data = res?.data || res || {};
    return (data.categories || []).map((c) => ({
      id: c._id || c.id,
      name: c.name || '',
    }));
  },

  // Multipart create (mainImage File required by FreeAPI)
  async createProduct(payload, onUploadProgress) {
    const res = await api.post('/ecommerce/products', buildProductFormData(payload), { onUploadProgress });
    return normalizeProductAdmin(res?.data || res || null);
  },

  // Multipart update. ALWAYS include category (FreeAPI 422 otherwise). New
  // sub-images are appended to existing ones; mainImage only replaced if a File
  // is present.
  async updateProduct(id, payload, onUploadProgress) {
    const res = await api.patch(`/ecommerce/products/${id}`, buildProductFormData(payload), { onUploadProgress });
    return normalizeProductAdmin(res?.data || res || null);
  },

  async deleteProduct(id) {
    const res = await api.delete(`/ecommerce/products/${id}`);
    return res?.data?.deletedProduct || res?.data || null;
  },

  async removeSubImage(productId, subImageId) {
    const res = await api.patch(`/ecommerce/products/remove/subimage/${productId}/${subImageId}`);
    return normalizeProductAdmin(res?.data || res || null);
  },
};

export default productApi;
