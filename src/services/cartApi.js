import api from './api';
import { INITIAL_PRODUCTS } from '../data/mockData';

const getLocalProduct = (productId) =>
  INITIAL_PRODUCTS.find((product) => product.id === productId);

const getRemoteProductId = (product) =>
  product?.apiId || product?._id || product?.remoteId || null;

const getRemoteProducts = async () => {
  const response = await api.get('/ecommerce/products', {
    params: { page: 1, limit: 100 },
  });

  return response?.data?.products || response?.products || [];
};

const resolveProductId = async (product) => {
  const directId = getRemoteProductId(product);
  if (directId) return directId;

  const remoteProducts = await getRemoteProducts();
  if (!remoteProducts.length) {
    throw new Error('No products were returned by FreeAPI.');
  }

  // المنتجات المحلية عندها prod-001, prod-002...
  // نستخدم رقم المنتج للوصول للمنتج المقابل من FreeAPI.
  const numericPart = String(product.id).match(/\d+/);
  const index = numericPart ? Number(numericPart[0]) - 1 : 0;
  const remoteProduct = remoteProducts[index] || remoteProducts[0];
  const remoteId = remoteProduct?._id || remoteProduct?.id;

  if (!remoteId) {
    throw new Error('The selected FreeAPI product has no valid ID.');
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

const getCart = async () => {
  const response = await api.get('/ecommerce/cart');
  return getCartItems(response).map(normalizeCartItem);
};

const getStock = (product) => {
  const localProduct = getLocalProduct(product?.id);
  return Number(product?.stock || localProduct?.stock || 0);
};

const cartApi = {
  getCart,

  async addItem({ product, quantity = 1 }) {
    const stock = getStock(product);
    if (quantity < 1 || quantity > stock) {
      throw new Error(`Only ${stock} item(s) are available.`);
    }

    const productId = await resolveProductId(product);
    await api.post(`/ecommerce/cart/item/${productId}`, { quantity });
    return getCart();
  },

  async updateItem({ productId, quantity }) {
    if (quantity < 1) {
      throw new Error('Quantity must be at least 1.');
    }

    await api.post(`/ecommerce/cart/item/${productId}`, { quantity });
    return getCart();
  },

  async removeItem({ productId }) {
    await api.delete(`/ecommerce/cart/item/${productId}`);
    return getCart();
  },

  async clearCart() {
    await api.delete('/ecommerce/cart/clear');
    return [];
  },
};

export default cartApi;