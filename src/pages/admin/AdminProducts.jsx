import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { productApi } from '../../services/productApi';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from './AdminLayout';

const PAGE_SIZE = 10;
const MAX_SUB_IMAGES = 4;

const EMPTY_FORM = {
  name: '',
  description: '',
  category: '',
  price: '',
  stock: 0,
  mainImageFile: null,
  newSubFiles: [], // { file, preview }
  existingSubImages: [], // { id, url } (edit only)
};

export default function AdminProducts({ onNavigate, onShowToast }) {
  const { user, logout } = useAuth();

  // ---- table state ----
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // ---- debounced client-side search ----
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const hasTyped = useRef(false);
  useEffect(() => {
    if (!hasTyped.current) {
      hasTyped.current = true;
      return;
    }
    const t = setTimeout(() => setAppliedSearch(search.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [appliedSearch]);

  const categoriesById = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [categories]);

  const filtered = useMemo(() => {
    if (!appliedSearch) return products;
    return products.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const catName = (categoriesById[p.categoryId] || '').toLowerCase();
      return name.includes(appliedSearch) || catName.includes(appliedSearch);
    });
  }, [products, appliedSearch, categoriesById]);

  // ---- load ----
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [result, catResult] = await Promise.all([
        productApi.fetchAdminProducts({ page, limit: PAGE_SIZE }),
        productApi.fetchAllCategories({ limit: 100 }),
      ]);
      setProducts(result.products || []);
      setTotalProducts(result.totalProducts || 0);
      setTotalPages(Math.max(result.totalPages || 1, 1));
      setCategories(catResult || []);
    } catch (err) {
      setError(err.message || 'تعذر تحميل المنتجات');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const catName = useCallback((id) => categoriesById[id] || 'غير مصنف', [categoriesById]);

  // ---- create/edit modal ----
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [mainPreview, setMainPreview] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setFieldError('');
    if (mainPreview) {
      try {
        URL.revokeObjectURL(mainPreview);
      } catch {
        /* noop */
      }
    }
    setMainPreview('');
    setUploadProgress(0);
  }, [mainPreview]);

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, category: categories[0]?.id || '' });
    setEditing(null);
    setMainPreview('');
    setFieldError('');
    setUploadProgress(0);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description || '',
      category: product.categoryId,
      price: product.price,
      stock: product.stock,
      mainImageFile: null,
      newSubFiles: [],
      existingSubImages: product.subImages || [],
    });
    setMainPreview(product.mainImage || '');
    setFieldError('');
    setUploadProgress(0);
    setModalOpen(true);
  };

  const setMainFile = (file) => {
    setForm((prev) => ({ ...prev, mainImageFile: file }));
    setMainPreview((prev) => {
      if (prev) {
        try {
          URL.revokeObjectURL(prev);
        } catch {
          /* noop */
        }
      }
      return file ? URL.createObjectURL(file) : '';
    });
  };

  const addSubFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    setForm((prev) => {
      const existingCount = editing ? prev.existingSubImages.length : 0;
      const remaining = Math.max(0, MAX_SUB_IMAGES - existingCount - prev.newSubFiles.length);
      const accepted = incoming.slice(0, remaining).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      return { ...prev, newSubFiles: [...prev.newSubFiles, ...accepted] };
    });
  };

  const removeNewSubFile = (index) => {
    setForm((prev) => {
      const removed = prev.newSubFiles[index];
      if (removed?.preview) {
        try {
          URL.revokeObjectURL(removed.preview);
        } catch {
          /* noop */
        }
      }
      return { ...prev, newSubFiles: prev.newSubFiles.filter((_, i) => i !== index) };
    });
  };

  const handleRemoveExistingSubImage = async (subImage) => {
    if (!editing || !subImage?.id) return;
    try {
      await productApi.removeSubImage(editing.id, subImage.id);
      setForm((prev) => ({
        ...prev,
        existingSubImages: prev.existingSubImages.filter((s) => s.id !== subImage.id),
      }));
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editing.id
            ? { ...p, subImages: (p.subImages || []).filter((s) => s.id !== subImage.id) }
            : p
        )
      );
      onShowToast?.('تم حذف الصورة الفرعية');
    } catch (err) {
      onShowToast?.(err.message || 'خطأ أثناء حذف الصورة');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      setFieldError('اسم المنتج مطلوب');
      return;
    }
    if (!form.category) {
      setFieldError('اختر القسم');
      return;
    }
    if (form.price === '' || Number(form.price) <= 0) {
      setFieldError('السعر يجب أن يكون رقماً أكبر من صفر');
      return;
    }
    if (Number(form.stock) < 0) {
      setFieldError('المخزون يجب أن يكون صفراً أو أكثر');
      return;
    }
    if (!editing && !form.mainImageFile) {
      setFieldError('الصورة الرئيسية مطلوبة');
      return;
    }
    const totalSubImages = form.newSubFiles.length + (editing ? form.existingSubImages.length : 0);
    if (totalSubImages > MAX_SUB_IMAGES) {
      setFieldError(`الحد الأقصى ${MAX_SUB_IMAGES} صور فرعية`);
      return;
    }

    setSaving(true);
    setFieldError('');
    setUploadProgress(0);
    const payload = {
      name: trimmedName,
      description: form.description || '',
      category: form.category,
      price: form.price,
      stock: form.stock,
      mainImage: form.mainImageFile,
      subImages: form.newSubFiles.map((it) => it.file),
    };
    try {
      if (editing) {
        await productApi.updateProduct(editing.id, payload, setUploadProgress);
        onShowToast?.('تم تحديث المنتج بنجاح');
      } else {
        await productApi.createProduct(payload, setUploadProgress);
        onShowToast?.('تم إضافة المنتج بنجاح');
      }
      closeModal();
      setPage(1);
      load();
    } catch (err) {
      onShowToast?.(err.message || 'خطأ أثناء حفظ المنتج');
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  // ---- view + delete modals ----
  const [viewTarget, setViewTarget] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const askDelete = (product) => {
    setDeleteTarget(product);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await productApi.deleteProduct(deleteTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setTotalProducts((t) => Math.max(0, t - 1));
      setConfirmOpen(false);
      setDeleteTarget(null);
      onShowToast?.(`تم حذف المنتج "${deleteTarget.name}"`);
      if (viewTarget?.id === deleteTarget.id) setViewTarget(null);
      load();
    } catch (err) {
      onShowToast?.(err.message || 'خطأ أثناء حذف المنتج');
    } finally {
      setDeleting(false);
    }
  };

  const retry = () => setRefreshKey((k) => k + 1);

  const handlePageChange = (nextPage) => {
    const clamped = Math.min(Math.max(1, nextPage), totalPages);
    if (clamped !== page) setPage(clamped);
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
        {/* Search + count */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
          <div className="input-group" style={{ maxWidth: '300px' }}>
            <span className="input-group-text bg-white border-end-0 text-muted">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="ابحث بالاسم أو القسم..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="text-muted small">
            عرض {filtered.length} من أصل {totalProducts} منتج
          </span>
        </div>

        {loading ? (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border text-primary mb-2" role="status">
              <span className="visually-hidden">جاري التحميل...</span>
            </div>
            <div>جاري تحميل المنتجات...</div>
          </div>
        ) : error ? (
          <div className="text-center py-5">
            <span className="material-symbols-outlined text-danger mb-2" style={{ fontSize: '40px' }}>cloud_off</span>
            <div className="text-muted mb-3">{error}</div>
            <button className="btn btn-outline-primary btn-sm" onClick={retry}>إعادة المحاولة</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <span className="material-symbols-outlined mb-2" style={{ fontSize: '40px' }}>inventory_2</span>
            <div>{appliedSearch ? 'لا توجد منتجات مطابقة للبحث' : 'لا توجد منتجات حالياً'}</div>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="sorur-table align-middle">
                <thead>
                  <tr>
                    <th>الصورة</th>
                    <th>الاسم</th>
                    <th>القسم</th>
                    <th>السعر (ج.م)</th>
                    <th>المخزون</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id}>
                      <td>
                        {p.mainImage ? (
                          <img
                            src={p.mainImage}
                            alt={p.name}
                            style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px' }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '45px', height: '45px', borderRadius: '6px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: '#f1f3f5', color: '#adb5bd',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>image</span>
                          </div>
                        )}
                      </td>
                      <td className="fw-bold text-dark">{p.name}</td>
                      <td><span className="badge bg-light text-dark">{catName(p.categoryId)}</span></td>
                      <td className="fw-bold text-secondary">{p.price} ج.م</td>
                      <td>
                        <span className={`badge ${p.stock <= 5 ? 'bg-danger' : 'bg-success'}`}>{p.stock} قطع</span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => setViewTarget(p)}>عرض</button>
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => openEdit(p)}>تعديل</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => askDelete(p)}>حذف</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="d-flex justify-content-center mt-3" aria-label="صفحات المنتجات">
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

      {/* View modal */}
      {viewTarget && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg animate-fade-in-down">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold text-primary">تفاصيل المنتج</h5>
                <button type="button" className="btn-close" onClick={() => setViewTarget(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-md-5">
                    {viewTarget.mainImage ? (
                      <img
                        src={viewTarget.mainImage}
                        alt={viewTarget.name}
                        className="w-100 rounded-3"
                        style={{ maxHeight: '260px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="rounded-3 bg-light d-flex align-items-center justify-content-center text-muted" style={{ height: '260px' }}>
                        لا توجد صورة رئيسية
                      </div>
                    )}
                    {viewTarget.subImages?.length > 0 && (
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        {viewTarget.subImages.map((s) => (
                          <img
                            key={s.id || s.url}
                            src={s.url}
                            alt={`sub-${s.id}`}
                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="col-md-7">
                    <h5 className="fw-bold text-dark">{viewTarget.name}</h5>
                    <p className="text-muted small mb-2">{viewTarget.description || 'لا يوجد وصف'}</p>
                    <div className="d-flex flex-wrap gap-2 mb-2">
                      <span className="badge bg-light text-dark">
                        <span className="material-symbols-outlined align-middle" style={{ fontSize: '14px' }}>category</span> {catName(viewTarget.categoryId)}
                      </span>
                      <span className="badge bg-primary">{viewTarget.price} ج.م</span>
                      <span className={`badge ${viewTarget.stock <= 5 ? 'bg-danger' : 'bg-success'}`}>{viewTarget.stock} قطع متاحة</span>
                    </div>
                    <div className="text-muted small">
                      <span className="font-monospace">#{viewTarget.id}</span>
                    </div>
                    <div className="mt-3 d-flex gap-2">
                      <button className="btn btn-outline-secondary" onClick={() => { setViewTarget(null); openEdit(viewTarget); }}>تعديل</button>
                      <button className="btn btn-outline-danger" onClick={() => { setViewTarget(null); askDelete(viewTarget); }}>حذف</button>
                      <button className="btn btn-outline-secondary ms-0" onClick={() => setViewTarget(null)}>إغلاق</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit modal */}
      {modalOpen && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content rounded-4 border-0 shadow-lg animate-fade-in-down">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold text-primary">{editing ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h5>
                <button type="button" className="btn-close" onClick={closeModal} disabled={saving}></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleSave} noValidate>
                  {fieldError && (
                    <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3 rounded-3" role="alert">
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>error</span>
                      <span>{fieldError}</span>
                    </div>
                  )}

                  <div className="row g-3 mb-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold mb-1">اسم المنتج *</label>
                      <input
                        className="form-control"
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="مثال: طقم عروس"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold mb-1">القسم *</label>
                      <select
                        className="form-select"
                        value={form.category}
                        onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="">اختر القسم...</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold mb-1">السعر (ج.م) *</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-control"
                        value={form.price}
                        onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold mb-1">المخزون</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={form.stock}
                        onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold mb-1">الوصف</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={form.description}
                        onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Main image */}
                  <div className="border rounded-3 p-3 mb-3 bg-light bg-opacity-50">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label small fw-bold text-dark mb-0">
                        {editing ? 'الصورة الرئيسية' : 'الصورة الرئيسية *'}
                      </label>
                      <span className="text-muted small">أقصى صورة واحدة</span>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="border rounded-3 bg-white d-flex align-items-center justify-content-center overflow-hidden"
                        style={{ width: '120px', height: '120px', flexShrink: 0 }}
                      >
                        {mainPreview ? (
                          <img src={mainPreview} alt="main" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span className="material-symbols-outlined text-muted" style={{ fontSize: '32px' }}>image</span>
                        )}
                      </div>
                      <div className="flex-grow-1">
                        <input
                          type="file"
                          accept="image/*"
                          className="form-control"
                          onChange={(e) => setMainFile(e.target.files?.[0] || null)}
                        />
                        <div className="text-muted small mt-1">
                          {editing
                            ? form.mainImageFile
                              ? 'سيتم استبدال الصورة الرئيسية عند الحفظ'
                              : 'اتركه فارغاً للإبقاء على الصورة الحالية'
                            : 'اختر صورة رئيسية للمنتج'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sub images */}
                  <div className="border rounded-3 p-3 bg-light bg-opacity-50">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label small fw-bold text-dark mb-0">صور إضافية (اختياري)</label>
                      <span
                        className={`text-muted small ${form.newSubFiles.length + (editing ? form.existingSubImages.length : 0) >= MAX_SUB_IMAGES ? 'text-danger fw-bold' : ''}`}
                      >
                        {form.newSubFiles.length + (editing ? form.existingSubImages.length : 0)}/{MAX_SUB_IMAGES}
                      </span>
                    </div>

                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {form.existingSubImages.map((s) => (
                        <div key={s.id || s.url} className="position-relative">
                          <img
                            src={s.url}
                            alt="sub"
                            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-danger rounded-circle position-absolute d-flex align-items-center justify-content-center"
                            style={{ top: '-6px', left: '-6px', width: '22px', height: '22px', padding: 0 }}
                            onClick={() => handleRemoveExistingSubImage(s)}
                            title="حذف الصورة"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                          </button>
                        </div>
                      ))}
                      {form.newSubFiles.map((item, index) => (
                        <div key={item.preview} className="position-relative">
                          <img
                            src={item.preview}
                            alt="new-sub"
                            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-danger rounded-circle position-absolute d-flex align-items-center justify-content-center"
                            style={{ top: '-6px', left: '-6px', width: '22px', height: '22px', padding: 0 }}
                            onClick={() => removeNewSubFile(index)}
                            title="إزالة"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                          </button>
                        </div>
                      ))}
                      {form.newSubFiles.length + (editing ? form.existingSubImages.length : 0) < MAX_SUB_IMAGES && (
                        <label
                          className="btn btn-outline-primary d-flex align-items-center justify-content-center border-dashed"
                          style={{ width: '80px', height: '80px', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>add</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="d-none"
                            onChange={(e) => {
                              addSubFiles(e.target.files);
                              e.target.value = '';
                            }}
                          />
                        </label>
                      )}
                    </div>
                    <div className="text-muted small">
                      {editing
                        ? 'اختر صوراً جديدة لإضافتها. لحذف صورة موجودة اضغط على العلامة الحمراء.'
                        : `يمكنك اختيار حتى ${MAX_SUB_IMAGES} صور إضافية.`}
                    </div>
                  </div>

                  <div className="mt-3 d-flex gap-2 align-items-center">
                    <button type="submit" className="btn-sorur-admin" disabled={saving}>
                      {saving ? (
                        <span className="d-inline-flex align-items-center gap-2">
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          جاري الحفظ... {uploadProgress > 0 && `(${Math.round(uploadProgress)}%)`}
                        </span>
                      ) : editing ? 'حفظ التعديلات' : 'إضافة المنتج'}
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={closeModal} disabled={saving}>إلغاء</button>
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
                هل أنت متأكد من حذف المنتج <b className="text-dark">"{deleteTarget.name}"</b>؟ لا يمكن التراجع عن هذا الإجراء.
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