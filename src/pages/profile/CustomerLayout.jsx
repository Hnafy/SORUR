import React from 'react';
import { useAuth } from '../../context/AuthContext';

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      className={`border-0 bg-transparent text-end px-3 py-2 rounded-2 w-100 d-flex align-items-center gap-2 fw-semibold cursor-pointer ${
        active ? 'text-primary' : 'text-dark'
      }`}
      style={{ backgroundColor: active ? 'rgba(93,58,26,0.08)' : 'transparent' }}
      onClick={onClick}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export default function CustomerLayout({ active, user, onNavigate, onLogout, children }) {
  const items = [
    { key: 'profile', icon: 'person', label: 'ملفي الشخصي', to: 'customer-profile' },
    { key: 'addresses', icon: 'location_on', label: 'عناويني', to: 'customer-addresses' },
    { key: 'orders', icon: 'receipt_long', label: 'طلباتي', to: 'customer-orders' },
  ];

  return (
    <div className="container-xl py-4">
      <div className="row g-4">
        <div className="col-12 col-lg-3">
          <div className="bg-white rounded-3 border p-3">
            <div className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
              <div className="avatar-circle" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>
                {(user?.username || '؟').charAt(0).toUpperCase()}
              </div>
              <div>
                <h6 className="mb-0 fw-bold text-dark">{user?.username}</h6>
                <span className="text-muted small text-break">{user?.email}</span>
              </div>
            </div>
            <nav className="d-flex flex-column gap-1">
              {items.map((it) => (
                <NavItem
                  key={it.key}
                  icon={it.icon}
                  label={it.label}
                  active={active === it.key}
                  onClick={() => onNavigate(it.to)}
                />
              ))}
              <NavItem icon="logout" label="تسجيل الخروج" active={false} onClick={onLogout} />
            </nav>
          </div>
        </div>
        <div className="col-12 col-lg-9">{children}</div>
      </div>
    </div>
  );
}
