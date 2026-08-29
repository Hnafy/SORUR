import { seedProducts } from '../mocks/products';
import { seedCategories } from '../mocks/categories';
import { seedAddresses } from '../mocks/addresses';
import { seedOrders } from '../mocks/orders';
import { seedCoupons } from '../mocks/coupons';

import { TOKEN_KEY, USER_KEY } from './api';

const STORAGE_KEYS = {
  products: 'sorur_mock_products',
  categories: 'sorur_mock_categories',
  addresses: 'sorur_mock_addresses',
  orders: 'sorur_mock_orders',
  coupons: 'sorur_mock_coupons',
  defaultAddress: 'sorur_default_address',
};

const DB = (() => {
  const seed = {
    products: seedProducts(),
    categories: seedCategories(),
    addresses: seedAddresses(),
    orders: seedOrders(),
    coupons: seedCoupons(),
  };

  const read = (key) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS[key]);
      return raw ? JSON.parse(raw) : seed[key];
    } catch {
      return seed[key];
    }
  };

  const write = (key, value) => {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
    return value;
  };

  return {
    get: (key) => read(key),
    set: (key, value) => write(key, value),
    reset: () => {
      Object.keys(seed).forEach((key) => localStorage.removeItem(STORAGE_KEYS[key]));
      localStorage.removeItem(STORAGE_KEYS.defaultAddress);
    },
  };
})();

// ------------------------------------------------------------------
// Small helpers
// ------------------------------------------------------------------
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));
const ok = (statusCode = 200, data, message) => ({ statusCode, data, message, success: true });
const megaDate = (d = new Date()) => d.toISOString();
const genId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const pick = (obj, keys) => {
  const out = {};
  keys.forEach((k) => {
    if (obj[k] !== undefined) out[k] = obj[k];
  });
  return out;
};

function throwError(status, message) {
  const err = new Error(message);
  err.statusCode = status;
  err.success = false;
  err.data = null;
  throw err;
}

async function runTask(fn) {
  await delay();
  return fn();
}

// Build FreeAPI pagination metadata (mongoose-aggregate-paginate style).
function paginate(resource, docs, { page = 1, limit = 10 } = {}) {
  const totalDocs = docs.length;
  const totalPages = Math.max(1, Math.ceil(totalDocs / limit));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;
  const items = docs.slice(start, start + limit);
  return {
    [resource]: items,
    [`total${resource[0].toUpperCase()}${resource.slice(1)}`]: totalDocs,
    limit,
    page: safePage,
    totalPages,
    serialNumberStartFrom: start + 1,
    hasPrevPage: safePage > 1,
    hasNextPage: safePage < totalPages,
    prevPage: safePage > 1 ? safePage - 1 : null,
    nextPage: safePage < totalPages ? safePage + 1 : null,
  };
}

// Throws 401 if not authenticated, otherwise returns the current user record.
// Authorization is driven by the real FreeAPI session (token + user stored by AuthContext).
function requireAuth(headers = {}) {
  const tokens = localStorage.getItem(TOKEN_KEY);
  if (!tokens) throwError(401, 'Unauthorized: Please login to continue.');
  const storedUser = localStorage.getItem(USER_KEY);
  if (!storedUser) throwError(401, 'Unauthorized: Please login to continue.');
  const user = JSON.parse(storedUser);
  if (!user || !user._id) throwError(401, 'Unauthorized: Please login to continue.');
  return user;
}

// Throws 401/403, otherwise returns the User record (must be ADMIN).
function requireAdmin(headers) {
  const user = requireAuth(headers);
  if (user.role !== 'ADMIN') throwError(403, 'Forbidden: Admin access required.');
  return user;
}

// Persist the current user (used for app-level profile storage on the real user).
function persistStoredUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

