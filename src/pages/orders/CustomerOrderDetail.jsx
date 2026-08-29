import React, { useEffect, useState } from 'react';
import mockApi from '../../services/mockApi';
import { useAuth } from '../../context/AuthContext';
import CustomerLayout from '../profile/CustomerLayout';

const STATUS_LABEL = {
  PENDING: { label: 'قيد التنفيذ', cls: 'status-pending' },
  DELIVERED: { label: 'تم التسليم', cls: 'status-completed' },
  CANCELLED: { label: 'ملغى', cls: 'status-cancelled' },
};

export default function CustomerOrderDetail({ orderId, onNavigate, onShowToast }) {
  const { user, logout } = useAuth();
  const [detail, setDetail] = useState(null);
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
        const res = await mockApi.order.getOrderById(orderId, tokenHeaders());
        if (active && res.success) setDetail(res.data);
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
  }, [orderId]);

  if (loading) {
    return (
      <CustomerLayout active="orders" user={user} onNavigate={onNavigate} onLogout={logout}>
        <div className="text-center py-5 text-muted">جاري تحميل تفاصيل الطلب...</div>
      </CustomerLayout>
    );
  }

  if (!detail) {
    return (
      <CustomerLayout active="orders" user={user} onNavigate={onNavigate} onLogout={logout}>
        <div className="text-center py-5 text-muted">الطلب غير موجود.</div>
      </CustomerLayout>
    );
  }

  const order = detail.order;
  const st = STATUS_LABEL[order.status] || STATUS_LABEL.PENDING;
  const addr = order.address;

  return (
    <CustomerLayout active="orders" user={user} onNavigate={onNavigate} onLogout={logout}>
      <div className="animate-fade-in-up">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" onClick={() => onNavigate('customer-orders')}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
            <span>العودة للطلبات</span>
          </button>
          <span className={`status-badge ${st.cls}`}>{st.label}</span>
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <div className="bg-white rounded-3 border p-3 p-md-4 shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-primary mb-0">تفاصيل الطلب <span className="dir-ltr">#{order._id}</span></h5>
                <span className="text-muted small">{new Date(order.createdAt).toLocaleDateString('ar-EG', { dateStyle: 'long' })}</span>
              </div>

              <div className="table-responsive">
                <table className="sorur-table">
                  <thead>
                    <tr>
                      <th>المنتج</th>
                      <th>الكمية</th>
                      <th>السعر</th>
                      <th>الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((it) => (
                      <tr key={it._id}>
                        <td className="fw-semibold text-dark">{it.product.name}</td>
                        <td>{it.quantity}</td>
                        <td>{it.product.price} ج.م</td>
                        <td className="fw-bold text-secondary">{it.product.price * it.quantity} ج.م</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-between py-2 border-top mt-3">
                <span className="fw-semibold text-dark">الإجمالي الفرعي</span>
                <span className="fw-semibold">{order.orderPrice} ج.م</span>
              </div>
              {order.coupon && (
                <div className="d-flex justify-content-between py-2 text-success">
                  <span className="fw-semibold">خصم الكوبون</span>
                  <span className="fw-semibold">-{order.orderPrice - order.discountedOrderPrice} ج.م</span>
                </div>
              )}
              <div className="d-flex justify-content-between py-2 border-top">
                <span className="fw-bold text-dark">الإجمالي النهائي</span>
                <span className="fw-bold text-secondary">{order.discountedOrderPrice} ج.م</span>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="bg-white rounded-3 border p-3 p-md-4 shadow-sm">
              <h6 className="fw-bold text-primary mb-3">عنوان التوصيل</h6>
              <div className="text-muted small lh-lg">
                <div className="fw-semibold text-dark">{addr.addressLine1}</div>
                {addr.addressLine2 && <div>{addr.addressLine2}</div>}
                <div>{addr.city}، {addr.state}</div>
                <div>{addr.country} — {addr.pincode}</div>
              </div>
              <hr className="my-3 opacity-25" />
              <h6 className="fw-bold text-primary mb-2">معلومات الطلب</h6>
              <div className="text-muted small d-flex flex-column gap-1">
                <div className="d-flex justify-content-between"><span>الحالة</span><span className="fw-semibold text-dark">{st.label}</span></div>
                <div className="d-flex justify-content-between"><span>الدفع</span><span className="fw-semibold text-dark">{order.isPaymentDone ? 'مدفوع' : 'غير مدفوع'}</span></div>
                <div className="d-flex justify-content-between"><span>مزوّد الدفع</span><span className="fw-semibold text-dark">{order.paymentProvider || 'UNKNOWN'}</span></div>
                {order.paymentId && <div className="d-flex justify-content-between"><span>معرّف الدفع</span><span className="fw-semibold text-dark dir-ltr">{order.paymentId}</span></div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
