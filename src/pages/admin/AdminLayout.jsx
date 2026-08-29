import React from 'react';
import logo from '/logo 1.jpeg';

export default function AdminLayout({ active, user, onNavigate, onLogout, onShowToast, children }) {
  const items = [
    { key: 'admin-overview', icon: 'dashboard', label: 'نظرة عامة', to: 'admin' },
    { key: 'admin-products', icon: 'inventory_2', label: 'المنتجات', to: 'admin-products' },
    { key: 'admin-categories', icon: 'category', label: 'الأقسام', to: 'admin-categories' },
    { key: 'admin-coupons', icon: 'confirmation_number', label: 'الكوبونات', to: 'admin-coupons' },
    { key: 'admin-orders', icon: 'receipt_long', label: 'الطلبات', to: 'admin-orders' },
  ];

  return (
    <div className="admin-layout">
      <div className="container-fluid px-0">
        <div className="row g-0">
          {/* Admin Sidebar */}
          <div className="col-12 col-lg-3 col-xl-2 admin-sidebar">
            <div className="d-flex align-items-center gap-2 px-2">
              <img src={logo} alt="سرور" className="brand-logo-img" />
              <div>
                <h4 className="brand-title mb-0" style={{ fontSize: '1.25rem' }}>سرور</h4>
                <span className="text-muted small">لوحة الإدارة</span>
              </div>
            </div>

            {/* Profile badge */}
            <div className="admin-user-profile">
              <div className="avatar-circle" style={{ width: '38px', height: '38px', fontSize: '1rem' }}>
                {(user?.username || 'س').charAt(0).toUpperCase()}
              </div>
              <div>
                <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{user?.username || 'المدير'}</h6>
                <span className="text-muted small">مدير المتجر</span>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="d-flex flex-column mb-auto">
              {items.map((it) => (
                <button
                  key={it.key}
                  className={`admin-nav-item border-0 text-end ${active === it.key ? 'active' : ''}`}
                  onClick={() => onNavigate(it.to)}
                >
                  <span className="material-symbols-outlined">{it.icon}</span>
                  <span>{it.label}</span>
                </button>
              ))}
            </nav>

            {/* Back to store & Logout */}
            <div className="pt-4 border-top border-secondary border-opacity-25 mt-4 d-flex flex-column gap-2">
              <button className="btn btn-outline-dark w-100 d-flex align-items-center justify-content-center gap-2 text-primary" onClick={() => onNavigate('home')}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>storefront</span>
                <span>الرجوع للمتجر</span>
              </button>
              <button className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2" onClick={onLogout}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-12 col-lg-9 col-xl-10 p-3 p-md-4 p-xl-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
