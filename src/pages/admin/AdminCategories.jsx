import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import categoryApi from '../../services/categoryApi';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from './AdminLayout';

const PAGE_SIZE = 10;

export default function AdminCategories({ onNavigate, onShowToast }) {
  const { user, logout } = useAuth();

  const [categories, setCategories] = useState([]);
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Search (client-side on the loaded page set)
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  // Create / update modal state (one shared form)
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // category being edited, null = create
  const [name, setName] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete confirmation modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Debounce the search input before applying the client-side filter.
  const hasTyped = useRef(false);
  useEffect(() => {
    if (!hasTyped.current) {
      hasTyped.current = true;
      return;
    }
    const t = setTimeout(() => setAppliedSearch(search.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to first page when the search changes.
  useEffect(() => {
    setPage(1);
  }, [appliedSearch]);

  // Memoized, filtered rows for the current page.
  const filtered = useMemo(() => {
    if (!appliedSearch) return categories;
    return categories.filter((c) => (c.name || '').toLowerCase().includes(appliedSearch));
  }, [categories, appliedSearch]);

  // Load categories from FreeAPI.
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await categoryApi.fetchCategories({ page, limit: PAGE_SIZE });
      setCategories(result.categories || []);
      setTotalCategories(result.totalCategories || 0);
      setTotalPages(Math.max(result.totalPages || 1, 1));
    } catch (err) {
      setError(err.message || 'تعذر تحميل الأقسام');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setFieldError('');
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setName(category.name || '');
    setFieldError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setFieldError('اسم القسم مطلوب');
      return;
    }
    setSaving(true);
    setFieldError('');
    try {
      if (editing) {
        await categoryApi.updateCategory(editing.id, trimmed);
        setCategories((prev) =>
          prev.map((c) => (c.id === editing.id ? { ...c, name: trimmed } : c))
        );
        onShowToast?.('تم تحديث القسم بنجاح');
      } else {
        const created = await categoryApi.createCategory(trimmed);
        const returned = created && created.name ? created : { id: `${Date.now()}`, name: trimmed };
        setCategories((prev) => [returned, ...prev]);
        setTotalCategories((t) => t + 1);
        onShowToast?.(`تم إضافة القسم "${trimmed}"`);
      }
      setModalOpen(false);
      setPage(1);
    } catch (err) {
      onShowToast?.(err.message || 'خطأ أثناء حفظ القسم');
    } finally {
      setSaving(false);
    }
  };

  const askDelete = (category) => {
    setDeleteTarget(category);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await categoryApi.deleteCategory(deleteTarget.id);
      // Optimistic update: remove from list immediately.
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setTotalCategories((t) => Math.max(0, t - 1));
      onShowToast?.(`تم حذف القسم "${deleteTarget.name}"`);
      setConfirmOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      onShowToast?.(err.message || 'خطأ أثناء حذف القسم');
    } finally {
      setDeleting(false);
    }
  };

  const retry = () => setRefreshKey((k) => k + 1);

  const handlePageChange = (nextPage) => {
    const clamp = Math.min(Math.max(1, nextPage), totalPages);
    if (clamp !== page) setPage(clamp);
  };

  return (
    <AdminLayout active="admin-categories" user={user} onNavigate={onNavigate} onLogout={logout} onShowToast={onShowToast}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold text-primary mb-0" style={{ fontSize: '1.75rem' }}>إدارة الأقسام</h1>
        <button className="btn btn-primary d-flex align-items-center gap-1" onClick={openCreate}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
          <span>إضافة قسم</span>
        </button>
      </div>

      <div className="bg-white rounded-3 border p-3 p-md-4 shadow-sm">
        {/* Search */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
          <div className="input-group" style={{ maxWidth: '300px' }}>
            <span className="input-group-text bg-white border-end-0 text-muted">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="ابحث عن قسم..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="text-muted small">
            عرض {filtered.length} من أصل {totalCategories} قسم
          </span>
        </div>

        {loading ? (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border text-primary mb-2" role="status">
              <span className="visually-hidden">جاري التحميل...</span>
            </div>
            <div>جاري تحميل الأقسام...</div>
          </div>
        ) : error ? (
          <div className="text-center py-5">
            <span className="material-symbols-outlined text-danger mb-2" style={{ fontSize: '40px' }}>cloud_off</span>
            <div className="text-muted mb-3">{error}</div>
            <button className="btn btn-outline-primary btn-sm" onClick={retry}>إعادة المحاولة</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <span className="material-symbols-outlined mb-2" style={{ fontSize: '40px' }}>category</span>
            <div>{appliedSearch ? 'لا توجد أقسام مطابقة للبحث' : 'لا توجد أقسام حالياً'}</div>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="sorur-table align-middle">
                <thead>
                  <tr>
                    <th>اسم القسم</th>
                    <th>المعرف</th>
                    <th>إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id}>
                      <td className="fw-bold text-dark">{c.name}</td>
                      <td>
                        <span className="badge bg-light text-muted font-monospace">{c.id}</span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => openEdit(c)}>تعديل</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => askDelete(c)}>حذف</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="d-flex justify-content-center mt-3" aria-label="صفحات الأقسام">
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(page - 1)}>السابق</button>
                  </li>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <li key={i} className={`page-item ${i + 1 === page ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
                    </li>
                  ))}
                  <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(page + 1)}>التالي</button>
                  </li>
                </ul>
              </nav>
            )}
          </>
        )}
      </div>

      {/* Create / Update modal (reused form) */}
      {modalOpen && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg animate-fade-in-down">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold text-primary">{editing ? 'تعديل القسم' : 'إضافة قسم جديد'}</h5>
                <button type="button" className="btn-close" onClick={() => setModalOpen(false)}></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleSubmit} noValidate>
                  <label className="form-label small fw-semibold">اسم القسم</label>
                  <input
                    className={`form-control ${fieldError ? 'is-invalid' : ''}`}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldError) setFieldError('');
                    }}
                    placeholder="مثال: هدايا العيد"
                    autoFocus
                  />
                  {fieldError && <div className="invalid-feedback d-block">{fieldError}</div>}
                  <div className="mt-3 d-flex gap-2">
                    <button type="submit" className="btn-sorur-admin" disabled={saving}>
                      {saving ? 'جاري الحفظ...' : editing ? 'حفظ التعديلات' : 'إضافة القسم'}
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setModalOpen(false)} disabled={saving}>
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmOpen && deleteTarget && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1070 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content rounded-4 border-0 shadow-lg animate-fade-in-down text-center p-3">
              <div className="my-2">
                <span className="material-symbols-outlined text-danger" style={{ fontSize: '48px' }}>warning</span>
              </div>
              <h5 className="fw-bold text-dark mb-2">تأكيد الحذف</h5>
              <p className="text-muted small mb-4">
                هل أنت متأكد من حذف القسم <b className="text-dark">"{deleteTarget.name}"</b>؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="d-flex gap-2 justify-content-center">
                <button className="btn btn-outline-secondary" onClick={() => setConfirmOpen(false)} disabled={deleting}>
                  إلغاء
                </button>
                <button className="btn btn-danger d-flex align-items-center gap-1" onClick={confirmDelete} disabled={deleting}>
                  {deleting && (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  )}
                  {deleting ? 'جاري الحذف...' : 'نعم، احذف'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}