import React, { useEffect, useState } from 'react';
import couponApi from '../../services/couponApi';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from './AdminLayout';

const EMPTY_FORM = {
  name: '',
  couponCode: '',
  discountValue: '',
  minimumCartValue: '',
  expiryDate: '',
};

const formatDate = (date) => {
  if (!date) {
    return '—';
  }

  return new Date(date).toLocaleDateString(
    'ar-EG'
  );
};

export default function AdminCoupons({
  onNavigate,
  onShowToast,
}) {
  const { user, logout } = useAuth();

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [busyCouponId, setBusyCouponId] =
    useState(null);

  const loadCoupons = async () => {
    setLoading(true);

    try {
      const result =
        await couponApi.getAdminCoupons();

      setCoupons(result);
    } catch (error) {
      onShowToast?.(
        error.message ||
          'تعذر تحميل الكوبونات'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const openCreateModal = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEditModal = (coupon) => {
    setEditing(coupon);

    setForm({
      name: coupon.name || '',
      couponCode: coupon.couponCode || '',
      discountValue:
        coupon.discountValue ?? '',
      minimumCartValue:
        coupon.minimumCartValue ?? '',
      expiryDate: coupon.expiryDate
        ? coupon.expiryDate.slice(0, 10)
        : '',
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const updateFormField = (
    field,
    value
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const couponCode = form.couponCode
      .trim()
      .toUpperCase();

    const discountValue = Number(
      form.discountValue
    );

    const minimumCartValue = Number(
      form.minimumCartValue || 0
    );

    if (!form.name.trim()) {
      onShowToast?.(
        'اكتبي اسم الكوبون'
      );
      return;
    }

    if (!couponCode) {
      onShowToast?.(
        'اكتبي كود الكوبون'
      );
      return;
    }

    if (
      !Number.isFinite(discountValue) ||
      discountValue <= 0
    ) {
      onShowToast?.(
        'قيمة الخصم يجب أن تكون أكبر من صفر'
      );
      return;
    }

    if (
      !Number.isFinite(minimumCartValue) ||
      minimumCartValue < 0
    ) {
      onShowToast?.(
        'الحد الأدنى يجب أن يكون صفرًا أو أكثر'
      );
      return;
    }

    const payload = {
      name: form.name.trim(),
      couponCode,
      discountValue,
      minimumCartValue,
      expiryDate: form.expiryDate,
    };

    setSaving(true);

    try {
      if (editing) {
        await couponApi.updateCoupon(
          editing._id,
          payload
        );

        onShowToast?.(
          'تم تحديث الكوبون بنجاح'
        );
      } else {
        await couponApi.createCoupon(
          payload
        );

        onShowToast?.(
          'تم إضافة الكوبون بنجاح'
        );
      }

      closeModal();
      await loadCoupons();
    } catch (error) {
      onShowToast?.(
        error.message ||
          'حدث خطأ أثناء حفظ الكوبون'
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (coupon) => {
    const nextStatus = !coupon.isActive;

    setBusyCouponId(coupon._id);
    setCoupons((currentCoupons) =>
      currentCoupons.map((currentCoupon) =>
        currentCoupon._id === coupon._id
          ? {
              ...currentCoupon,
              isActive: nextStatus,
            }
          : currentCoupon
      )
    );

    try {
      const updatedCoupon =
        await couponApi.updateCouponStatus(
          coupon._id,
          nextStatus
        );

      const serverCoupon =
        updatedCoupon || {
          ...coupon,
          isActive: nextStatus,
        };

      setCoupons((currentCoupons) =>
        currentCoupons.map((currentCoupon) =>
          currentCoupon._id === coupon._id
            ? {
                ...currentCoupon,
                ...serverCoupon,
              }
            : currentCoupon
        )
      );

      onShowToast?.(
        nextStatus
          ? 'تم تفعيل الكوبون'
          : 'تم تعطيل الكوبون'
      );
    } catch (error) {
      setCoupons((currentCoupons) =>
        currentCoupons.map((currentCoupon) =>
          currentCoupon._id === coupon._id
            ? {
                ...currentCoupon,
                isActive: coupon.isActive,
              }
            : currentCoupon
        )
      );

      onShowToast?.(
        error.message ||
          'تعذر تغيير حالة الكوبون'
      );
    } finally {
      setBusyCouponId(null);
    }
  };

  const handleDelete = async (coupon) => {
    const shouldDelete = window.confirm(
      `هل تريدين حذف الكوبون ${coupon.couponCode}؟`
    );

    if (!shouldDelete) {
      return;
    }

    setBusyCouponId(coupon._id);

    try {
      await couponApi.deleteCoupon(
        coupon._id
      );

      setCoupons((currentCoupons) =>
        currentCoupons.filter(
          (currentCoupon) =>
            currentCoupon._id !== coupon._id
        )
      );

      onShowToast?.(
        'تم حذف الكوبون بنجاح'
      );
    } catch (error) {
      onShowToast?.(
        error.message ||
          'تعذر حذف الكوبون'
      );
    } finally {
      setBusyCouponId(null);
    }
  };

  return (
    <AdminLayout
      active="admin-coupons"
      user={user}
      onNavigate={onNavigate}
      onLogout={logout}
      onShowToast={onShowToast}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1
          className="fw-bold text-primary mb-0"
          style={{ fontSize: '1.75rem' }}
        >
          إدارة الكوبونات
        </h1>

        <button
          className="btn btn-primary d-flex align-items-center gap-1"
          onClick={openCreateModal}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '18px' }}
          >
            add
          </span>

          <span>إضافة كوبون</span>
        </button>
      </div>

      <div className="bg-white rounded-3 border p-3 p-md-4 shadow-sm">
        {loading ? (
          <div className="text-center py-4 text-muted">
            جاري تحميل الكوبونات...
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-4 text-muted">
            لا توجد كوبونات بعد
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>الكود</th>
                  <th>الخصم</th>
                  <th>الحد الأدنى</th>
                  <th>تاريخ الانتهاء</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {coupons.map((coupon) => {
                  const isBusy =
                    busyCouponId === coupon._id;

                  return (
                    <tr key={coupon._id}>
                      <td>
                        <div className="fw-bold text-primary dir-ltr">
                          {coupon.couponCode}
                        </div>

                        <small className="text-muted">
                          {coupon.name}
                        </small>
                      </td>

                      <td>
                        <strong>
                          {coupon.discountValue} ج.م
                        </strong>
                      </td>

                      <td>
                        {coupon.minimumCartValue || 0}{' '}
                        ج.م
                      </td>

                      <td>
                        {formatDate(
                          coupon.expiryDate
                        )}
                      </td>

                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="form-check form-switch m-0">
                            <input
                              className="form-check-input cursor-pointer"
                              type="checkbox"
                              checked={Boolean(
                                coupon.isActive
                              )}
                              disabled={isBusy}
                              onChange={() =>
                                toggleActive(coupon)
                              }
                              aria-label={
                                coupon.isActive
                                  ? 'تعطيل الكوبون'
                                  : 'تفعيل الكوبون'
                              }
                            />
                          </div>

                          <span
                            className={`badge ${
                              coupon.isActive
                                ? 'text-bg-success'
                                : 'text-bg-secondary'
                            }`}
                          >
                            {coupon.isActive
                              ? 'Active'
                              : 'Inactive'}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() =>
                              openEditModal(coupon)
                            }
                            disabled={isBusy}
                          >
                            تعديل
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              handleDelete(coupon)
                            }
                            disabled={isBusy}
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          className="modal show d-block"
          style={{
            backgroundColor:
              'rgba(0, 0, 0, 0.5)',
            zIndex: 1060,
          }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold text-primary">
                  {editing
                    ? 'تعديل الكوبون'
                    : 'إضافة كوبون جديد'}
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  disabled={saving}
                />
              </div>

              <div className="modal-body p-4">
                <form onSubmit={handleSave}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">
                      اسم الكوبون
                    </label>

                    <input
                      className="form-control"
                      value={form.name}
                      onChange={(event) =>
                        updateFormField(
                          'name',
                          event.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">
                      كود الكوبون
                    </label>

                    <input
                      className="form-control text-uppercase"
                      value={form.couponCode}
                      onChange={(event) =>
                        updateFormField(
                          'couponCode',
                          event.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">
                        قيمة الخصم
                      </label>

                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        value={form.discountValue}
                        onChange={(event) =>
                          updateFormField(
                            'discountValue',
                            event.target.value
                          )
                        }
                        required
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold">
                        الحد الأدنى
                      </label>

                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={
                          form.minimumCartValue
                        }
                        onChange={(event) =>
                          updateFormField(
                            'minimumCartValue',
                            event.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">
                      تاريخ الانتهاء
                    </label>

                    <input
                      type="date"
                      className="form-control"
                      value={form.expiryDate}
                      onChange={(event) =>
                        updateFormField(
                          'expiryDate',
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div className="mt-3 d-flex gap-2">
                    <button
                      type="submit"
                      className="btn-sorur-admin"
                      disabled={saving}
                    >
                      {saving
                        ? 'جاري الحفظ...'
                        : editing
                          ? 'حفظ التعديلات'
                          : 'إضافة الكوبون'}
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={closeModal}
                      disabled={saving}
                    >
                      إلغاء
                    </button>
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