// ------------------------------------------------------------------
// PROFILE  —  /api/v1/ecommerce/profile
// ------------------------------------------------------------------
export const mockProfileApi = {
  // GET /api/v1/ecommerce/profile -> Profile
  getMyProfile: (headers) =>
    runTask(() => {
      const user = requireAuth(headers);
      return ok(200, user.profile || null, 'Profile fetched successfully.');
    }),

  // PATCH /api/v1/ecommerce/profile { firstName, lastName, phoneNumber, countryCode } -> Profile
  updateMyProfile: (body = {}, headers) =>
    runTask(() => {
      const user = requireAuth(headers);
      const existing = user.profile || { _id: genId('prof'), __v: 0, owner: user._id, createdAt: megaDate() };
      const next = {
        ...existing,
        firstName: body.firstName ?? existing.firstName ?? '',
        lastName: body.lastName ?? existing.lastName ?? '',
        phoneNumber: body.phoneNumber ?? existing.phoneNumber ?? '',
        countryCode: body.countryCode ?? existing.countryCode ?? '',
        updatedAt: megaDate(),
      };
      user.profile = next;
      persistStoredUser(user);
      return ok(200, next, 'Profile updated successfully.');
    }),

  // GET /api/v1/ecommerce/profile/my-orders -> paginated orders (customer, own)
  getMyOrders: (query = {}, headers) => getAllOrders(query, headers, true),
};

// ------------------------------------------------------------------
// ADDRESSES  —  /api/v1/ecommerce/addresses
// ------------------------------------------------------------------
export const mockAddressApi = {
  // POST /api/v1/ecommerce/addresses -> Address
  createAddress: (body = {}, headers) =>
    runTask(() => {
      const user = requireAuth(headers);
      const { addressLine1, addressLine2 = '', city, country, pincode, state } = body;
      if (!addressLine1 || !city || !country || !pincode || !state) {
        throwError(400, 'addressLine1, city, country, pincode and state are required.');
      }
      const next = {
        _id: genId('addr'),
        __v: 0,
        addressLine1,
        addressLine2,
        city,
        country,
        owner: user._id,
        pincode,
        state,
        createdAt: megaDate(),
        updatedAt: megaDate(),
      };
      DB.set('addresses', [...DB.get('addresses'), next]);
      return ok(201, next, 'Address created successfully.');
    }),

  // GET /api/v1/ecommerce/addresses -> paginated addresses
  getAllAddresses: (query = {}, headers) =>
    runTask(() => {
      const user = requireAuth(headers);
      return ok(200, paginate('addresses', DB.get('addresses').filter((a) => a.owner === user._id), query), 'Addresses fetched successfully.');
    }),

  // GET /api/v1/ecommerce/addresses/:addressId -> Address
  getAddressById: (addressId, headers) =>
    runTask(() => {
      const user = requireAuth(headers);
      const found = DB.get('addresses').find((a) => a._id === addressId && a.owner === user._id);
      if (!found) throwError(404, 'Address does not exist.');
      return ok(200, found, 'Address fetched successfully.');
    }),

  // PATCH /api/v1/ecommerce/addresses/:addressId -> Address
  updateAddress: (addressId, body = {}, headers) =>
    runTask(() => {
      const user = requireAuth(headers);
      const list = DB.get('addresses');
      const found = list.find((a) => a._id === addressId && a.owner === user._id);
      if (!found) throwError(404, 'Address does not exist.');
      const next = { ...found, ...pick(body, ['addressLine1', 'addressLine2', 'city', 'country', 'pincode', 'state']), updatedAt: megaDate() };
      DB.set('addresses', list.map((a) => (a._id === addressId ? next : a)));
      return ok(200, next, 'Address updated successfully.');
    }),

  // DELETE /api/v1/ecommerce/addresses/:addressId -> { deletedAddress }
  deleteAddress: (addressId, headers) =>
    runTask(() => {
      const user = requireAuth(headers);
      const list = DB.get('addresses');
      const found = list.find((a) => a._id === addressId && a.owner === user._id);
      if (!found) throwError(404, 'Address does not exist.');
      DB.set('addresses', list.filter((a) => a._id !== addressId));
      if (localStorage.getItem(STORAGE_KEYS.defaultAddress) === addressId) {
        localStorage.removeItem(STORAGE_KEYS.defaultAddress);
      }
      return ok(200, { deletedAddress: found }, 'Address deleted successfully.');
    }),

  // App-level helper (not a FreeAPI endpoint): mark an address as default.
  setDefaultAddress: (addressId, headers) =>
    runTask(() => {
      const user = requireAuth(headers);
      const found = DB.get('addresses').find((a) => a._id === addressId && a.owner === user._id);
      if (!found) throwError(404, 'Address does not exist.');
      localStorage.setItem(STORAGE_KEYS.defaultAddress, addressId);
      return ok(200, { defaultAddressId: addressId }, 'Default address set successfully.');
    }),
};

