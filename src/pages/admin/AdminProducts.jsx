import React, { useEffect, useState } from 'react';
import mockApi from '../../services/mockApi';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from './AdminLayout';

const EMPTY = { name: '', category: '', description: '', price: '', previousPrice: '', stock: 0, mainImage: '' };

export default function AdminProducts({ onNavigate, onShowToast }) {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
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
      const [p, c] = await Promise.all([
        mockApi.product.getAllProducts({ limit: 100 }),
        mockApi.category.getAllCategories({ limit: 100 }),
      ]);
      setProducts(p.data.products || []);
      setCategories(c.data.categories || []);
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

  const catName = (id) => categories.find((c) => c._id === id)?.name || id;

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY, category: categories[0]?._id || '' });
    setModalOpen(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name,
      category: p.category,
      description: p.description || '',
      price: p.price,
      previousPrice: p.previousPrice || '',
      stock: p.stock,
      mainImage: p.mainImage?.url || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        name: form.name,
        category: form.category,
        description: form.description,
        price: form.price,
        previousPrice: form.previousPrice || undefined,
        stock: form.stock,
      };
      if (editing) {
        const res = await mockApi.product.updateProduct(editing._id, body, tokenHeaders());
        if (res.success) onShowToast?.('تم تحديث المنتج بنجاح');
      } else {
        const res = await mockApi.product.createProduct({ ...body, mainImage: form.mainImage }, tokenHeaders());
        if (res.success) onShowToast?.('تم إضافة المنتج بنجاح');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      onShowToast?.(err.message || 'خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    try {
      const res = await mockApi.product.deleteProduct(p._id, tokenHeaders());
      if (res.success) onShowToast?.('تم حذف المنتج');
      load();
    } catch (err) {
      onShowToast?.(err.message || 'خطأ أثناء الحذف');
    }
  };

  return (
    <AdminLayout active="admin-products" user={user} onNavigate={onNavigate} onLogout={logout} onShowToast={onShowToast}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold text-primary mb-0" style={{ fontSize: '1.75rem' }}>إدارة المنتجات</h1>
        <button className="btn btn-primary d-flex align-items-center gap-1" onClick={openCreate}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
          <span>إضافة منتج</span>
        </button>
      </div>

      <div className="bg-white rounded-3 border p-3 p-md-4 shadow-sm">
        {loading ? (
          <div className="text-center py-4 text-muted">جاري تحميل المنتجات...</div>
        ) : (
          <div className="table-responsive">
            <table className="sorur-table">
              <thead>
                <tr>
                  <th>الصورة</th>
                  <th>الاسم</th>
                  <th>القسم</th>
                  <th>السعر (ج.م)</th>
                  <th>المخزون</th>
                  <th>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <img src={p.mainImage?.url} alt={p.name} style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px' }} />
                    </td>
                    <td className="fw-bold text-dark">{p.name}</td>
                    <td><span className="badge bg-light text-dark">{catName(p.category)}</span></td>
                    <td className="fw-bold text-secondary">{p.price} ج.م</td>
                    <td>
                      <span className={`badge ${p.stock <= 5 ? 'bg-danger' : 'bg-success'}`}>{p.stock} قطع</span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => openEdit(p)}>تعديل</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p)}>حذف</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg animate-fade-in-down">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold text-primary">{editing ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h5>
                <button type="button" className="btn-close" onClick={() => setModalOpen(false)}></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleSave}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold">اسم المنتج</label>
                      <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">القسم</label>
                      <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                        {categories.map((c) => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">الكمية المتوفرة</label>
                      <input type="number" className="form-control" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">السعر (ج.م)</label>
                      <input type="number" className="form-control" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">السعر قبل الخصم (اختياري)</label>
                      <input type="number" className="form-control" value={form.previousPrice} onChange={(e) => setForm({ ...form, previousPrice: e.target.value })} />
                    </div>
                    {!editing && (
                      <div className="col-12">
                        <label className="form-label small fw-semibold">رابط الصورة الرئيسية</label>
                        <input className="form-control" value={form.mainImage} onChange={(e) => setForm({ ...form, mainImage: e.target.value })} />
                      </div>
                    )}
                    <div className="col-12">
                      <label className="form-label small fw-semibold">الوصف</label>
                      <textarea className="form-control" rows="2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    </div>
                  </div>
                  <div className="mt-3 d-flex gap-2">
                    <button type="submit" className="btn-sorur-admin" disabled={saving}>
                      {saving ? 'جاري الحفظ...' : editing ? 'حفظ التعديلات' : 'إضافة المنتج'}
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
