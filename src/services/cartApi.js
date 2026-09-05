import api from './api';

const getRemoteProductId = (product) =>
  product?.apiId || product?._id || product?.remoteId || product?.id || null;

const resolveProductId = (product) => {
  const remoteId = getRemoteProductId(product);

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

const getCart = async () => {
  const response = await api.get('/ecommerce/cart');
  return getCartItems(response).map(normalizeCartItem);
};

const getStock = (product) => Number(product?.stock || 0);

const cartApi = {
  getCart,

  async addItem({ product, quantity = 1 }) {
    const stock = getStock(product);
    if (quantity < 1 || (stock > 0 && quantity > stock)) {
      throw new Error(`Only ${stock} item(s) are available.`);
    }

    const productId = resolveProductId(product);
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