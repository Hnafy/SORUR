import React, { useEffect, useState } from 'react';
import mockApi from '../../services/mockApi';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from './AdminLayout';

export default function AdminOverview({ onNavigate, onShowToast }) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ orders: [], products: [], coupons: [], categories: [] });
  const [loading, setLoading] = useState(true);

  const tokenHeaders = () => {
    const raw = localStorage.getItem('sorur_tokens');
    return raw ? { Authorization: `Bearer ${JSON.parse(raw).accessToken}` } : {};
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [orders, products, coupons, categories] = await Promise.all([
          mockApi.order.getOrderListAdmin({ limit: 100 }, tokenHeaders()),
          mockApi.product.getAllProducts({ limit: 100 }),
          mockApi.coupon.getAllCoupons({ limit: 100 }, tokenHeaders()),
          mockApi.category.getAllCategories({ limit: 100 }),
        ]);
        if (!active) return;
        setStats({
          orders: orders.data.orders || [],
          products: products.data.products || [],
          coupons: coupons.data.coupons || [],
          categories: categories.data.categories || [],
        });
      } catch {
        /* guarded */
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const totalRevenue = stats.orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.discountedOrderPrice, 0);
  const pendingCount = stats.orders.filter((o) => o.status === 'PENDING').length;
  const activeCoupons = stats.coupons.filter((c) => c.isActive).length;

  const StatCard = ({ title, value, icon, accent }) => (
    <div className="col-12 col-md-4">
      <div className="admin-stat-card">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <span className="text-muted small fw-semibold">{title}</span>
          <div className="stat-icon-box" style={{ backgroundColor: accent }}>
            <span className="material-symbols-outlined">{icon}</span>
          </div>
        </div>
        <h3 className="fw-bold text-dark mb-1" style={{ fontSize: '1.6rem' }}>{value}</h3>
      </div>
    </div>
  );

  return (
    <AdminLayout active="admin-overview" user={user} onNavigate={onNavigate} onLogout={logout} onShowToast={onShowToast}>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="fw-bold text-primary mb-1" style={{ fontSize: '1.75rem' }}>لوحة التحكم</h1>
          <p className="text-muted small mb-0">مرحباً بك مجدداً، إليك ملخص أداء متجر سرور.</p>
        </div>
        <button
          className="btn btn-sm btn-primary d-flex align-items-center gap-1"
          onClick={() => onShowToast?.('تم تحديث البيانات والإحصائيات مباشرة')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span>
          <span>تحديث</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">جاري تحميل البيانات...</div>
      ) : (
        <>
          <div className="row g-3 g-md-4 mb-4">
            <StatCard title="إجمالي المبيعات" value={`${totalRevenue.toLocaleString('ar-EG')} ج.م`} icon="payments" accent="rgba(167,132,58,0.2)" />
            <StatCard title="عدد الطلبات" value={`${stats.orders.length} طلب`} icon="shopping_bag" accent="rgba(93,58,26,0.12)" />
            <StatCard title="طلبات قيد التنفيذ" value={`${pendingCount} طلب`} icon="hourglass_top" accent="rgba(156,99,50,0.15)" />
          </div>

          <div className="row g-4">
            <div className="col-12 col-lg-7">
              <div className="bg-white rounded-3 border p-3 p-md-4 shadow-sm h-100">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold text-primary mb-0">أحدث الطلبات</h5>
                  <button className="btn btn-link btn-sm text-primary p-0" onClick={() => onNavigate('admin-orders')}>عرض الكل</button>
                </div>
                {stats.orders.length === 0 ? (
                  <div className="text-muted small py-3 text-center">لا توجد طلبات بعد</div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {stats.orders.slice(0, 5).map((o) => (
                      <div key={o._id} className="d-flex align-items-center justify-content-between border rounded-3 p-2 px-3">
                        <span className="fw-bold text-primary dir-ltr">#{o._id}</span>
                        <span className="text-muted small">{o.customer?.username}</span>
                        <span className="fw-bold text-secondary">{o.discountedOrderPrice} ج.م</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="col-12 col-lg-5">
              <div className="bg-white rounded-3 border p-3 p-md-4 shadow-sm h-100">
                <h5 className="fw-bold text-primary mb-3">إحصائيات سريعة</h5>
                <div className="d-flex flex-column gap-2 text-muted">
                  <div className="d-flex justify-content-between border-bottom pb-2"><span>المنتجات</span><span className="fw-bold text-dark">{stats.products.length}</span></div>
                  <div className="d-flex justify-content-between border-bottom pb-2"><span>الأقسام</span><span className="fw-bold text-dark">{stats.categories.length}</span></div>
                  <div className="d-flex justify-content-between border-bottom pb-2"><span>الكوبونات النشطة</span><span className="fw-bold text-dark">{activeCoupons} / {stats.coupons.length}</span></div>
                  <div className="d-flex justify-content-between"><span>الطلبات الملغاة</span><span className="fw-bold text-dark">{stats.orders.filter((o) => o.status === 'CANCELLED').length}</span></div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