// ------------------------------------------------------------------
// CATEGORIES  —  /api/v1/ecommerce/categories
// ------------------------------------------------------------------
export const mockCategoryApi = {
  // POST /api/v1/ecommerce/categories { name } -> Category
  createCategory: (body = {}, headers) =>
    runTask(() => {
      const user = requireAdmin(headers);
      if (!body.name) throwError(400, 'Category name is required.');
      const next = { _id: genId('cat'), name: body.name, owner: user._id, __v: 0, createdAt: megaDate(), updatedAt: megaDate() };
      DB.set('categories', [...DB.get('categories'), next]);
      return ok(201, next, 'Category created successfully.');
    }),

  // GET /api/v1/ecommerce/categories -> paginated categories
  getAllCategories: (query = {}) =>
    runTask(() => ok(200, paginate('categories', DB.get('categories'), query), 'Categories fetched successfully.')),

  // GET /api/v1/ecommerce/categories/:categoryId -> Category
  getCategoryById: (categoryId) =>
    runTask(() => {
      const found = DB.get('categories').find((c) => c._id === categoryId);
      if (!found) throwError(404, 'Category does not exist.');
      return ok(200, found, 'Category fetched successfully.');
    }),

  // PATCH /api/v1/ecommerce/categories/:categoryId { name } -> Category
  updateCategory: (categoryId, body = {}, headers) =>
    runTask(() => {
      requireAdmin(headers);
      const list = DB.get('categories');
      const found = list.find((c) => c._id === categoryId);
      if (!found) throwError(404, 'Category does not exist.');
      const next = { ...found, name: body.name ?? found.name, updatedAt: megaDate() };
      DB.set('categories', list.map((c) => (c._id === categoryId ? next : c)));
      return ok(200, next, 'Category updated successfully.');
    }),

  // DELETE /api/v1/ecommerce/categories/:categoryId -> { deletedCategory }
  deleteCategory: (categoryId, headers) =>
    runTask(() => {
      requireAdmin(headers);
      const list = DB.get('categories');
      const found = list.find((c) => c._id === categoryId);
      if (!found) throwError(404, 'Category does not exist.');
      DB.set('categories', list.filter((c) => c._id !== categoryId));
      return ok(200, { deletedCategory: found }, 'Category deleted successfully.');
    }),
};

