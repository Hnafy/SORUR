import React, { useEffect, useState } from 'react';
import mockApi from '../../services/mockApi';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from './AdminLayout';

const STATUS_LABEL = {
  PENDING: { label: 'قيد التنفيذ', cls: 'status-pending' },
  DELIVERED: { label: 'تم التسليم', cls: 'status-completed' },
  CANCELLED: { label: 'ملغى', cls: 'status-cancelled' },
};
const STATUS_ORDER = ['PENDING', 'DELIVERED', 'CANCELLED'];

export default function AdminOrders({ onNavigate, onShowToast }) {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const tokenHeaders = () => {
    const raw = localStorage.getItem('sorur_tokens');
    return raw ? { Authorization: `Bearer ${JSON.parse(raw).accessToken}` } : {};
  };

  const load = async (status = filter) => {
    setLoading(true);
    try {
      const query = { limit: 100 };
      if (status) query.status = status;
      const res = await mockApi.order.getOrderListAdmin(query, tokenHeaders());
      setOrders(res.data.orders || []);
    } catch {
      /* guarded */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (st) => {
    setFilter(st);
    load(st);
  };

  const handleStatus = async (o, status) => {
    try {
      const res = await mockApi.order.updateOrderStatus(o._id, { status }, tokenHeaders());
      if (res.success) {
        onShowToast?.(`تم تحديث حالة الطلب #${o._id} إلى ${STATUS_LABEL[status].label}`);
        load();
      }
    } catch (err) {
      onShowToast?.(err.message || 'خطأ');
    }
  };

  const getBadge = (status) => {
    const st = STATUS_LABEL[status] || STATUS_LABEL.PENDING;
    return <span className={`status-badge ${st.cls}`}>{st.label}</span>;
  };

  return (
    <AdminLayout active="admin-orders" user={user} onNavigate={onNavigate} onLogout={logout} onShowToast={onShowToast}>
      <h1 className="fw-bold text-primary mb-4" style={{ fontSize: '1.75rem' }}>إدارة الطلبات</h1>

      <div className="d-flex gap-2 flex-wrap mb-4">
        <button className={`btn btn-sm ${filter === '' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => handleFilter('')}>الكل</button>
        {STATUS_ORDER.map((s) => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => handleFilter(s)}>
            {STATUS_LABEL[s].label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3 border p-3 p-md-4 shadow-sm">
        {loading ? (
          <div className="text-center py-4 text-muted">جاري تحميل الطلبات...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-4 text-muted">لا توجد طلبات</div>
        ) : (
          <div className="table-responsive">
            <table className="sorur-table">
              <thead>
                <tr>
                  <th>رقم الطلب</th>
                  <th>العميل</th>
                  <th>التاريخ</th>
                  <th>المبلغ</th>
                  <th>الحالة</th>
                  <th>تحديث الحالة</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td className="fw-bold text-primary dir-ltr">{o._id}</td>
                    <td>
                      <div className="fw-semibold">{o.customer?.username}</div>
                      <span className="text-muted small">{o.customer?.email}</span>
                    </td>
                    <td className="text-muted small">{new Date(o.createdAt).toLocaleDateString('ar-EG', { dateStyle: 'long' })}</td>
                    <td className="fw-bold text-secondary">{o.discountedOrderPrice} ج.م</td>
                    <td>{getBadge(o.status)}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={o.status}
                        onChange={(e) => handleStatus(o, e.target.value)}
                        style={{ minWidth: '120px' }}
                      >
                        {STATUS_ORDER.map((s) => (
                          <option key={s} value={s}>{STATUS_LABEL[s].label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
