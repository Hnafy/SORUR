import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Register({ onNavigate, onShowToast }) {
  const { register, login } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (form.password !== form.confirm) {
      setErrorMsg('كلمتا المرور غير متطابقتين');
      return;
    }
    setLoading(true);
    try {
      const res = await register(form.username.trim(), form.email.trim(), form.password, 'USER');
      if (res.success) {
        onShowToast?.('تم إنشاء الحساب بنجاح!');
        await login(form.email.trim(), form.password);
        onNavigate('customer-profile');
      }
    } catch (err) {
      setErrorMsg(err.message || 'حدث خطأ أثناء إنشاء الحساب');
      onShowToast?.('فشل إنشاء الحساب');
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
                  <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>person_add</span>
                </div>
                <h3 className="fw-bold text-primary mb-1" style={{ fontSize: '1.5rem' }}>إنشاء حساب جديد</h3>
                <p className="text-muted small mb-0">انضم إلى عائلة سرور لتصميمات السعادة</p>
              </div>

              {errorMsg && (
                <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3 rounded-3" role="alert">
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>error</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark mb-1">اسم المستخدم</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>badge</span>
                    </span>
                    <input
                      type="text"
                      className="form-control bg-light border-start-0"
                      placeholder="username"
                      value={form.username}
                      onChange={setField('username')}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark mb-1">البريد الإلكتروني</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>mail</span>
                    </span>
                    <input
                      type="email"
                      className="form-control bg-light border-start-0"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={setField('email')}
                      required
                    />
                  </div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark mb-1">كلمة المرور</label>
                    <input
                      type="password"
                      className="form-control bg-light"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={setField('password')}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark mb-1">تأكيد كلمة المرور</label>
                    <input
                      type="password"
                      className="form-control bg-light"
                      placeholder="••••••••"
                      value={form.confirm}
                      onChange={setField('confirm')}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-sorur-primary w-100 py-2 mb-3" disabled={loading}>
                  {loading ? <span>جاري إنشاء الحساب...</span> : <span>إنشاء الحساب</span>}
                </button>

                <div className="text-center small">
                  <span className="text-muted">لديك حساب بالفعل؟ </span>
                  <button type="button" className="btn btn-link p-0 text-primary fw-semibold" onClick={() => onNavigate('login')}>
                    تسجيل الدخول
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