// ------------------------------------------------------------------
// COUPONS  —  /api/v1/ecommerce/coupons
// ------------------------------------------------------------------
export const mockCouponApi = {
  // POST /api/v1/ecommerce/coupons -> Coupon
  createCoupon: (body = {}, headers) =>
    runTask(() => {
      const user = requireAdmin(headers);
      const list = DB.get('coupons');
      const code = (body.couponCode || '').trim().toUpperCase();
      if (!body.name || !code || body.discountValue === undefined) {
        throwError(400, 'name, couponCode and discountValue are required.');
      }
      if (list.some((c) => c.couponCode === code)) throwError(409, `Coupon with code ${code} already exists.`);
      const next = {
        _id: genId('cpn'),
        __v: 0,
        couponCode: code,
        name: body.name,
        type: 'FLAT',
        discountValue: Number(body.discountValue),
        isActive: true,
        minimumCartValue: Number(body.minimumCartValue ?? 0),
        startDate: body.startDate ? megaDate(new Date(body.startDate)) : megaDate(),
        expiryDate: body.expiryDate ? megaDate(new Date(body.expiryDate)) : null,
        owner: user._id,
        createdAt: megaDate(),
        updatedAt: megaDate(),
      };
      DB.set('coupons', [...list, next]);
      return ok(201, next, 'Coupon created successfully.');
    }),

  // GET /api/v1/ecommerce/coupons -> paginated coupons
  getAllCoupons: (query = {}, headers) =>
    runTask(() => {
      requireAdmin(headers);
      return ok(200, paginate('coupons', DB.get('coupons'), query), 'Coupons fetched successfully.');
    }),

  // PATCH /api/v1/ecommerce/coupons/:couponId/status { isActive } -> Coupon
  updateCouponActiveStatus: (couponId, body = {}, headers) =>
    runTask(() => {
      requireAdmin(headers);
      const list = DB.get('coupons');
      const found = list.find((c) => c._id === couponId);
      if (!found) throwError(404, 'Coupon does not exist.');
      const next = { ...found, isActive: !!body.isActive, updatedAt: megaDate() };
      DB.set('coupons', list.map((c) => (c._id === couponId ? next : c)));
      return ok(200, next, `Coupon is ${next.isActive ? 'active' : 'inactive'}.`);
    }),

  // PATCH /api/v1/ecommerce/coupons/:couponId -> Coupon
  updateCoupon: (couponId, body = {}, headers) =>
    runTask(() => {
      requireAdmin(headers);
      const list = DB.get('coupons');
      const found = list.find((c) => c._id === couponId);
      if (!found) throwError(404, 'Coupon does not exist.');
      const next = {
        ...found,
        name: body.name ?? found.name,
        couponCode: body.couponCode ?? found.couponCode,
        discountValue: body.discountValue !== undefined ? Number(body.discountValue) : found.discountValue,
        minimumCartValue: body.minimumCartValue !== undefined ? Number(body.minimumCartValue) : found.minimumCartValue,
        startDate: body.startDate ? megaDate(new Date(body.startDate)) : found.startDate,
        expiryDate: body.expiryDate ? megaDate(new Date(body.expiryDate)) : found.expiryDate,
        updatedAt: megaDate(),
      };
      DB.set('coupons', list.map((c) => (c._id === couponId ? next : c)));
      return ok(200, next, 'Coupon updated successfully.');
    }),

  // DELETE /api/v1/ecommerce/coupons/:couponId -> { deletedCoupon }
  deleteCoupon: (couponId, headers) =>
    runTask(() => {
      requireAdmin(headers);
      const list = DB.get('coupons');
      const found = list.find((c) => c._id === couponId);
      if (!found) throwError(404, 'Coupon does not exist.');
      DB.set('coupons', list.filter((c) => c._id !== couponId));
      return ok(200, { deletedCoupon: found }, 'Coupon deleted successfully.');
    }),
};

// ------------------------------------------------------------------
// PRODUCTS  —  /api/v1/ecommerce/products
// ------------------------------------------------------------------
function productFromBody(body, ownerId) {
  const mainImage =
    typeof body.mainImage === 'string'
      ? { url: body.mainImage, localPath: '', _id: genId('mi') }
      : { url: body.mainImage?.url || '', localPath: '', _id: genId('mi') };
  const subImages = Array.isArray(body.subImages)
    ? body.subImages.map((s) => ({ url: typeof s === 'string' ? s : s.url, localPath: '', _id: genId('si') }))
    : [];
  return {
    _id: genId('prod'),
    category: body.category,
    description: body.description || '',
    name: body.name,
    owner: ownerId,
    price: Number(body.price) || 0,
    previousPrice: body.previousPrice !== undefined ? Number(body.previousPrice) : undefined,
    stock: Number(body.stock) || 0,
    mainImage,
    subImages,
    currency: 'EGP',
    __v: 0,
    createdAt: megaDate(),
    updatedAt: megaDate(),
  };
}

