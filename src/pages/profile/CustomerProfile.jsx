import React, { useEffect, useState } from 'react';
import mockApi from '../../services/mockApi';
import { useAuth } from '../../context/AuthContext';
import CustomerLayout from './CustomerLayout';

export default function CustomerProfile({ onNavigate, onShowToast }) {
  const { user, refreshUser, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', phoneNumber: '', countryCode: '+20' });

  const tokenHeaders = () => {
    const raw = localStorage.getItem('sorur_tokens');
    return raw ? { Authorization: `Bearer ${JSON.parse(raw).accessToken}` } : {};
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await mockApi.profile.getMyProfile(tokenHeaders());
        if (active && res.success) {
          setProfile(res.data);
        }
      } catch {
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const startEdit = () => {
    setForm({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      phoneNumber: profile?.phoneNumber || '',
      countryCode: profile?.countryCode || '+20',
    });
    setEditing(true);
  };

  const handleSave = async (e) => {
  e.preventDefault();
  setSaving(true);

  try {
    const res = await mockApi.profile.updateMyProfile(
      form,
      tokenHeaders()
    );

    if (res.success) {
      setProfile(res.data);
      setEditing(false);

      onShowToast?.(
        'تم تحديث بياناتك بنجاح'
      );
    }
  } catch (err) {
    onShowToast?.(
      err.message || 'خطأ أثناء التحديث'
    );
  } finally {
    setSaving(false);
  }
};

  const Row = ({ label, value }) => (
    <div className="d-flex justify-content-between py-2 border-bottom">
      <span className="text-muted">{label}</span>
      <span className="fw-semibold text-dark">{value}</span>
    </div>
  );

  return (
    <CustomerLayout active="profile" user={user} onNavigate={onNavigate} onLogout={logout}>
      <div className="bg-white rounded-3 border p-3 p-md-4 shadow-sm animate-fade-in-up">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold text-primary mb-0" style={{ fontSize: '1.3rem' }}>ملفي الشخصي</h4>
          {!editing && profile && (
            <button className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1" onClick={startEdit}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
              <span>تعديل</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-4 text-muted">جاري تحميل الملف الشخصي...</div>
        ) : !profile && !editing ? (
          <div className="text-center py-4">
            <p className="text-muted mb-3">لم تقم بملء بياناتك الشخصية بعد.</p>
            <button className="btn-sorur-primary" onClick={startEdit}>أكمل بياناتك الآن</button>
          </div>
        ) : editing ? (
          <form onSubmit={handleSave} className="max-w-lg">
            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="form-label small fw-semibold">الاسم الأول</label>
                <input className="form-control" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              </div>
              <div className="col-6">
                <label className="form-label small fw-semibold">الاسم الأخير</label>
                <input className="form-control" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              </div>
              <div className="col-3">
                <label className="form-label small fw-semibold">رمز الدولة</label>
                <input className="form-control" value={form.countryCode} onChange={(e) => setForm({ ...form, countryCode: e.target.value })} />
              </div>
              <div className="col-9">
                <label className="form-label small fw-semibold">رقم الجوال</label>
                <input className="form-control text-start" dir="ltr" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
              </div>
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn-sorur-primary" disabled={saving}>
                {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => setEditing(false)}>إلغاء</button>
            </div>
          </form>
        ) : (
          <div>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="avatar-circle" style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>
                {user?.username?.charAt(0)?.toUpperCase() || '؟'}
              </div>
              <div>
                <h5 className="fw-bold text-dark mb-0">{profile?.firstName || profile?.lastName ? `${profile.firstName} ${profile.lastName}` : user?.username}</h5>
                <span className="text-muted small">{user?.email}</span>
              </div>
            </div>
            <div className="mt-2">
              <Row label="الاسم الأول" value={profile?.firstName || '—'} />
              <Row label="الاسم الأخير" value={profile?.lastName || '—'} />
              <Row label="رقم الجوال" value={profile?.phoneNumber ? `${profile.countryCode} ${profile.phoneNumber}` : '—'} />
              <Row label="الدولة" value="مصر" />
              <Row label="الدور" value={user?.role === 'ADMIN' ? 'مدير' : 'عميل'} />
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
