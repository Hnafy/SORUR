import React, { useEffect, useState } from 'react';
import mockApi from '../../services/mockApi';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from './AdminLayout';

export default function AdminCategories({ onNavigate, onShowToast }) {
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const tokenHeaders = () => {
    const raw = localStorage.getItem('sorur_tokens');
    return raw ? { Authorization: `Bearer ${JSON.parse(raw).accessToken}` } : {};
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await mockApi.category.getAllCategories({ limit: 100, page: 1 });
      setCategories(res.data.categories || []);
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

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await mockApi.category.createCategory({ name: newName.trim() }, tokenHeaders());
      if (res.success) {
        onShowToast?.(`تم إضافة القسم "${newName.trim()}"`);
        setNewName('');
        load();
      }
    } catch (err) {
      onShowToast?.(err.message || 'خطأ');
    } finally {
      setAdding(false);
    }
  };

  const handleUpdate = async (id) => {
    try {
      const res = await mockApi.category.updateCategory(id, { name: editName.trim() }, tokenHeaders());
      if (res.success) {
        onShowToast?.('تم تحديث القسم');
        setEditingId(null);
        load();
      }
    } catch (err) {
      onShowToast?.(err.message || 'خطأ');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await mockApi.category.deleteCategory(id, tokenHeaders());
      if (res.success) {
        onShowToast?.('تم حذف القسم');
        load();
      }
    } catch (err) {
      onShowToast?.(err.message || 'خطأ');
    }
  };

  return (
    <AdminLayout active="admin-categories" user={user} onNavigate={onNavigate} onLogout={logout} onShowToast={onShowToast}>
      <h1 className="fw-bold text-primary mb-4" style={{ fontSize: '1.75rem' }}>إدارة الأقسام</h1>

      <form onSubmit={handleAdd} className="bg-white rounded-3 border p-3 p-md-4 shadow-sm mb-4">
        <label className="form-label small fw-semibold">إضافة قسم جديد</label>
        <div className="input-group">
          <input className="form-control" placeholder="اسم القسم (مثال: هدايا العيد)" value={newName} onChange={(e) => setNewName(e.target.value)} required />
          <button type="submit" className="btn-sorur-admin" disabled={adding}>
            {adding ? 'جاري الإضافة...' : 'إضافة القسم'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-3 border p-3 p-md-4 shadow-sm">
        {loading ? (
          <div className="text-center py-4 text-muted">جاري تحميل الأقسام...</div>
        ) : (
          <div className="row g-3">
            {categories.map((c) => (
              <div className="col-12 col-md-6 col-lg-4" key={c._id}>
                <div className="border rounded-3 p-3 h-100">
                  {editingId === c._id ? (
                    <>
                      <div className="input-group mb-2">
                        <input className="form-control" value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus />
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-sorur-admin" onClick={() => handleUpdate(c._id)}>حفظ</button>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditingId(null)}>إلغاء</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="fw-bold text-dark">{c.name}</span>
                        <span className="badge bg-light text-muted">#{c._id}</span>
                      </div>
                      <div className="d-flex gap-2 mt-2">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => {
                            setEditingId(c._id);
                            setEditName(c.name);
                          }}
                        >
                          تعديل
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c._id)}>حذف</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
