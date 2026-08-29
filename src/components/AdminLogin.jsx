import React, { useState } from 'react';

export default function AdminLogin({ onLoginSuccess, onCancel, onShowToast }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const envUser = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
  const envPass = import.meta.env.VITE_ADMIN_PASSWORD || 'admin';

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      if (username.trim() === envUser && password === envPass) {
        onLoginSuccess();
        onShowToast?.('مرحباً بك! تم تسجيل الدخول إلى لوحة التحكم بنجاح');
      } else {
        setErrorMsg('بيانات الدخول غير صحيحة. يرجى التحقق من اسم المستخدم وكلمة المرور.');
        onShowToast?.('خطأ في اسم المستخدم أو كلمة المرور');
      }
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="admin-login-wrapper d-flex align-items-center justify-content-center py-5">
      <div className="container" style={{ maxWidth: '900px' }}>
        <div className="admin-login-card card border-0 shadow-sm overflow-hidden animate-fade-in-up">
          <div className="row g-0">
            {/* Side Image */}
            <div className="col-md-6 d-none d-md-flex admin-login-side">
              <img
                src="/image 1.jpeg"
                alt="لوحة تحكم سرور"
                className="w-100 h-100"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="col-12 col-md-6 p-4 p-md-5">

          {/* Logo & Header */}
          <div className="text-center mb-4">
            <div className="admin-lock-icon mx-auto mb-3">
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>admin_panel_settings</span>
            </div>
            <h3 className="fw-bold text-primary mb-1" style={{ fontSize: '1.5rem' }}>
              لوحة تحكم سرور
            </h3>
            <p className="text-muted small mb-0">
              يرجى تسجيل الدخول للوصول إلى إدارة المتجر والطلبات
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3 rounded-3" role="alert">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-dark mb-1">
                اسم المستخدم
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person</span>
                </span>
                <input 
                  type="text" 
                  className="form-control bg-light border-start-0" 
                  placeholder="أدخل اسم المستخدم"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold text-dark mb-1">
                كلمة المرور
              </label>
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

            <button 
              type="submit" 
              className="btn-sorur-primary w-100 py-2 mb-3"
              disabled={isLoading}
            >
              {isLoading ? (
                <span>جاري التحقق...</span>
              ) : (
                <span className="d-inline-flex align-items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>login</span>
                  <span>تسجيل الدخول</span>
                </span>
              )}
            </button>

            <button 
              type="button" 
              className="btn btn-link w-100 text-muted text-decoration-none small"
              onClick={onCancel}
            >
              العودة إلى الصفحة الرئيسية
            </button>
          </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
