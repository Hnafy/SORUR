import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate, useLocation, useParams } from 'react-router-dom';
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from './data/mockData';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import ProductCard from './components/ProductCard';
import ProductDetail from './components/ProductDetail';
import CartCheckout from './components/CartCheckout';
import StoreCatalog from './components/StoreCatalog';
import OffersView from './components/OffersView';
import ToastNotification from './components/ToastNotification';
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

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('sorur_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('sorur_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

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

  const [searchQuery, setSearchQuery] = useState('');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

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
  useEffect(() => localStorage.setItem('sorur_products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('sorur_orders', JSON.stringify(orders)), [orders]);
  useEffect(() => localStorage.setItem('sorur_cart', JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem('sorur_wishlist', JSON.stringify(wishlist)), [wishlist]);

  // Toast auto-clear
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (msg) => setToastMessage(msg);

  // Cart operations
  const handleAddToCart = (product, quantity = 1, color = '') => {
    const chosenColor = color || (product.colors?.[0]?.name || 'افتراضي');
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.id === product.id && item.color === chosenColor);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, { id: product.id, name: product.name, price: product.price, color: chosenColor, quantity, image: product.image }];
      }
    });
    showToast(`تمت إضافة "${product.name}" إلى سلة التسوق!`);
  };

  const handleUpdateCartQuantity = (id, color, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(id, color);
      return;
    }
    setCart(prev => prev.map(item => (item.id === id && item.color === color ? { ...item, quantity: newQty } : item)));
  };

  const handleRemoveFromCart = (id, color) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.color === color)));
    showToast('تم حذف المنتج من السلة');
  };

  const handleClearCart = () => {
    setCart([]);
    showToast('تم تفريغ سلة التسوق');
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

  const handleOrderPlaced = (newOrder) => {
    setOrders(prev => [newOrder, ...prev]);
    showToast('تم إنشاء طلبك بنجاح!');
  };

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 4);
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const currentView = pathToViewKey(location.pathname);

  // Layout with global Navbar + Footer for the public store and customer areas.
  const MainLayout = () => (
    <>
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        onSearchClick={() => setSearchModalOpen(true)}
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
                products={products}
                onSelectProduct={handleSelectProduct}
                onAddToCart={handleAddToCart}
                wishlist={wishlist}
                onToggleWishlist={handleToggleWishlist}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            }
          />
          <Route
            path="/product/:id"
            element={
              <ProductDetail
                product={selectedProduct}
                allProducts={products}
                onSelectProduct={handleSelectProduct}
                onAddToCart={handleAddToCart}
                onNavigate={navigateTo}
                isWishlisted={wishlist.includes(selectedProduct?.id)}
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
                onShowToast={showToast}
                onOrderPlaced={handleOrderPlaced}
              />
            }
          />
          <Route
            path="/offers"
            element={
              <OffersView
                products={products}
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: '300px' }}>
                  {products
                    .filter(p => !searchQuery || p.name.includes(searchQuery) || p.category.includes(searchQuery))
                    .map(p => (
                      <div key={p.id} className="d-flex align-items-center justify-content-between p-2 rounded-2 cursor-pointer border-bottom" onClick={() => handleSelectProduct(p.id)}>
                        <div className="d-flex align-items-center gap-3">
                          <img src={p.image} alt={p.name} style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px' }} />
                          <div>
                            <div className="fw-bold text-dark">{p.name}</div>
                            <span className="text-muted small">{p.category}</span>
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
