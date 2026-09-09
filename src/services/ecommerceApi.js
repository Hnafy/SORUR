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

const normalizeCode = (code) =>
  String(code || '').trim().toUpperCase();

const getCouponsFromResponse = (response) =>
  response?.data?.coupons || [];

const normalizeCouponDate = (date) => {
  if (!date) return undefined;
  return new Date(`${date}T23:59:59.000Z`).toISOString();
};

const buildCouponPayload = (coupon) => {
  const payload = {
    name: String(coupon.name || '').trim(),
    couponCode: normalizeCode(coupon.couponCode),
    type: 'FLAT',
    discountValue: Number(coupon.discountValue),
    minimumCartValue: Number(coupon.minimumCartValue || 0),
  };
  const expiryDate = normalizeCouponDate(coupon.expiryDate);
  if (expiryDate) payload.expiryDate = expiryDate;
  return payload;
};

const normalizeCategoryShort = (category) => {
  if (!category) return null;
  return {
    id: category._id || category.id,
    name: category.name || '',
    owner: category.owner?.toString?.() || category.owner || null,
    createdAt: category.createdAt || null,
    updatedAt: category.updatedAt || null,
  };
};

const cartRemoteProductId = (product) =>
  product?.apiId || product?._id || product?.remoteId || product?.id || null;

const resolveCartProductId = (product) => {
  const remoteId = cartRemoteProductId(product);
  if (!remoteId) {
    throw new Error('Product ID is missing or invalid.');
  }
  return remoteId;
};

const normalizeCartItem = (cartItem) => {
  const product = cartItem?.product || {};
  const productId = product._id || cartItem.productId || cartItem.id;
  return {
    id: productId,
    apiId: productId,
    cartItemId: cartItem._id,
    name: product.name || 'Product',
    price: Number(product.price || 0),
    stock: Number(product.stock || 0),
    quantity: Number(cartItem.quantity || 1),
    image: product.mainImage?.url || product.image || '',
    color: cartItem.color || 'Default',
  };
};

const getCartItems = (response) =>
  response?.data?.items || response?.items || [];

const getCartStock = (product) => Number(product?.stock || 0);

export const profileApi = {
  async getMyProfile() {
    return api.get('/ecommerce/profile');
  },

  async updateMyProfile(body) {
    return api.patch('/ecommerce/profile', body);
  },

  async getMyOrders({ page = 1, limit = 20 } = {}) {
    return api.get('/ecommerce/profile/my-orders', { params: { page, limit } });
  },
};

export const addressApi = {
  async getAllAddresses({ page = 1, limit = 50 } = {}) {
    const res = await api.get('/ecommerce/addresses', { params: { page, limit } });
    return res?.data || res;
  },

  async getAddressById(addressId) {
    const res = await api.get(`/ecommerce/addresses/${addressId}`);
    return res?.data || res;
  },

  async createAddress(body) {
    const res = await api.post('/ecommerce/addresses', body);
    return res?.data || res;
  },

  async updateAddress(addressId, body) {
    const res = await api.patch(`/ecommerce/addresses/${addressId}`, body);
    return res?.data || res;
  },

  async deleteAddress(addressId) {
    const res = await api.delete(`/ecommerce/addresses/${addressId}`);
    return res?.data || res;
  },

  async setDefaultAddress(addressId) {
    const res = await api.patch(`/ecommerce/addresses/${addressId}/default`);
    return res?.data || res;
  },
};

export const categoryApi = {
  async fetchCategories({ page = 1, limit = 50, search = '' } = {}) {
    const params = { page, limit };
    if (search) params.query = search;
    const res = await api.get('/ecommerce/categories', { params });
    const data = res?.data || res || {};
    return {
      categories: (data.categories || []).map(normalizeCategoryShort),
      totalCategories: data.totalCategories || 0,
      totalPages: data.totalPages || 1,
      page: data.page || page,
      limit: data.limit || limit,
      hasNextPage: !!data.hasNextPage,
      hasPrevPage: !!data.hasPrevPage,
    };
  },

  async createCategory(name) {
    const res = await api.post('/ecommerce/categories', { name });
    return normalizeCategoryShort(res?.data || res || null);
  },

  async updateCategory(id, name) {
    const res = await api.patch(`/ecommerce/categories/${id}`, { name });
    return normalizeCategoryShort(res?.data || res || null);
  },

  async deleteCategory(id) {
    const res = await api.delete(`/ecommerce/categories/${id}`);
    return res?.data?.deletedCategory || res?.data || null;
  },
};

