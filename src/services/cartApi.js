import { INITIAL_PRODUCTS } from '../data/mockData';

const CART_KEY = 'sorur_cart';

const findProduct = (productId) => {
  return INITIAL_PRODUCTS.find((product) => product.id === productId);
};

const getStock = (productId) => {
  return findProduct(productId)?.stock ?? Number.MAX_SAFE_INTEGER;
};

const getStoredCart = () => {
  try {
    const storedCart = JSON.parse(
      localStorage.getItem(CART_KEY) || '[]'
    );

    if (!Array.isArray(storedCart)) {
      return [];
    }

    return storedCart
      .filter((item) => item?.id && item.quantity > 0)
      .map((item) => ({
        ...item,
        stock: item.stock ?? getStock(item.id),
      }));
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  return items;
};

const simulateRequest = (result) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(result);
    }, 120);
  });
};

export const cartApi = {
  async getCart() {
    const cart = getStoredCart();

    return simulateRequest(cart);
  },

  async addItem({ product, quantity = 1, color = '' }) {
    const cart = getStoredCart();

    const selectedColor =
      color || product.colors?.[0]?.name || 'Default';

    const existingIndex = cart.findIndex(
      (item) =>
        item.id === product.id &&
        item.color === selectedColor
    );

    const currentQuantity =
      existingIndex >= 0
        ? cart[existingIndex].quantity
        : 0;

    const nextQuantity = currentQuantity + quantity;
    const availableStock = getStock(product.id);

    if (nextQuantity > availableStock) {
      throw new Error(
        `Only ${availableStock} item(s) available for ${product.name}.`
      );
    }

    const nextItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      color: selectedColor,
      quantity: nextQuantity,
      image: product.image,
      stock: availableStock,
    };

    if (existingIndex >= 0) {
      cart[existingIndex] = nextItem;
    } else {
      cart.push(nextItem);
    }

    return simulateRequest(saveCart(cart));
  },
  async updateItem({ productId, color, quantity }) {
    const cart = getStoredCart();
    const availableStock = getStock(productId);

    if (
      quantity < 1 ||
      quantity > availableStock
    ) {
      throw new Error(
        `Quantity must be between 1 and ${availableStock}.`
      );
    }

    const updatedCart = cart.map((item) => {
      if (
        item.id === productId &&
        item.color === color
      ) {
        return {
          ...item,
          quantity,
        };
      }

      return item;
    });

    return simulateRequest(saveCart(updatedCart));
  },
  async removeItem({ productId, color }) {
    const cart = getStoredCart();

    const updatedCart = cart.filter(
      (item) =>
        !(
          item.id === productId &&
          item.color === color
        )
    );

    return simulateRequest(saveCart(updatedCart));
  },

  async clearCart() {
    return simulateRequest(saveCart([]));
  },
};

export default cartApi;
