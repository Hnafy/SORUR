import React, { useEffect, useState } from 'react';
import mockApi from '../../services/mockApi';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from './AdminLayout';

const EMPTY = { name: '', couponCode: '', discountValue: '', minimumCartValue: '', expiryDate: '' };

export default function AdminCoupons({ onNavigate, onShowToast }) {
  const { user, logout } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const tokenHeaders = () => {
    const raw = localStorage.getItem('sorur_tokens');
    return raw ? { Authorization: `Bearer ${JSON.parse(raw).accessToken}` } : {};
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await mockApi.coupon.getAllCoupons({ limit: 100 }, tokenHeaders());
      setCoupons(res.data.coupons || []);
    } catch {
      /* guarded */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  };
  const openEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name,
      couponCode: c.couponCode,
      discountValue: c.discountValue,
      minimumCartValue: c.minimumCartValue,
      expiryDate: c.expiryDate ? c.expiryDate.slice(0, 10) : '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const couponCode = form.couponCode.toUpperCase().trim();
      if (editing) {
        const res = await mockApi.coupon.updateCoupon(editing._id, { ...form, couponCode }, tokenHeaders());
        if (res.success) onShowToast?.('تم تحديث الكوبون بنجاح');
      } else {
        const res = await mockApi.coupon.createCoupon({ ...form, couponCode }, tokenHeaders());
        if (res.success) onShowToast?.('تم إضافة الكوبون بنجاح');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      onShowToast?.(err.message || 'خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c) => {
    try {
      const res = await mockApi.coupon.updateCouponActiveStatus(c._id, { isActive: !c.isActive }, tokenHeaders());
      if (res.success) {
        onShowToast?.(`تم ${res.data.isActive ? 'تفعيل' : 'تعطيل'} الكوبون ${c.couponCode}`);
        load();
      }
    } catch (err) {
      onShowToast?.(err.message || 'خطأ');
    }
  };

  const handleDelete = async (c) => {
    try {
      const res = await mockApi.coupon.deleteCoupon(c._id, tokenHeaders());
      if (res.success) {
        onShowToast?.('تم حذف الكوبون');
        load();
      }
    } catch (err) {
      onShowToast?.(err.message || 'خطأ');
    }
  };

  return (
    <AdminLayout active="admin-coupons" user={user} onNavigate={onNavigate} onLogout={logout} onShowToast={onShowToast}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold text-primary mb-0" style={{ fontSize: '1.75rem' }}>إدارة الكوبونات</h1>
        <button className="btn btn-primary d-flex align-items-center gap-1" onClick={openCreate}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
          <span>إضافة كوبون</span>
        </button>
      </div>

      <div className="bg-white rounded-3 border p-3 p-md-4 shadow-sm">
        {loading ? (
          <div className="text-center py-4 text-muted">جاري تحميل الكوبونات...</div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-4 text-muted">لا توجد كوبونات بعد</div>
        ) : (
          <div className="row g-3">
            {coupons.map((c) => (
              <div className="col-12 col-md-6 col-lg-4" key={c._id}>
                <div className="border rounded-3 p-3 h-100 d-flex flex-column">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="fw-bold text-primary dir-ltr">{c.couponCode}</span>
                    <span className={`form-check form-switch m-0`}>
                      <input
                        className="form-check-input cursor-pointer"
                        type="checkbox"
                        checked={c.isActive}
                        onChange={() => toggleActive(c)}
                        title={c.isActive ? 'تعطيل' : 'تفعيل'}
                      />
                    </span>
                  </div>
                  <div className="fw-semibold text-dark small mb-2">{c.name}</div>
                  <div className="text-muted small mb-2">
                    <div>الخصم: <span className="fw-bold text-secondary">{c.discountValue} ج.م</span></div>
                    <div>الحد الأدنى: {c.minimumCartValue} ج.م</div>
                  </div>
                  <span className={`badge align-self-start mb-3 ${c.isActive ? 'text-bg-success' : 'text-bg-secondary'}`}>
                    {c.isActive ? 'مفعّل' : 'معطّل'}
                  </span>
                  <div className="mt-auto d-flex gap-2">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => openEdit(c)}>تعديل</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c)}>حذف</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg animate-fade-in-down">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold text-primary">{editing ? 'تعديل الكوبون' : 'إضافة كوبون جديد'}</h5>
                <button type="button" className="btn-close" onClick={() => setModalOpen(false)}></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleSave}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">اسم الكوبون</label>
                    <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">كود الكوبون</label>
                    <input className="form-control text-uppercase" value={form.couponCode} onChange={(e) => setForm({ ...form, couponCode: e.target.value })} required />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">قيمة الخصم (ج.م)</label>
                      <input type="number" className="form-control" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">الحد الأدنى (ج.م)</label>
                      <input type="number" className="form-control" value={form.minimumCartValue} onChange={(e) => setForm({ ...form, minimumCartValue: e.target.value })} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">تاريخ الانتهاء (اختياري)</label>
                    <input type="date" className="form-control" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
                  </div>
                  <div className="mt-3 d-flex gap-2">
                    <button type="submit" className="btn-sorur-admin" disabled={saving}>
                      {saving ? 'جاري الحفظ...' : editing ? 'حفظ التعديلات' : 'إضافة الكوبون'}
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setModalOpen(false)}>إلغاء</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