export const couponApi = {
  async getAvailableCoupons() {
    const response = await api.get('/ecommerce/coupons/customer/available', {
      params: { page: 1, limit: 50 },
    });
    return getCouponsFromResponse(response);
  },

  async applyCoupon(couponCode) {
    const normalizedCode = normalizeCode(couponCode);
    if (!normalizedCode) {
      throw new Error('Please enter a coupon code.');
    }
    return api.post('/ecommerce/coupons/c/apply', { couponCode: normalizedCode });
  },

  async removeCoupon(couponCode) {
    const normalizedCode = normalizeCode(couponCode);
    if (!normalizedCode) {
      throw new Error('No coupon is currently applied.');
    }
    return api.post('/ecommerce/coupons/c/remove', { couponCode: normalizedCode });
  },

  async getAdminCoupons() {
    const response = await api.get('/ecommerce/coupons', {
      params: { page: 1, limit: 100 },
    });
    return getCouponsFromResponse(response);
  },

  async getCouponById(couponId) {
    const response = await api.get(`/ecommerce/coupons/${couponId}`);
    return response?.data;
  },

  async createCoupon(coupon) {
    const response = await api.post('/ecommerce/coupons', buildCouponPayload(coupon));
    return response?.data;
  },

  async updateCoupon(couponId, coupon) {
    const response = await api.patch(`/ecommerce/coupons/${couponId}`, buildCouponPayload(coupon));
    return response?.data;
  },

  async updateCouponStatus(couponId, isActive) {
    const response = await api.patch(`/ecommerce/coupons/status/${couponId}`, {
      isActive: Boolean(isActive),
    });
    return response?.data;
  },

  async deleteCoupon(couponId) {
    const response = await api.delete(`/ecommerce/coupons/${couponId}`);
    return response?.data;
  },
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

  async fetchAllCategories({ limit = 100 } = {}) {
    const res = await api.get('/ecommerce/categories', { params: { page: 1, limit } });
    const data = res?.data || res || {};
    return (data.categories || []).map((c) => ({
      id: c._id || c.id,
      name: c.name || '',
    }));
  },

  async createProduct(payload, onUploadProgress) {
    const res = await api.post('/ecommerce/products', buildProductFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
    return normalizeProductAdmin(res?.data || res || null);
  },

  async updateProduct(id, payload, onUploadProgress) {
    const res = await api.patch(`/ecommerce/products/${id}`, buildProductFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
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

export const orderApi = {
  async getMyOrders({ page = 1, limit = 20, status } = {}) {
    const params = { page, limit };
    if (status) params.status = status;
    return api.get('/ecommerce/profile/my-orders', { params });
  },

  async getOrderListAdmin({ page = 1, limit = 20, status } = {}) {
    const params = { page, limit };
    if (status) params.status = status;
    return api.get('/ecommerce/orders/list/admin', { params });
  },

  async getOrderById(orderId) {
    return api.get(`/ecommerce/orders/${orderId}`);
  },

  async createOrder(body) {
    return api.post('/ecommerce/orders', body);
  },

  async updateOrderStatus(orderId, status) {
    return api.patch(`/ecommerce/orders/status/${orderId}`, { status });
  },
};

export const cartApi = {
  async getCart() {
    const response = await api.get('/ecommerce/cart');
    return getCartItems(response).map(normalizeCartItem);
  },

  async addItem({ product, quantity = 1 }) {
    const stock = getCartStock(product);
    if (quantity < 1 || (stock > 0 && quantity > stock)) {
      throw new Error(`Only ${stock} item(s) are available.`);
    }
    const productId = resolveCartProductId(product);
    await api.post(`/ecommerce/cart/item/${productId}`, { quantity });
    return this.getCart();
  },

  async updateItem({ productId, quantity }) {
    if (quantity < 1) {
      throw new Error('Quantity must be at least 1.');
    }
    await api.post(`/ecommerce/cart/item/${productId}`, { quantity });
    return this.getCart();
  },

  async removeItem({ productId }) {
    await api.delete(`/ecommerce/cart/item/${productId}`);
    return this.getCart();
  },

  async clearCart() {
    await api.delete('/ecommerce/cart/clear');
    return [];
  },
};

export const checkoutApi = {
  async getAddresses() {
    const response = await api.get('/ecommerce/addresses', {
      params: { page: 1, limit: 50 },
    });
    return response?.data?.addresses || [];
  },

  async createAddress(address) {
    const payload = {
      addressLine1: String(address.addressLine1 || '').trim(),
      city: String(address.city || '').trim(),
      state: String(address.state || '').trim(),
      pincode: String(address.pincode || '').trim(),
      country: String(address.country || '').trim(),
    };
    const addressLine2 = String(address.addressLine2 || '').trim();
    if (addressLine2) payload.addressLine2 = addressLine2;

    if (!payload.addressLine1 || !payload.city || !payload.state || !payload.pincode || !payload.country) {
      throw new Error('من فضلك املئي كل بيانات العنوان المطلوبة.');
    }

    const response = await api.post('/ecommerce/addresses', payload);
    if (!response?.data?._id) {
      throw new Error(response?.message || 'FreeAPI لم يرجع بيانات العنوان بشكل صحيح.');
    }
    return response.data;
  },

  async createRazorpayOrder(addressId) {
    const response = await api.post('/ecommerce/orders/provider/razorpay', { addressId });
    return response?.data;
  },

  async verifyRazorpayPayment(payload) {
    const response = await api.post('/ecommerce/orders/provider/razorpay/verify-payment', payload);
    return response?.data;
  },
};

export const createMockPaymentResult = (address, items) => ({
  _id: `mock-order-${Date.now()}`,
  status: 'PENDING',
  isPaymentDone: true,
  paymentProvider: 'MOCK',
  paymentId: `mock-payment-${Date.now()}`,
  address,
  items: items.map((item) => ({
    _id: `${item.id}-${item.color || 'default'}`,
    product: item,
    quantity: item.quantity,
  })),
});

export const loadRazorpayScript = () => {
  if (window.Razorpay) {
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    const scriptUrl = 'https://checkout.razorpay.com/v1/checkout.js';
    const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true), { once: true });
      existingScript.addEventListener('error', () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const authApi = {
  register: (payload) => api.post('/users/register', payload),
  login: (email, password) => api.post('/users/login', { email, password }),
  logout: () => api.post('/users/logout'),
  refreshToken: (refreshToken) => api.post('/users/refresh-token', { refreshToken }),
  currentUser: () => api.get('/users/current-user'),
};

export const ecommerceApi = {
  profile: profileApi,
  address: addressApi,
  category: categoryApi,
  coupon: couponApi,
  product: productApi,
  order: orderApi,
  cart: cartApi,
  checkout: checkoutApi,
  auth: authApi,
};

export default ecommerceApi;