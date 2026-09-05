import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Login({ onNavigate, onShowToast }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      if (res.success) {
        onShowToast?.('تم تسجيل الدخول بنجاح!');
        const role = res.data.user.role;
        onNavigate(role === 'ADMIN' ? 'admin' : 'customer-profile');
      }
    } catch (err) {
      setErrorMsg(err.message || 'حدث خطأ أثناء تسجيل الدخول');
      onShowToast?.('فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page d-flex align-items-center justify-content-center py-5">
      <div className="container" style={{ maxWidth: '900px' }}>
        <div className="card border-0 shadow-sm overflow-hidden animate-fade-in-up">
          <div className="row g-0">
            <div className="col-md-6 d-none d-md-flex admin-login-side">
              <img src="/image 1.jpeg" alt="سرور" className="w-100 h-100" style={{ objectFit: 'cover' }} />
            </div>
            <div className="col-12 col-md-6 p-4 p-md-5">
              <div className="text-center mb-4">
                <div className="admin-lock-icon mx-auto mb-3">
                  <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>login</span>
                </div>
                <h3 className="fw-bold text-primary mb-1" style={{ fontSize: '1.5rem' }}>تسجيل الدخول</h3>
                <p className="text-muted small mb-0">مرحباً بعودتك إلى متجر سرور</p>
              </div>

              {errorMsg && (
                <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3 rounded-3" role="alert">
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>error</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark mb-1">البريد الإلكتروني أو اسم المستخدم</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person</span>
                    </span>
                    <input
                      type="text"
                      className="form-control bg-light border-start-0"
                      placeholder="admin@sorur.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold text-dark mb-1">كلمة المرور</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>lock</span>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control bg-light border-start-0 border-end-0"
                      placeholder="أدخل كلمة المرور"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="input-group-text bg-light border-start-0 text-muted cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="إظهار كلمة المرور"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn-sorur-primary w-100 py-2 mb-3" disabled={loading}>
                  {loading ? <span>جاري تسجيل الدخول...</span> : <span>تسجيل الدخول</span>}
                </button>

                <div className="text-center small">
                  <span className="text-muted">ليس لديك حساب؟ </span>
                  <button type="button" className="btn btn-link p-0 text-primary fw-semibold" onClick={() => onNavigate('register')}>
                    إنشاء حساب جديد
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
