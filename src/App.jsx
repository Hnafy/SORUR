import React, { useState, useEffect } from 'react';
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from './data/mockData';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import ProductCard from './components/ProductCard';
import ProductDetail from './components/ProductDetail';
import CartCheckout from './components/CartCheckout';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import StoreCatalog from './components/StoreCatalog';
import OffersView from './components/OffersView';
import ToastNotification from './components/ToastNotification';

export default function App() {
  // Check initial route from URL (supports /dashboard or #/dashboard)
  const getInitialView = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path === '/dashboard' || path === '/admin' || hash === '#/dashboard' || hash === '#dashboard') {
      return 'admin';
    }
    return 'home';
  };

  // Application State
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
        id: 'prod-001',
        name: 'مبخرة خشبية فاخرة',
        price: 245,
        color: 'بني غامق',
        quantity: 1,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMIiEnHiqho3zyi42-Fe0B5bZMa2QQQ1MqWdBMdMUzOLaF5ZFicTSImkrtnlCMfMOI5T7hsR2MF3INAl2b-8kA4ZAwQHlISTXcqyydRTF9zv-lZpIqxDC21cXu4133ZH2BX8LyomN29qU4y2HUpzLLCfdkH_pMJeyqLePu1qWRd9ejs5hSNr3miwBgDSj2eYdyz81KZPyISq8wBtFPKFLV1oUdvflTQeFhy0g06E2JXq-I25a8JKm6-g'
      }
    ];
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('sorur_wishlist');
    return saved ? JSON.parse(saved) : ['prod-001', 'prod-005'];
  });

  const [currentView, setCurrentView] = useState(getInitialView);
  const [selectedProductId, setSelectedProductId] = useState('prod-001');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Admin authentication state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem('sorur_admin_auth') === 'true';
  });

  // Synchronize URL and history navigation (support /dashboard and browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/dashboard' || path === '/admin' || hash === '#/dashboard' || hash === '#dashboard') {
        setCurrentView('admin');
      } else if (path === '/shop' || hash === '#/shop') {
        setCurrentView('shop');
      } else if (path === '/cart' || hash === '#/cart') {
        setCurrentView('cart');
      } else if (path === '/offers' || hash === '#/offers') {
        setCurrentView('offers');
      } else {
        setCurrentView('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigateTo = (view) => {
    setCurrentView(view);
    if (view === 'admin') {
      window.history.pushState(null, '', '/dashboard');
    } else if (view === 'home') {
      window.history.pushState(null, '', '/');
    } else {
      window.history.pushState(null, '', `#/${view}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Local storage synchronization
  useEffect(() => {
    localStorage.setItem('sorur_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('sorur_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('sorur_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('sorur_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Toast auto-clear
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (msg) => {
    setToastMessage(msg);
  };

  // Admin auth handlers
  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    sessionStorage.setItem('sorur_admin_auth', 'true');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('sorur_admin_auth');
    showToast('تم تسجيل الخروج بنجاح من لوحة التحكم');
    navigateTo('home');
  };

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
        return [...prev, {
          id: product.id,
          name: product.name,
          price: product.price,
          color: chosenColor,
          quantity: quantity,
          image: product.image
        }];
      }
    });
    showToast(`تمت إضافة "${product.name}" إلى سلة التسوق!`);
  };

  const handleUpdateCartQuantity = (id, color, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(id, color);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.id === id && item.color === color) {
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleRemoveFromCart = (id, color) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.color === color)));
    showToast('تم حذف المنتج من السلة');
  };

  const handleClearCart = () => {
    setCart([]);
    showToast('تم تفريغ سلة التسوق');
  };

  // Wishlist operations
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

  // Product Selection
  const handleSelectProduct = (productId) => {
    setSelectedProductId(productId);
    navigateTo('product-detail');
    setSearchModalOpen(false);
  };

  // Admin operations
  const handleAddProduct = (newProduct) => {
    setProducts(prev => [newProduct, ...prev]);
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        let statusClass = 'status-pending';
        if (newStatus === 'مكتمل') statusClass = 'status-completed';
        if (newStatus === 'تم الشحن') statusClass = 'status-shipped';
        if (newStatus === 'ملغى') statusClass = 'status-cancelled';
        return { ...ord, status: newStatus, statusClass };
      }
      return ord;
    }));
  };

  const handleOrderPlaced = (newOrder) => {
    setOrders(prev => [newOrder, ...prev]);
    showToast('تم إنشاء طلبك بنجاح!');
  };

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 4);
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app-wrapper">
      {/* Top Navbar (visible across customer store pages) */}
      {currentView !== 'admin' && (
        <Navbar 
          currentView={currentView}
          onNavigate={navigateTo}
          cartCount={totalCartCount}
          wishlistCount={wishlist.length}
          onSearchClick={() => setSearchModalOpen(true)}
        />
      )}

      {/* Main Dynamic View with smooth entry transitions */}
      <main className="main-content">
        
        {/* VIEW 1: HOME */}
        {currentView === 'home' && (
          <div className="animate-fade-in-up">
            {/* Hero & Value propositions */}
            <HeroSection 
              onExploreShop={() => navigateTo('shop')}
              onExploreOffers={() => navigateTo('offers')}
            />

            {/* Featured Best Sellers Section */}
            <section className="py-5">
              <div className="container-xl">
                <div className="d-flex justify-content-between align-items-end mb-4 animate-fade-in-up anim-delay-2">
                  <div>
                    <span className="text-secondary fw-semibold small text-uppercase">مختاراتنا لك</span>
                    <h2 className="fw-bold mb-0" style={{ fontSize: '1.85rem',color: "var(--color-primary) "}}>
                      المنتجات الأكثر مبيعاً
                    </h2>
                  </div>
                  <button 
                    className="btn btn-link text-primary fw-semibold p-0 text-decoration-none d-flex align-items-center gap-1"
                    onClick={() => navigateTo('shop')}
                  >
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
        )}

        {/* VIEW 2: SHOP / CATALOG */}
        {currentView === 'shop' && (
          <div className="animate-fade-in-up">
            <StoreCatalog 
              products={products}
              onSelectProduct={handleSelectProduct}
              onAddToCart={handleAddToCart}
              wishlist={wishlist}
              onToggleWishlist={handleToggleWishlist}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
        )}

        {/* VIEW 3: PRODUCT DETAIL */}
        {currentView === 'product-detail' && (
          <div className="animate-fade-in-up">
            <ProductDetail 
              product={selectedProduct}
              allProducts={products}
              onSelectProduct={handleSelectProduct}
              onAddToCart={handleAddToCart}
              onNavigate={navigateTo}
              isWishlisted={wishlist.includes(selectedProduct?.id)}
              onToggleWishlist={handleToggleWishlist}
            />
          </div>
        )}

        {/* VIEW 4: CART & CHECKOUT */}
        {currentView === 'cart' && (
          <div className="animate-fade-in-up">
            <CartCheckout 
              cartItems={cart}
              onUpdateQuantity={handleUpdateCartQuantity}
              onRemoveItem={handleRemoveFromCart}
              onClearCart={handleClearCart}
              onNavigate={navigateTo}
              onShowToast={showToast}
              onOrderPlaced={handleOrderPlaced}
            />
          </div>
        )}

        {/* VIEW 5: OFFERS */}
        {currentView === 'offers' && (
          <div className="animate-fade-in-up">
            <OffersView 
              products={products}
              onSelectProduct={handleSelectProduct}
              onAddToCart={handleAddToCart}
              wishlist={wishlist}
              onToggleWishlist={handleToggleWishlist}
              onShowToast={showToast}
              onNavigate={navigateTo}
            />
          </div>
        )}

        {/* VIEW 6: ADMIN DASHBOARD (Protected with credentials from .env) */}
        {currentView === 'admin' && (
          <div>
            {isAdminLoggedIn ? (
              <div className="animate-fade-in-up">
                <AdminDashboard 
                  orders={orders}
                  products={products}
                  onAddProduct={handleAddProduct}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  onNavigate={navigateTo}
                  onLogout={handleAdminLogout}
                  onShowToast={showToast}
                />
              </div>
            ) : (
              <AdminLogin 
                onLoginSuccess={handleAdminLoginSuccess}
                onCancel={() => navigateTo('home')}
                onShowToast={showToast}
              />
            )}
          </div>
        )}

      </main>

      {/* Global Footer (shown in store views) */}
      {currentView !== 'admin' && (
        <Footer onNavigate={navigateTo} onShowToast={showToast} />
      )}

      {/* Floating Toast Notification */}
      <ToastNotification 
        message={toastMessage} 
        onClose={() => setToastMessage('')} 
      />

      {/* Quick Search Modal */}
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
                      <div 
                        key={p.id}
                        className="d-flex align-items-center justify-content-between p-2 rounded-2 hover:bg-light cursor-pointer border-bottom"
                        onClick={() => handleSelectProduct(p.id)}
                      >
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