export const mockProductApi = {
  // GET /api/v1/ecommerce/products -> paginated products (public)
  getAllProducts: (query = {}) =>
    runTask(() => {
      let docs = DB.get('products');
      if (query.categoryId) docs = docs.filter((p) => p.category === query.categoryId);
      if (query.search) docs = docs.filter((p) => p.name.toLowerCase().includes(query.search.toLowerCase()));
      return ok(200, paginate('products', docs, query), 'Products fetched successfully.');
    }),

  // GET /api/v1/ecommerce/products/:productId -> Product
  getProductById: (productId) =>
    runTask(() => {
      const found = DB.get('products').find((p) => p._id === productId);
      if (!found) throwError(404, 'Product does not exist.');
      return ok(200, found, 'Product fetched successfully.');
    }),

  // POST /api/v1/ecommerce/products -> Product (admin)
  createProduct: (body = {}, headers) =>
    runTask(() => {
      const user = requireAdmin(headers);
      if (!body.name || !body.category) throwError(400, 'Product name and category are required.');
      const next = productFromBody(body, user._id);
      DB.set('products', [next, ...DB.get('products')]);
      return ok(201, next, 'Product created successfully.');
    }),

  // PATCH /api/v1/ecommerce/products/:productId -> Product (admin)
  updateProduct: (productId, body = {}, headers) =>
    runTask(() => {
      requireAdmin(headers);
      const list = DB.get('products');
      const found = list.find((p) => p._id === productId);
      if (!found) throwError(404, 'Product does not exist.');
      const next = {
        ...found,
        name: body.name ?? found.name,
        description: body.description ?? found.description,
        category: body.category ?? found.category,
        price: body.price !== undefined ? Number(body.price) : found.price,
        previousPrice: body.previousPrice !== undefined ? Number(body.previousPrice) : found.previousPrice,
        stock: body.stock !== undefined ? Number(body.stock) : found.stock,
        updatedAt: megaDate(),
      };
      DB.set('products', list.map((p) => (p._id === productId ? next : p)));
      return ok(200, next, 'Product updated successfully.');
    }),

  // DELETE /api/v1/ecommerce/products/:productId -> { deletedProduct } (admin)
  deleteProduct: (productId, headers) =>
    runTask(() => {
      requireAdmin(headers);
      const list = DB.get('products');
      const found = list.find((p) => p._id === productId);
      if (!found) throwError(404, 'Product does not exist.');
      DB.set('products', list.filter((p) => p._id !== productId));
      return ok(200, { deletedProduct: found }, 'Product deleted successfully.');
    }),
};

// ------------------------------------------------------------------
// ORDERS  —  /api/v1/ecommerce/orders
// ------------------------------------------------------------------
function orderSummary(order) {
  const { items, ...summary } = order;
  return summary;
}

function orderDetail(order) {
  return { _id: order._id, order: { ...order, items: order.items || [] } };
}

function getAllOrders(query = {}, headers, onlyMe = false) {
  return runTask(() => {
    let docs = DB.get('orders');
    if (onlyMe) {
      const user = requireAuth(headers);
      docs = docs.filter((o) => o.customer._id === user._id);
    } else {
      requireAdmin(headers);
    }
    if (query.status) {
      const st = query.status.toUpperCase();
      docs = docs.filter((o) => o.status === st);
    }
    const result = paginate('orders', docs, query);
    return ok(200, { ...result, orders: result.orders.map(orderSummary) }, 'Orders fetched successfully.');
  });
}

