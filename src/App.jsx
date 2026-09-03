import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import productApi from './services/productApi';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import ProductCard from './components/ProductCard';
import ProductDetail from './components/ProductDetail';
import CartCheckout from './components/CartCheckout';
import CartDrawer from './components/CartDrawer';
import StoreCatalog from './components/StoreCatalog';
import OffersView from './components/OffersView';
import ToastNotification from './components/ToastNotification';
import cartApi from './services/cartApi';
import couponApi from './services/couponApi';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import CustomerProfile from './pages/profile/CustomerProfile';
import CustomerAddresses from './pages/addresses/CustomerAddresses';
import CustomerOrders from './pages/orders/CustomerOrders';
import CustomerOrderDetail from './pages/orders/CustomerOrderDetail';
import AdminOverview from './pages/admin/AdminOverview';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminOrders from './pages/admin/AdminOrders';
import NotFound from './pages/NotFound';
// ahmed
const VIEW_TO_PATH = {
  "home": '/',
  "shop": '/shop',
  "cart": '/cart',
  "offers": '/offers',
  "login": '/login',
  "register": '/register',
  'customer-profile': '/customer/profile',
  'customer-addresses': '/customer/addresses',
  'customer-orders': '/customer/orders',
  "admin": '/admin',
  'admin-products': '/admin/products',
  'admin-categories': '/admin/categories',
  'admin-coupons': '/admin/coupons',
  'admin-orders': '/admin/orders',
};

// view key for active-link highlighting in the Navbar.
function pathToViewKey(pathname) {
  const p = pathname || '/';
  if (p === '/' || p === '/home') return 'home';
  if (p === '/shop') return 'shop';
  if (p === '/offers') return 'offers';
  if (p === '/cart') return 'cart';
  if (p.startsWith('/product')) return 'product-detail';
  if (p === '/login') return 'login';
  if (p === '/register') return 'register';
  if (p.startsWith('/customer/profile')) return 'customer-profile';
  if (p.startsWith('/customer/addresses')) return 'customer-addresses';
  if (p.startsWith('/customer/orders')) return 'customer-orders';
  if (p.startsWith('/admin/products')) return 'admin-products';
  if (p.startsWith('/admin/categories')) return 'admin-categories';
  if (p.startsWith('/admin/coupons')) return 'admin-coupons';
  if (p.startsWith('/admin/orders')) return 'admin-orders';
  if (p.startsWith('/admin')) return 'admin';
  return 'home';
}

export default function App() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedProductId, setSelectedProductId] = useState(() => {
    const m = location.pathname.match(/^\/product\/(.+)$/);
    return m ? decodeURIComponent(m[1]) : 'prod-001';
  });

  const [bestSellers, setBestSellers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchResultsLoading, setSearchResultsLoading] = useState(false);

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('sorur_cart');
    return saved ? JSON.parse(saved) : [
      {
        id: '',
        name: '',
        price: 0,
        color: '',
        quantity: 0,
        image: ''
      }
    ];
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('sorur_wishlist');
    return saved ? JSON.parse(saved) : ['prod-001', 'prod-005'];
  });

