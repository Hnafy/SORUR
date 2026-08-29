import React, { useEffect, useState } from 'react';
import mockApi from '../../services/mockApi';
import { useAuth } from '../../context/AuthContext';
import CustomerLayout from '../profile/CustomerLayout';

const STATUS_LABEL = {
  PENDING: { label: 'قيد التنفيذ', cls: 'status-pending' },
  DELIVERED: { label: 'تم التسليم', cls: 'status-completed' },
  CANCELLED: { label: 'ملغى', cls: 'status-cancelled' },
};

export default function CustomerOrders({ onNavigate, onShowToast }) {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({});
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
        const res = await mockApi.order.getMyOrders({ page: 1, limit: 20 }, tokenHeaders());
        if (active && res.success) {
          setOrders(res.data.orders || []);
          setPagination(res.data);
        }
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

  const openOrder = (id) => onNavigate(`customer-order:${id}`);

  return (
    <CustomerLayout active="orders" user={user} onNavigate={onNavigate} onLogout={logout}>
      <div className="animate-fade-in-up">
        <h4 className="fw-bold text-primary mb-4" style={{ fontSize: '1.3rem' }}>سجل طلباتي</h4>

        {loading ? (
          <div className="text-center py-4 text-muted">جاري تحميل الطلبات...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3 border p-5 text-center shadow-sm">
            <span className="material-symbols-outlined text-muted" style={{ fontSize: '48px' }}>receipt_long</span>
            <h5 className="fw-bold text-dark mt-2 mb-1">لا توجد طلبات بعد</h5>
            <p className="text-muted small mb-3">عند إتمام طلبك الأول سيظهر هنا.</p>
            <button className="btn-sorur-primary" onClick={() => onNavigate('shop')}>تسوق الآن</button>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {orders.map((o) => {
              const st = STATUS_LABEL[o.status] || STATUS_LABEL.PENDING;
              return (
                <button
                  key={o._id}
                  className="text-start w-100 border-0 bg-white rounded-3 border p-3 shadow-sm cursor-pointer hover-shadow-none"
                  onClick={() => openOrder(o._id)}
                >
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div>
                      <span className="fw-bold text-primary dir-ltr">#{o._id}</span>
                      <div className="text-muted small mt-1">
                        {new Date(o.createdAt).toLocaleDateString('ar-EG', { dateStyle: 'long' })}
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <span className="text-muted small">عدد المنتجات: {o.totalOrderItems}</span>
                      <span className={`status-badge ${st.cls}`}>{st.label}</span>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold text-secondary">
                        {o.discountedOrderPrice} ج.م
                        {o.orderPrice > o.discountedOrderPrice && (
                          <span className="text-muted text-decoration-line-through small ms-2">{o.orderPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {pagination.totalOrders > orders.length && (
          <div className="text-center mt-3 text-muted small">
            عرض {orders.length} من {pagination.totalOrders} طلب
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
