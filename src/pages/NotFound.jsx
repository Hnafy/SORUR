import React from 'react';
import { useLocation } from 'react-router-dom';

export default function NotFound({ onNavigate }) {
  const location = useLocation();

  return (
    <div className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: '70vh' }}>
      <div className="text-center px-3">
        <div
          className="mx-auto mb-3 d-inline-flex align-items-center justify-content-center rounded-4"
          style={{ width: '110px', height: '110px', background: 'rgba(93,58,26,0.08)', color: 'var(--color-primary)' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '56px' }}>search_off</span>
        </div>
        <h1 className="fw-bold mb-1" style={{ fontSize: '3.5rem', color: 'var(--color-primary)', lineHeight: 1 }}>
          404
        </h1>
        <h5 className="fw-bold text-dark mb-2">الصفحة غير موجودة</h5>
        <p className="text-muted mx-auto mb-4" style={{ maxWidth: '420px' }}>
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
          <br className="d-none d-md-block" />
          المسار المطلوب: <span className="dir-ltr text-muted">{location.pathname}</span>
        </p>
        <button
          className="btn-sorur-primary px-4"
          onClick={() => (onNavigate ? onNavigate('home') : null)}
        >
          العودة للرئيسية
        </button>
      </div>
    </div>
  );
}