const [modalSearch, setModalSearch] = useState('');
const [searchModalOpen, setSearchModalOpen] = useState(false);
const [toastMessage, setToastMessage] = useState('');
const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
const [cartBusyKey, setCartBusyKey] = useState(null);
const [cartError, setCartError] = useState('');


  // Keep selectedProductId in sync with the URL for deep links / refresh.
  useEffect(() => {
    const m = location.pathname.match(/^\/product\/(.+)$/);
    if (m) setSelectedProductId(decodeURIComponent(m[1]));
  }, [location.pathname]);

  const navigateTo = (view, orderId) => {
    let path = VIEW_TO_PATH[view] || '/';
    if (view === 'customer-order-detail' && orderId) path = `/customer/orders/${orderId}`;
    navigate(path);
  };

  // Local storage synchronization
  useEffect(() => localStorage.setItem('sorur_cart', JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem('sorur_wishlist', JSON.stringify(wishlist)), [wishlist]);

  // Fetch best sellers for the homepage
  useEffect(() => {
    let active = true;
    productApi
      .fetchProducts({ page: 1, limit: 8 })
      .then((result) => {
        if (active) setBestSellers(result.products || []);
      })
      .catch(() => {
        if (active) setBestSellers([]);
      });
    return () => {
      active = false;
    };
  }, []);

  // Debounced live search for the search modal (only while the modal is open).
  useEffect(() => {
    if (!searchModalOpen) {
      setSearchResults([]);
      setSearchResultsLoading(false);
      return;
    }
    if (!modalSearch.trim()) {
      setSearchResults([]);
      setSearchResultsLoading(false);
      return;
    }
    setSearchResultsLoading(true);
    const t = setTimeout(() => {
      productApi
        .fetchProducts({ page: 1, limit: 8, query: modalSearch.trim() })
        .then((result) => setSearchResults(result.products || []))
        .catch(() => setSearchResults([]))
        .finally(() => setSearchResultsLoading(false));
    }, 400);
    return () => clearTimeout(t);
  }, [modalSearch, searchModalOpen]);

useEffect(() => {
  cartApi
    .getCart()
    .then((storedCart) => {
      setCart(storedCart);
    })
    .catch((error) => {
      setCartError(error.message);
    });
}, []);


  // Toast auto-clear
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (msg) => setToastMessage(msg);

  // Cart operations
 // Cart operations

// Adds a product to the cart and checks the available stock first.
const handleAddToCart = async (
  product,
  quantity = 1,
  color = ''
) => {
  setCartError('');

  try {
    const updatedCart = await cartApi.addItem({
      product,
      quantity,
      color,
    });

    setCart(updatedCart);

    showToast(`${product.name} was added to your cart.`);
  } catch (error) {
    setCartError(error.message);
    showToast(error.message);
  }
};

// Updates the quantity with an optimistic UI update.
const handleUpdateCartQuantity = async (
  item,
  newQuantity
) => {
  const itemKey = `${item.id}:${item.color}`;

  // Do not send another request while an item is busy.
  if (cartBusyKey) {
    return;
  }

  // Prevent quantities outside the valid range.
  if (newQuantity < 1 || newQuantity > item.stock) {
    return;
  }

  const previousCart = cart;

  // Disable this item while the request is running.
  setCartBusyKey(itemKey);
  setCartError('');

  // Optimistic update: update the UI immediately.
  setCart((currentCart) =>
    currentCart.map((cartItem) =>
      cartItem.id === item.id &&
      cartItem.color === item.color
        ? {
            ...cartItem,
            quantity: newQuantity,
          }
        : cartItem
    )
  );

  try {
    const updatedCart = await cartApi.updateItem({
      productId: item.id,
      color: item.color,
      quantity: newQuantity,
    });

    setCart(updatedCart);
  } catch (error) {
    // Roll back if the API request fails.
    setCart(previousCart);
    setCartError(error.message);
    showToast(error.message);
  } finally {
    setCartBusyKey(null);
  }
};

// Removes one item with an optimistic UI update.
const handleRemoveFromCart = async (item) => {
  const itemKey = `${item.id}:${item.color}`;

  if (cartBusyKey) {
    return;
  }

  const previousCart = cart;

  setCartBusyKey(itemKey);
  setCartError('');

  setCart((currentCart) =>
    currentCart.filter(
      (cartItem) =>
        !(
          cartItem.id === item.id &&
          cartItem.color === item.color
        )
    )
  );

  try {
    const updatedCart = await cartApi.removeItem({
      productId: item.id,
      color: item.color,
    });

    setCart(updatedCart);
    showToast(`${item.name} was removed from your cart.`);
  } catch (error) {
    setCart(previousCart);
    setCartError(error.message);
    showToast(error.message);
  } finally {
    setCartBusyKey(null);
  }
};
const handleClearCart = async () => {
  if (cartBusyKey) {
    return;
  }

  const previousCart = cart;

  setCartError('');
  setCart([]);

  try {
    const updatedCart = await cartApi.clearCart();

    setCart(updatedCart);
    showToast('Your cart has been cleared.');
  } catch (error) {
    setCart(previousCart);
    setCartError(error.message);
    showToast(error.message);
  }
};

  const handleToggleWishlist = (productId) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        showToast('تمت إزالة المنتج من المفضلة');
        return prev.filter(id => id !== productId);
      } else {
        showToast('تمت إضافة المنتج إلى المفضلة ❤️');
        return [...prev, productId];
      }
    });
  };

  const handleSelectProduct = (productId) => {
    setSelectedProductId(productId);
    navigate(`/product/${encodeURIComponent(productId)}`);
    setSearchModalOpen(false);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const currentView = pathToViewKey(location.pathname);

  // Layout with global Navbar + Footer for the public store and customer areas.
  const MainLayout = () => (
    <>
         <Navbar
           currentView={currentView}
           onNavigate={navigateTo}
           cartCount={totalCartCount}
           onCartClick={() => setCartDrawerOpen(true)}
           wishlistCount={wishlist.length}
           onSearchClick={() => { setModalSearch(''); setSearchModalOpen(true); }}
        />

      <main className="main-content">
        <Outlet />
      </main>
      <Footer onNavigate={navigateTo} onShowToast={showToast} />
    </>
  );

  // Route guards
  const RequireAuth = () =>
    isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />;

  const RequireAdmin = () => {
    if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    if (!isAdmin) return <Navigate to="/customer/profile" replace />;
    return <Outlet />;
  };

  // Order detail wrapper that reads the :orderId param.
  const OrderDetailRoute = () => {
    const { orderId } = useParams();
    return <CustomerOrderDetail orderId={orderId} onNavigate={navigateTo} onShowToast={showToast} />;
  };

  if (loading) {
    return (
      <div className="app-wrapper">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <div className="text-muted">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <Routes>
        {/* global navbar/footer */}
        <Route element={<MainLayout />}>
          <Route
            path="/"
            element={
              <div className="animate-fade-in-up">
                <HeroSection onExploreShop={() => navigateTo('shop')} onExploreOffers={() => navigateTo('offers')} />
                <section className="py-5">
                  <div className="container-xl">
                    <div className="d-flex justify-content-between align-items-end mb-4 animate-fade-in-up anim-delay-2">
                      <div>
                        <span className="text-secondary fw-semibold small text-uppercase">مختاراتنا لك</span>
                        <h2 className="fw-bold mb-0" style={{ fontSize: '1.85rem', color: 'var(--color-primary)' }}>المنتجات الأكثر مبيعاً</h2>
                      </div>
                      <button className="btn btn-link text-primary fw-semibold p-0 text-decoration-none d-flex align-items-center gap-1" onClick={() => navigateTo('shop')}>
                        <span>عرض الكل</span>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
                      </button>
                    </div>
                    <div className="row row-cols-2 row-cols-md-4 g-3 g-md-4">
                      {bestSellers.map((product, index) => (
                        <div className={`col animate-fade-in-up anim-delay-${(index % 4) + 1}`} key={product.id}>
                          <ProductCard
                            product={product}
                            onSelectProduct={handleSelectProduct}
                            onAddToCart={handleAddToCart}
                            isWishlisted={wishlist.includes(product.id)}
                            onToggleWishlist={handleToggleWishlist}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            }
          />
          <Route
            path="/shop"
            element={
              <StoreCatalog
                onSelectProduct={handleSelectProduct}
                onAddToCart={handleAddToCart}
                wishlist={wishlist}
                onToggleWishlist={handleToggleWishlist}
              />
            }
          />
          <Route
            path="/product/:id"
            element={
              <ProductDetail
                productId={selectedProductId}
                onSelectProduct={handleSelectProduct}
                onAddToCart={handleAddToCart}
                onNavigate={navigateTo}
                isWishlisted={wishlist.includes(selectedProductId)}
                onToggleWishlist={handleToggleWishlist}
              />
            }
          />
          <Route
            path="/cart"
            element={
            <CartCheckout
              cartItems={cart}
              onUpdateQuantity={handleUpdateCartQuantity}
              onRemoveItem={handleRemoveFromCart}
              onClearCart={handleClearCart}
              onNavigate={navigateTo}
              busyItem={cartBusyKey}
              cartError={cartError}
            />
            }
          />
          <Route
            path="/offers"
            element={
              <OffersView
                onSelectProduct={handleSelectProduct}
                onAddToCart={handleAddToCart}
                wishlist={wishlist}
                onToggleWishlist={handleToggleWishlist}
                onShowToast={showToast}
                onNavigate={navigateTo}
              />
            }
          />

          <Route path="/login" element={<Login onNavigate={navigateTo} onShowToast={showToast} />} />
          <Route path="/register" element={<Register onNavigate={navigateTo} onShowToast={showToast} />} />

          {/* Customer area (requires auth) */}
          <Route element={<RequireAuth />}>
            <Route path="/customer/profile" element={<CustomerProfile onNavigate={navigateTo} onShowToast={showToast} />} />
            <Route path="/customer/addresses" element={<CustomerAddresses onNavigate={navigateTo} onShowToast={showToast} />} />
            <Route path="/customer/orders" element={<CustomerOrders onNavigate={navigateTo} onShowToast={showToast} />} />
            <Route path="/customer/orders/:orderId" element={<OrderDetailRoute />} />
          </Route>

          <Route path="*" element={<NotFound onNavigate={navigateTo} />} />
        </Route>

        {/* Admin area (requires admin, own sidebar layout, no global navbar/footer) */}
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<AdminOverview onNavigate={navigateTo} onShowToast={showToast} />} />
          <Route path="/admin/products" element={<AdminProducts onNavigate={navigateTo} onShowToast={showToast} />} />
          <Route path="/admin/categories" element={<AdminCategories onNavigate={navigateTo} onShowToast={showToast} />} />
          <Route path="/admin/coupons" element={<AdminCoupons onNavigate={navigateTo} onShowToast={showToast} />} />
          <Route path="/admin/orders" element={<AdminOrders onNavigate={navigateTo} onShowToast={showToast} />} />
        </Route>
      </Routes>

      <ToastNotification message={toastMessage} onClose={() => setToastMessage('')} />
        <CartDrawer
  open={cartDrawerOpen}
  items={cart}
  subtotal={cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )}
  tax={Number(
    (
      cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ) * 0.14
    ).toFixed(2)
  )}
  shipping={(() => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    if (subtotal === 0) {
      return 0;
    }

    return subtotal >= 1000 ? 0 : 60;
  })()}
  total={(() => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const tax = Number(
      (subtotal * 0.14).toFixed(2)
    );

    const shipping =
      subtotal === 0
        ? 0
        : subtotal >= 1000
          ? 0
          : 60;

    return subtotal + tax + shipping;
  })()}
  onClose={() => setCartDrawerOpen(false)}
  onUpdateQuantity={handleUpdateCartQuantity}
  onRemoveItem={handleRemoveFromCart}
  onClearCart={handleClearCart}
  onViewCart={() => {
    setCartDrawerOpen(false);
    navigateTo('cart');
  }}
  busyItem={cartBusyKey}
/>


      {searchModalOpen && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg animate-fade-in-down">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold text-primary">البحث في منتجات سرور</h5>
                <button type="button" className="btn-close" onClick={() => setSearchModalOpen(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="input-group input-group-lg mb-3">
                  <span className="input-group-text bg-light border-end-0">
                    <span className="material-symbols-outlined">search</span>
                  </span>
                  <input
                    type="text"
                    className="form-control bg-light border-start-0"
                    placeholder="اكتب اسم المنتج أو القسم..."
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: '300px' }}>
                  {searchResultsLoading && (
                    <div className="d-flex justify-content-center py-3">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">جاري البحث...</span>
                      </div>
                    </div>
                  )}
                  {!searchResultsLoading && searchResults.length === 0 && modalSearch && (
                    <div className="text-center py-3 text-muted small">لا توجد نتائج مطابقة</div>
                  )}
                  {searchResults.map(p => (
                    <div key={p.id} className="d-flex align-items-center justify-content-between p-2 rounded-2 cursor-pointer border-bottom" onClick={() => handleSelectProduct(p.id)}>
                      <div className="d-flex align-items-center gap-3">
                        <img src={p.image} alt={p.name} style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px' }} />
                        <div>
                          <div className="fw-bold text-dark">{p.name}</div>
                          <span className="text-muted small">{p.category?.name || p.category || ''}</span>
                        </div>
                      </div>
                      <span className="fw-bold text-secondary">{p.price} ج.م</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}