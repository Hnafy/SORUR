import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import CustomerLayout from '../profile/CustomerLayout';

const EMPTY = { addressLine1: '', addressLine2: '', city: '', country: 'مصر', pincode: '', state: '' };

export default function CustomerAddresses({ onNavigate, onShowToast }) {
  const { user, logout } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [defaultId, setDefaultId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

const load = async () => {
  setLoading(true);

  try {
    const res = await api.get(
      '/ecommerce/addresses',
      {
        params: {
          page: 1,
          limit: 50,
        },
      }
    );

    setAddresses(res?.data?.addresses || []);
  } catch (err) {
    onShowToast?.(
      err.message || 'خطأ أثناء تحميل العناوين'
    );
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY, country: 'مصر' });
    setModalOpen(true);
  };
  const openEdit = (addr) => {
    setEditingId(addr._id);
    setForm({ addressLine1: addr.addressLine1, addressLine2: addr.addressLine2, city: addr.city, country: addr.country, pincode: addr.pincode, state: addr.state });
    setModalOpen(true);
  };

const handleSave = async (e) => {
  e.preventDefault();
  setSaving(true);

  try {
    if (editingId) {
      const payload = {
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: String(form.pincode).trim(),
        country: form.country.trim(),
      };

      const response = await api.patch(
        `/ecommerce/addresses/${editingId}`,
        payload
      );

      if (response?.success) {
        onShowToast?.('تم تحديث العنوان بنجاح');
        setModalOpen(false);
        await load();
      }
    } else {
      const payload = {
        addressLine1: form.addressLine1.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: String(form.pincode).trim(),
        country: form.country.trim(),
      };

      const addressLine2 = form.addressLine2.trim();

      if (addressLine2) {
        payload.addressLine2 = addressLine2;
      }

      const response = await api.post(
        '/ecommerce/addresses',
        payload
      );

      if (response?.success && response?.data?._id) {
        onShowToast?.('تم إضافة العنوان بنجاح');

        setModalOpen(false);

        await load();
      } else {
        throw new Error(
          response?.message ||
            'FreeAPI لم يرجع بيانات العنوان بشكل صحيح'
        );
      }
    }
  } catch (error) {
    onShowToast?.(
      error.message || 'خطأ أثناء حفظ العنوان'
    );
  } finally {
    setSaving(false);
  }
};


  const handleDelete = async (id) => {
    try {
      const res = await mockApi.address.deleteAddress(id, tokenHeaders());
      if (res.success) onShowToast?.('تم حذف العنوان');
      load();
    } catch (err) {
      onShowToast?.(err.message || 'خطأ أثناء الحذف');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const res = await mockApi.address.setDefaultAddress(id, tokenHeaders());
      if (res.success) {
        setDefaultId(res.data.defaultAddressId);
        onShowToast?.('تم تعيين العنوان الافتراضي');
      }
    } catch (err) {
      onShowToast?.(err.message || 'خطأ');
    }
  };

  const modalInput = (key, label, placeholder = '') => (
    <div className="mb-3">
      <label className="form-label small fw-semibold">{label}</label>
      <input className="form-control" placeholder={placeholder} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required={['addressLine1', 'city', 'country', 'pincode', 'state'].includes(key)} />
    </div>
  );

  return (
    <CustomerLayout active="addresses" user={user} onNavigate={onNavigate} onLogout={logout}>
      <div className="animate-fade-in-up">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold text-primary mb-0" style={{ fontSize: '1.3rem' }}>عناويني</h4>
          <button className="btn btn-sm btn-primary d-flex align-items-center gap-1" onClick={openCreate}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
            <span>إضافة عنوان</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-4 text-muted">جاري تحميل العناوين...</div>
        ) : addresses.length === 0 ? (
          <div className="bg-white rounded-3 border p-5 text-center shadow-sm">
            <span className="material-symbols-outlined text-muted" style={{ fontSize: '48px' }}>location_off</span>
            <h5 className="fw-bold text-dark mt-2 mb-1">لا توجد عناوين بعد</h5>
            <p className="text-muted small mb-3">أضف عنوانك الأول لتسهيل عملية التوصيل.</p>
            <button className="btn-sorur-primary" onClick={openCreate}>إضافة عنوان</button>
          </div>
        ) : (
          <div className="row g-3">
            {addresses.map((addr) => (
              <div className="col-12 col-md-6" key={addr._id}>
                <div className="bg-white rounded-3 border p-3 h-100 shadow-sm position-relative">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="fw-bold text-dark">
                      {addr.addressLine1}
                      {addr.addressLine2 && <span className="text-muted fw-normal d-block small">{addr.addressLine2}</span>}
                    </div>
                    {defaultId === addr._id && (
                      <span className="badge text-bg-primary">الافتراضي</span>
                    )}
                  </div>
                  <div className="text-muted small mb-2">
                    {addr.city}، {addr.state} — {addr.country}
                    <div className="dir-ltr">{addr.pincode}</div>
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    {defaultId !== addr._id && (
                      <button className="btn btn-sm btn-outline-primary" onClick={() => handleSetDefault(addr._id)}>تعيين كافتراضي</button>
                    )}
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => openEdit(addr)}>تعديل</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(addr._id)}>حذف</button>
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
                <h5 className="modal-title fw-bold text-primary">{editingId ? 'تعديل العنوان' : 'إضافة عنوان جديد'}</h5>
                <button type="button" className="btn-close" onClick={() => setModalOpen(false)}></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleSave}>
                  {modalInput('addressLine1', 'العنوان التفصيلي', 'رقم العمارة، اسم الشارع، الحي')}
                  {modalInput('addressLine2', 'تفاصيل إضافية (اختياري)')}
                  <div className="row g-2">
                    <div className="col-6">{modalInput('city', 'المدينة')}</div>
                    <div className="col-6">{modalInput('state', 'المحافظة / الإقليم')}</div>
                    <div className="col-6">{modalInput('country', 'الدولة')}</div>
                    <div className="col-6">{modalInput('pincode', 'الرمز البريدي')}</div>
                  </div>
                  <div className="mt-3 d-flex gap-2">
                    <button type="submit" className="btn-sorur-primary" disabled={saving}>
                      {saving ? 'جاري الحفظ...' : 'حفظ'}
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setModalOpen(false)}>إلغاء</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
}
