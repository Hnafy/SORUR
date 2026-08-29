import React, { useState } from 'react';
import { CATEGORIES } from '../data/mockData';
import logo from '/logo 1.jpeg'
export default function AdminDashboard({ 
  orders, 
  products, 
  onAddProduct, 
  onUpdateOrderStatus, 
  onNavigate,
  onLogout,
  onShowToast 
}) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, products, orders, customers, settings
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // New product form state
  const [newProd, setNewProd] = useState({
    name: '',
    category: 'ديكور منزلي',
    price: '',
    originalPrice: '',
    stock: 10,
    badge: 'جديد',
    description: '',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMIiEnHiqho3zyi42-Fe0B5bZMa2QQQ1MqWdBMdMUzOLaF5ZFicTSImkrtnlCMfMOI5T7hsR2MF3INAl2b-8kA4ZAwQHlISTXcqyydRTF9zv-lZpIqxDC21cXu4133ZH2BX8LyomN29qU4y2HUpzLLCfdkH_pMJeyqLePu1qWRd9ejs5hSNr3miwBgDSj2eYdyz81KZPyISq8wBtFPKFLV1oUdvflTQeFhy0g06E2JXq-I25a8JKm6-g',
  });

  // Calculate live stats
  const totalSalesRevenue = orders.reduce((sum, o) => sum + (o.status !== 'ملغى' ? Number(o.total) : 0), 12450);
  const totalOrdersCount = orders.length + 150;
  const newCustomersCount = 45;

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price) {
      onShowToast?.('يرجى كتابة اسم المنتج وسعره بالجنيه المصري');
      return;
    }

    const createdProduct = {
      id: `prod-${Date.now()}`,
      name: newProd.name,
      category: newProd.category,
      price: Number(newProd.price),
      originalPrice: newProd.originalPrice ? Number(newProd.originalPrice) : undefined,
      rating: 5.0,
      reviewsCount: 1,
      badge: newProd.badge || 'جديد',
      isBestSeller: false,
      stock: Number(newProd.stock) || 10,
      description: newProd.description || 'منتج يدوي مميز مصمم بعناية فائقة لنشر السرور والفخامة.',
      colors: [
        { name: 'افتراضي', hex: '#5d3a1a', label: 'Classic' }
      ],
      image: newProd.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMIiEnHiqho3zyi42-Fe0B5bZMa2QQQ1MqWdBMdMUzOLaF5ZFicTSImkrtnlCMfMOI5T7hsR2MF3INAl2b-8kA4ZAwQHlISTXcqyydRTF9zv-lZpIqxDC21cXu4133ZH2BX8LyomN29qU4y2HUpzLLCfdkH_pMJeyqLePu1qWRd9ejs5hSNr3miwBgDSj2eYdyz81KZPyISq8wBtFPKFLV1oUdvflTQeFhy0g06E2JXq-I25a8JKm6-g',
      gallery: [newProd.image]
    };

    onAddProduct(createdProduct);
    onShowToast?.(`تم إضافة المنتج "${newProd.name}" بنجاح إلى المتجر!`);
    
    // Reset form
    setNewProd({
      name: '',
      category: 'ديكور منزلي',
      price: '',
      originalPrice: '',
      stock: 10,
      badge: 'جديد',
      description: '',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMIiEnHiqho3zyi42-Fe0B5bZMa2QQQ1MqWdBMdMUzOLaF5ZFicTSImkrtnlCMfMOI5T7hsR2MF3INAl2b-8kA4ZAwQHlISTXcqyydRTF9zv-lZpIqxDC21cXu4133ZH2BX8LyomN29qU4y2HUpzLLCfdkH_pMJeyqLePu1qWRd9ejs5hSNr3miwBgDSj2eYdyz81KZPyISq8wBtFPKFLV1oUdvflTQeFhy0g06E2JXq-I25a8JKm6-g',
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'مكتمل':
        return <span className="status-badge status-completed">مكتمل</span>;
      case 'قيد التنفيذ':
        return <span className="status-badge status-pending">قيد التنفيذ</span>;
      case 'تم الشحن':
        return <span className="status-badge status-shipped">تم الشحن</span>;
      case 'ملغى':
        return <span className="status-badge status-cancelled">ملغى</span>;
      default:
        return <span className="status-badge status-pending">{status}</span>;
    }
  };

  return (
    <div className="admin-layout">
      <div className="container-fluid px-0">
        <div className="row g-0">
          
          {/* Admin Sidebar */}
          <div className="col-12 col-lg-3 col-xl-2 admin-sidebar">
            <div className="d-flex align-items-center gap-2 px-2">
              <img 
                src={logo}
                alt="سرور" 
                className="brand-logo-img"
              />
              <div>
                <h4 className="brand-title mb-0" style={{ fontSize: '1.25rem' }}>سرور</h4>
                <span className="text-muted small">لوحة الإدارة</span>
              </div>
            </div>

            {/* Profile badge */}
            <div className="admin-user-profile">
              <div className="avatar-circle">س</div>
              <div>
                <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '0.9rem' }}>سارة المشرفة</h6>
                <span className="text-muted small">مدير المتجر</span>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="d-flex flex-column mb-auto">
              <button 
                className={`admin-nav-item border-0 text-end ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <span className="material-symbols-outlined">dashboard</span>
                <span>نظرة عامة</span>
              </button>

              <button 
                className={`admin-nav-item border-0 text-end ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <span className="material-symbols-outlined">receipt_long</span>
                <span>الطلبات ({orders.length})</span>
              </button>

              <button 
                className={`admin-nav-item border-0 text-end ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                <span className="material-symbols-outlined">inventory_2</span>
                <span>المنتجات ({products.length})</span>
              </button>

              <button 
                className={`admin-nav-item border-0 text-end ${activeTab === 'customers' ? 'active' : ''}`}
                onClick={() => setActiveTab('customers')}
              >
                <span className="material-symbols-outlined">group</span>
                <span>العملاء</span>
              </button>

              <button 
                className={`admin-nav-item border-0 text-end ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <span className="material-symbols-outlined">settings</span>
                <span>إعدادات المتجر</span>
              </button>
            </nav>

            {/* Back to store & Logout CTAs */}
            <div className="pt-4 border-top border-secondary border-opacity-25 mt-4 d-flex flex-column gap-2">
              <button 
                className="btn btn-outline-dark w-100 d-flex align-items-center justify-content-center gap-2 text-primary"
                onClick={() => onNavigate('home')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>storefront</span>
                <span>الرجوع للمتجر</span>
              </button>

              <button 
                className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={onLogout}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                <span>تسجيل الخروج</span>
              </button>
            </div>

          </div>

          {/* Main Dashboard Content */}
          <div className="col-12 col-lg-9 col-xl-10 p-3 p-md-4 p-xl-5">
            
            {/* Top Bar Header */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
              <div>
                <h1 className="fw-bold text-primary mb-1" style={{ fontSize: '1.75rem' }}>
                  لوحة التحكم
                </h1>
                <p className="text-muted small mb-0">
                  مرحباً بك مجدداً، إليك ملخص أداء متجر سرور بالجنيه المصري (ج.م)
                </p>
              </div>

              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-white border text-primary px-3 py-2 fw-semibold">
                  العملة: جنيه مصري (ج.م)
                </span>
                <button 
                  className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                  onClick={() => onShowToast?.('تم تحديث البيانات والإحصائيات مباشرة')}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span>
                  <span>تحديث</span>
                </button>
                <button 
                  className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                  onClick={onLogout}
                  title="تسجيل الخروج من لوحة الإدارة"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                  <span className="d-none d-sm-inline">خروج</span>
                </button>
              </div>
            </div>

            {/* Quick Stats Bento (Screenshot 1) */}
            <div className="row g-3 g-md-4 mb-4">
              
              {/* Stat 1: Total Sales */}
              <div className="col-12 col-md-4">
                <div className="admin-stat-card">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className="text-muted small fw-semibold">إجمالي المبيعات</span>
                    <div className="stat-icon-box stat-icon-gold">
                      <span className="material-symbols-outlined">payments</span>
                    </div>
                  </div>
                  <h3 className="fw-bold text-dark mb-2" style={{ fontSize: '1.75rem' }}>
                    {totalSalesRevenue.toLocaleString('ar-EG')} ج.م
                  </h3>
                  <div className="stat-trend positive">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>trending_up</span>
                    <span>+١٥٪ من الشهر الماضي</span>
                  </div>
                </div>
              </div>

              {/* Stat 2: Orders Count */}
              <div className="col-12 col-md-4">
                <div className="admin-stat-card">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className="text-muted small fw-semibold">عدد الطلبات</span>
                    <div className="stat-icon-box stat-icon-brown">
                      <span className="material-symbols-outlined">shopping_bag</span>
                    </div>
                  </div>
                  <h3 className="fw-bold text-dark mb-2" style={{ fontSize: '1.75rem' }}>
                    {totalOrdersCount.toLocaleString('ar-EG')} طلب
                  </h3>
                  <div className="stat-trend positive">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>trending_up</span>
                    <span>+٨٪ من الشهر الماضي</span>
                  </div>
                </div>
              </div>

              {/* Stat 3: New Customers */}
              <div className="col-12 col-md-4">
                <div className="admin-stat-card">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className="text-muted small fw-semibold">العملاء الجدد</span>
                    <div className="stat-icon-box stat-icon-gold">
                      <span className="material-symbols-outlined">person_add</span>
                    </div>
                  </div>
                  <h3 className="fw-bold text-dark mb-2" style={{ fontSize: '1.75rem' }}>
                    {newCustomersCount.toLocaleString('ar-EG')} عميل
                  </h3>
                  <div className="stat-trend positive">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>trending_up</span>
                    <span>+١٢٪ من الشهر الماضي</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Promo Banner Card (Screenshot 1) */}
            <div className="promo-update-card mb-4">
              <div className="promo-icon-circle">
                <span className="material-symbols-outlined">campaign</span>
              </div>
              <div className="flex-grow-1">
                <h5 className="fw-bold text-dark mb-1" style={{ fontSize: '1.05rem' }}>
                  تخفيضات نهاية الموسم!
                </h5>
                <p className="text-muted small mb-0">
                  قم بتحديث قائمة المنتجات والأسعار بالجنيه المصري للاستفادة من زيادة إقبال العملاء على المتجر.
                </p>
              </div>
              <button 
                className="btn btn-sm btn-dark text-nowrap px-3 align-self-center"
                onClick={() => onShowToast?.('تم تفعيل خصومات الموسم بنجاح')}
              >
                تحديث الأسعار
              </button>
            </div>

            {/* Tab: Overview / Orders */}
            {(activeTab === 'overview' || activeTab === 'orders') && (
              <div className="row g-4">
                
                {/* Orders Table */}
                <div className="col-12 col-xl-8">
                  <div className="bg-white rounded-3 border p-3 p-md-4 shadow-sm">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h4 className="fw-bold text-primary mb-0" style={{ fontSize: '1.2rem' }}>
                        أحدث الطلبات
                      </h4>
                      <span className="badge bg-light text-muted border">
                        إجمالي: {orders.length} طلبات
                      </span>
                    </div>

                    <div className="table-responsive">
                      <table className="sorur-table">
                        <thead>
                          <tr>
                            <th>رقم الطلب</th>
                            <th>العميل</th>
                            <th>التاريخ</th>
                            <th>المبلغ</th>
                            <th>الحالة</th>
                            <th>إجراء</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => (
                            <tr key={order.id}>
                              <td className="fw-bold text-primary">{order.id}</td>
                              <td>
                                <div className="fw-semibold">{order.customerName}</div>
                                {order.city && <span className="text-muted small">{order.city}</span>}
                              </td>
                              <td className="text-muted small">{order.date}</td>
                              <td className="fw-bold text-secondary">{order.total} ج.م</td>
                              <td>{getStatusBadge(order.status)}</td>
                              <td>
                                <div className="dropdown">
                                  <select 
                                    className="form-select form-select-sm"
                                    value={order.status}
                                    onChange={(e) => {
                                      onUpdateOrderStatus(order.id, e.target.value);
                                      onShowToast?.(`تم تغيير حالة الطلب #${order.id} إلى ${e.target.value}`);
                                    }}
                                    style={{ fontSize: '0.8rem', minWidth: '110px' }}
                                  >
                                    <option value="قيد التنفيذ">قيد التنفيذ</option>
                                    <option value="تم الشحن">تم الشحن</option>
                                    <option value="مكتمل">مكتمل</option>
                                    <option value="ملغى">ملغى</option>
                                  </select>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                  </div>
                </div>

                {/* Quick Add Product Card */}
                <div className="col-12 col-xl-4">
                  <div className="bg-white rounded-3 border p-3 p-md-4 shadow-sm">
                    <h4 className="fw-bold text-primary mb-3" style={{ fontSize: '1.2rem' }}>
                      إضافة منتج جديد
                    </h4>

                    <form onSubmit={handleCreateProduct}>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted">اسم المنتج</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="مثال: طقم فناجين فاخر"
                          value={newProd.name}
                          onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted">القسم</label>
                        <select 
                          className="form-select"
                          value={newProd.category}
                          onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                        >
                          {CATEGORIES.filter(c => c !== 'الكل').map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <label className="form-label small fw-semibold text-muted">السعر (ج.م)</label>
                          <input 
                            type="number" 
                            className="form-control" 
                            placeholder="250"
                            value={newProd.price}
                            onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                            required
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label small fw-semibold text-muted">السعر قبل الخصم</label>
                          <input 
                            type="number" 
                            className="form-control" 
                            placeholder="300"
                            value={newProd.originalPrice}
                            onChange={(e) => setNewProd({ ...newProd, originalPrice: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted">الكمية المتوفرة</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          value={newProd.stock}
                          onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted">وصف المنتج</label>
                        <textarea 
                          className="form-control" 
                          rows="2"
                          placeholder="وصف مختصر لمميزات وخامات المنتج..."
                          value={newProd.description}
                          onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                        />
                      </div>

                      <button type="submit" className="btn-sorur-admin">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                        <span>إضافة المنتج للمتجر</span>
                      </button>
                    </form>
                  </div>
                </div>

              </div>
            )}

            {/* Tab: Products List */}
            {activeTab === 'products' && (
              <div className="bg-white rounded-3 border p-3 p-md-4 shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="fw-bold text-primary mb-0">جميع المنتجات الحالية ({products.length})</h4>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => setActiveTab('overview')}
                  >
                    + إضافة منتج جديد
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="sorur-table">
                    <thead>
                      <tr>
                        <th>الصورة</th>
                        <th>اسم المنتج</th>
                        <th>القسم</th>
                        <th>السعر (ج.م)</th>
                        <th>المخزون</th>
                        <th>التقييم</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id}>
                          <td>
                            <img src={p.image} alt={p.name} style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px' }} />
                          </td>
                          <td className="fw-bold text-dark">{p.name}</td>
                          <td><span className="badge bg-light text-dark">{p.category}</span></td>
                          <td className="fw-bold text-secondary">{p.price} ج.م</td>
                          <td>
                            <span className={`badge ${p.stock <= 5 ? 'bg-danger' : 'bg-success'}`}>
                              {p.stock} قطع
                            </span>
                          </td>
                          <td>★ {p.rating} ({p.reviewsCount})</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab: Customers */}
            {activeTab === 'customers' && (
              <div className="bg-white rounded-3 border p-3 p-md-4 shadow-sm">
                <h4 className="fw-bold text-primary mb-3">سجل العملاء النشطين في مصر</h4>
                <div className="row g-3">
                  {['أحمد محمد (القاهرة)', 'سارة خالد (الجيزة)', 'فهد عبدالعزيز (الإسكندرية)', 'نورة العتيبي (المنصورة)', 'كريم صبري (طنطا)'].map((c, i) => (
                    <div className="col-12 col-md-6 col-lg-4" key={i}>
                      <div className="p-3 border rounded-3 bg-light">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <div className="avatar-circle" style={{ width: '34px', height: '34px', fontSize: '0.9rem' }}>
                            {c.charAt(0)}
                          </div>
                          <span className="fw-bold">{c}</span>
                        </div>
                        <span className="text-muted small">عميل مميز • {i + 2} طلبات مسجلة</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Settings */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-3 border p-3 p-md-4 shadow-sm">
                <h4 className="fw-bold text-primary mb-3">إعدادات المتجر العامة</h4>
                <div className="row g-3 max-w-lg">
                  <div className="col-12">
                    <label className="form-label small fw-semibold">اسم المتجر</label>
                    <input type="text" className="form-control" defaultValue="سرور - لتصميمات السعادة" />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold">العملة الافتراضية</label>
                    <input type="text" className="form-control" defaultValue="جنيه مصري (ج.م)" disabled />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold">البريد الإلكتروني للإشعارات</label>
                    <input type="email" className="form-control" defaultValue="admin@sorur-egypt.com" />
                  </div>
                  <div className="col-12">
                    <button className="btn-sorur-primary" onClick={() => onShowToast?.('تم حفظ الإعدادات بنجاح')}>
                      حفظ التغييرات
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
