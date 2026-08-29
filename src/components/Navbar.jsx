import React, { useState, useEffect } from 'react';
import logo from '/logo 1.jpeg'

export default function Navbar({ currentView, onNavigate, cartCount, wishlistCount, onSearchClick }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (view) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className={`sorur-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container-xl">
        <div className="d-flex align-items-center justify-content-between py-3">
          
          {/* Logo & Brand Name */}
          <div className="d-flex align-items-center gap-3">
            <button 
              className="d-flex align-items-center gap-2 text-decoration-none border-0 bg-transparent p-0"
              onClick={() => handleNav('home')}
            >
              <img 
                src={logo}
                alt="شعار سرور" 
                className="brand-logo-img"
              />
              <span className="brand-title">سرور</span>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="d-none d-md-flex align-items-center gap-2">
            <button 
              className={`nav-link-custom ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => handleNav('home')}
            >
              الرئيسية
            </button>
            <button 
              className={`nav-link-custom ${currentView === 'shop' ? 'active' : ''}`}
              onClick={() => handleNav('shop')}
            >
              المتجر
            </button>
            <button 
              className={`nav-link-custom ${currentView === 'offers' ? 'active' : ''}`}
              onClick={() => handleNav('offers')}
            >
              العروض
            </button>
          </nav>

          {/* Actions & Utilities */}
          <div className="d-flex align-items-center gap-2">
            {/* Search Button */}
            <button 
              className="icon-action-btn"
              onClick={onSearchClick}
              title="بحث في المتجر"
              aria-label="بحث"
            >
              <span className="material-symbols-outlined">search</span>
            </button>

            {/* Cart Button with Count Badge */}
            <button 
              className="icon-action-btn"
              onClick={() => handleNav('cart')}
              title="سلة التسوق"
              aria-label="سلة التسوق"
            >
              <span className="material-symbols-outlined">shopping_cart</span>
              {cartCount > 0 && (
                <span className="badge-cart-counter">{cartCount}</span>
              )}
            </button>

            {/* Mobile Menu Hamburger */}
            <button 
              className="d-md-none icon-action-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="القائمة"
            >
              <span className="material-symbols-outlined">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="d-md-none py-3 border-top border-light-subtle animate-fade-in-down">
            <div className="d-flex flex-column gap-2">
              <button 
                className={`text-end py-2 px-3 rounded-2 fw-semibold ${currentView === 'home' ? 'bg-light text-primary' : 'text-dark'}`}
                onClick={() => handleNav('home')}
              >
                الرئيسية
              </button>
              <button 
                className={`text-end py-2 px-3 rounded-2 fw-semibold ${currentView === 'shop' ? 'bg-light text-primary' : 'text-dark'}`}
                onClick={() => handleNav('shop')}
              >
                المتجر
              </button>
              <button 
                className={`text-end py-2 px-3 rounded-2 fw-semibold ${currentView === 'offers' ? 'bg-light text-primary' : 'text-dark'}`}
                onClick={() => handleNav('offers')}
              >
                العروض الحصرية
              </button>
              <button 
                className={`text-end py-2 px-3 rounded-2 fw-semibold ${currentView === 'cart' ? 'bg-light text-primary' : 'text-dark'}`}
                onClick={() => handleNav('cart')}
              >
                سلة التسوق ({cartCount})
              </button>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