export const mockOrderApi = {
  // GET /api/v1/ecommerce/orders -> paginated orders (customer, own)
  getMyOrders: (query = {}, headers) => getAllOrders(query, headers, true),

  // GET /api/v1/ecommerce/orders/admin -> paginated orders (admin, optional ?status=)
  getOrderListAdmin: (query = {}, headers) => getAllOrders(query, headers, false),

  // GET /api/v1/ecommerce/orders/:orderId -> OrderDetail
  getOrderById: (orderId, headers) =>
    runTask(() => {
      const user = requireAuth(headers);
      const found = DB.get('orders').find(
        (o) => o._id === orderId && (user.role === 'ADMIN' || o.customer._id === user._id)
      );
      if (!found) throwError(404, 'Order does not exist.');
      return ok(200, orderDetail(found), 'Order fetched successfully.');
    }),

  // POST /api/v1/ecommerce/orders { addressId, items: [{productId, quantity}], coupon? } -> Order
  createOrder: (body = {}, headers) =>
    runTask(() => {
      const user = requireAuth(headers);
      const address = DB.get('addresses').find((a) => a._id === body.addressId && a.owner === user._id);
      if (!address) throwError(400, 'Please provide a valid addressId.');
      const items = Array.isArray(body.items) ? body.items : [];
      if (items.length === 0) throwError(400, 'Order must contain at least one item.');
      const products = DB.get('products');
      let orderPrice = 0;
      const orderItems = items.map((it) => {
        const product = products.find((p) => p._id === it.productId);
        orderPrice += (product ? product.price : 0) * it.quantity;
        return {
          _id: genId('oi'),
          quantity: it.quantity,
          product: product || { _id: it.productId, name: 'unknown', price: 0, mainImage: { url: '' } },
        };
      });
      const couponDoc = body.coupon ? DB.get('coupons').find((c) => c._id === body.coupon && c.isActive) : null;
      const discountedOrderPrice = couponDoc ? Math.max(0, orderPrice - couponDoc.discountValue) : orderPrice;
      const next = {
        _id: genId('ORD'),
        __v: 0,
        address: {
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          city: address.city,
          country: address.country,
          pincode: address.pincode,
          state: address.state,
        },
        coupon: couponDoc ? couponDoc._id : null,
        customer: { _id: user._id, email: user.email, username: user.username },
        orderPrice,
        discountedOrderPrice,
        items: orderItems,
        status: 'PENDING',
        paymentProvider: 'UNKNOWN',
        paymentId: '',
        isPaymentDone: false,
        createdAt: megaDate(),
        updatedAt: megaDate(),
      };
      DB.set('orders', [next, ...DB.get('orders')]);
      return ok(201, orderDetail(next), 'Order placed successfully.');
    }),

  // PATCH /api/v1/ecommerce/orders/:orderId { status } -> Order (admin)
  updateOrderStatus: (orderId, body = {}, headers) =>
    runTask(() => {
      requireAdmin(headers);
      const list = DB.get('orders');
      const found = list.find((o) => o._id === orderId);
      if (!found) throwError(404, 'Order does not exist.');
      const status = (body.status || '').toUpperCase();
      if (!['PENDING', 'DELIVERED', 'CANCELLED'].includes(status)) throwError(400, 'Invalid order status.');
      const next = { ...found, status, updatedAt: megaDate() };
      DB.set('orders', list.map((o) => (o._id === orderId ? next : o)));
      return ok(200, next, 'Order status changed successfully.');
    }),
};

// ------------------------------------------------------------------
// Aggregate service export: single drop-in object for components.
// ------------------------------------------------------------------
export const mockApi = {
  profile: mockProfileApi,
  address: mockAddressApi,
  category: mockCategoryApi,
  coupon: mockCouponApi,
  product: mockProductApi,
  order: mockOrderApi,
};

export default mockApi;
