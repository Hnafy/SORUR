import React, { useState } from 'react';
import { AVAILABLE_COUPONS } from '../data/mockData';

export default function CartCheckout({ 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onClearCart,
  onNavigate,
  onShowToast,
  onOrderPlaced
}) {
  const [formData, setFormData] = useState({
    firstName: 'محمد',
    lastName: 'عبدالله',
    address: 'شارع التحرير، الدقي',
    city: 'الجيزة',
    phone: '01012345678',
    paymentMethod: 'card'
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [orderCompleteData, setOrderCompleteData] = useState(null);

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingFee = subtotal > 0 ? 35 : 0;
  const tax = subtotal > 0 ? Math.round(subtotal * 0.14) : 0; // 14% Egyptian VAT
  
  let discountAmount = 0;
  if (appliedCoupon && subtotal > 0) {
    discountAmount = Math.round((subtotal * appliedCoupon.discountPercent) / 100);
  }

  const total = Math.max(0, subtotal + shippingFee + tax - discountAmount);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      onShowToast?.('يرجى كتابة كود الخصم أولاً');
      return;
    }
    if (AVAILABLE_COUPONS[code]) {
      setAppliedCoupon({ code, ...AVAILABLE_COUPONS[code] });
      onShowToast?.(`تم تطبيق كود الخصم (${code}) بنجاح!`);
    } else {
      onShowToast?.('كود الخصم غير صالح أو منتهي الصلاحية (جرب: SORUR15 أو WELCOME10)');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      onShowToast?.('سلة التسوق فارغة!');
      return;
    }
    if (!formData.firstName || !formData.address || !formData.phone) {
      onShowToast?.('يرجى ملء جميع بيانات الشحن المطلوبة');
      return;
    }

    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: `${formData.firstName} ${formData.lastName}`.trim(),
      date: new Intl.DateTimeFormat('ar-EG', { dateStyle: 'long' }).format(new Date()),
      total: total,
      status: 'قيد التنفيذ',
      statusClass: 'status-pending',
      items: cartItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      city: formData.city,
      address: formData.address,
      phone: formData.phone,
      paymentMethod: formData.paymentMethod === 'card' ? 'بطاقة ائتمانية / ميزة' : 'الدفع عند الاستلام'
    };

    onOrderPlaced?.(newOrder);
    setOrderCompleteData(newOrder);
    onClearCart?.();
  };

  if (orderCompleteData) {
    return (
      <div className="cart-checkout-view py-5">
        <div className="container-xl">
          <div className="bg-white rounded-4 border p-4 p-md-5 text-center max-w-lg mx-auto shadow-sm" style={{ maxWidth: '600px' }}>
            <div className="w-16 h-16 rounded-circle bg-success bg-opacity-10 text-success d-inline-flex align-items-center justify-content-center mb-3">
              <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>check_circle</span>
            </div>
            <h2 className="fw-bold text-primary mb-2">تم تأكيد طلبك بنجاح!</h2>
            <p className="text-muted mb-4">
              رقم الطلب الخاص بك: <span className="fw-bold text-dark dir-ltr">#{orderCompleteData.id}</span>
            </p>

            <div className="bg-light rounded-3 p-3 text-end mb-4 small">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">العميل:</span>
                <span className="fw-bold">{orderCompleteData.customerName}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">عنوان التوصيل:</span>
                <span className="fw-bold">{orderCompleteData.address} - {orderCompleteData.city}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">طريقة الدفع:</span>
                <span className="fw-bold">{orderCompleteData.paymentMethod}</span>
              </div>
              <div className="d-flex justify-content-between border-top pt-2 mt-2">
                <span className="fw-bold text-primary">المبلغ الإجمالي:</span>
                <span className="fw-bold text-warning fs-6">{orderCompleteData.total} ج.م</span>
              </div>
            </div>

            <div className="d-flex gap-3 justify-content-center">
              <button 
                className="btn-sorur-primary"
                onClick={() => {
                  setOrderCompleteData(null);
                  onNavigate('shop');
                }}
              >
                متابعة التسوق
              </button>
              <button 
                className="btn-sorur-secondary"
                onClick={() => {
                  setOrderCompleteData(null);
                  onNavigate('admin');
                }}
              >
                مشاهدة في لوحة الإدارة
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-checkout-view">
      <div className="container-xl">
        <h1 className="fw-bold text-primary mb-4 pb-2 border-bottom" style={{ fontSize: '1.85rem' }}>
          سلة التسوق وإتمام الطلب
        </h1>

        <div className="row g-4 g-lg-5 align-items-start">
          
          {/* Main Column (Cart items + Shipping form) */}
          <div className="col-12 col-lg-8">
            
            {/* Cart Items Section */}
            <div className="bg-white rounded-3 border p-3 p-md-4 mb-4 shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="fw-bold text-dark mb-0" style={{ fontSize: '1.25rem' }}>محتويات السلة</h3>
                {cartItems.length > 0 && (
                  <button 
                    className="text-danger small border-0 bg-transparent"
                    onClick={onClearCart}
                  >
                    تفريغ السلة
                  </button>
                )}
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-5">
                  <span className="material-symbols-outlined text-muted mb-2" style={{ fontSize: '54px' }}>
                    shopping_bag
                  </span>
                  <h4 className="fw-bold text-muted mb-3">سلة التسوق فارغة حالياً</h4>
                  <button className="btn-sorur-primary" onClick={() => onNavigate('shop')}>
                    استعرض المنتجات وتسوق الآن
                  </button>
                </div>
              ) : (
                <div className="d-flex flex-column">
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.color}`} className="cart-item-card">
                      <img src={item.image} alt={item.name} className="cart-item-img" />
                      
                      <div className="flex-grow-1">
                        <h4 className="fw-bold text-primary mb-1" style={{ fontSize: '1.05rem' }}>{item.name}</h4>
                        {item.color && (
                          <p className="text-muted small mb-0">اللون: {item.color}</p>
                        )}
                        <span className="text-warning fw-bold d-md-none mt-1 d-block">{item.price} ج.م</span>
                      </div>

                      {/* Quantity Modifier */}
                      <div className="d-flex align-items-center gap-3">
                        <div className="qty-control-group">
                          <button 
                            className="qty-btn"
                            onClick={() => onUpdateQuantity(item.id, item.color, item.quantity - 1)}
                            title="تقليل"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>remove</span>
                          </button>
                          <span className="qty-display" style={{ width: '36px' }}>{item.quantity}</span>
                          <button 
                            className="qty-btn"
                            onClick={() => onUpdateQuantity(item.id, item.color, item.quantity + 1)}
                            title="زيادة"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                          </button>
                        </div>

                        <span className="fw-bold text-secondary fs-5 d-none d-md-inline text-nowrap">
                          {item.price * item.quantity} ج.م
                        </span>

                        <button 
                          className="btn-wishlist border-0 shadow-none text-danger position-static"
                          onClick={() => onRemoveItem(item.id, item.color)}
                          title="حذف المنتج"
                        >
                          <span className="material-symbols-outlined">delete_outline</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shipping & Payment Form */}
            <div className="bg-white rounded-3 border p-3 p-md-4 shadow-sm">
              <h3 className="fw-bold text-dark mb-4" style={{ fontSize: '1.25rem' }}>بيانات الشحن والدفع</h3>
              
              <form onSubmit={handleCheckout}>
                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold text-muted">الاسم الأول</label>
                    <input 
                      type="text" 
                      name="firstName" 
                      className="form-control" 
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="محمد"
                      required
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold text-muted">الاسم الأخير</label>
                    <input 
                      type="text" 
                      name="lastName" 
                      className="form-control" 
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="عبدالله"
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">العنوان التفصيلي</label>
                  <input 
                    type="text" 
                    name="address" 
                    className="form-control" 
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="رقم العمارة، اسم الشارع، الحي"
                    required
                  />
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold text-muted">المحافظة / المدينة</label>
                    <select 
                      name="city" 
                      className="form-select" 
                      value={formData.city}
                      onChange={handleInputChange}
                    >
                      <option value="القاهرة">القاهرة</option>
                      <option value="الجيزة">الجيزة</option>
                      <option value="الإسكندرية">الإسكندرية</option>
                      <option value="المنصورة">المنصورة</option>
                      <option value="طنطا">طنطا</option>
                      <option value="بورسعيد">بورسعيد</option>
                      <option value="السويس">السويس</option>
                      <option value="أسيوط">أسيوط</option>
                      <option value="الغردقة">الغردقة</option>
                      <option value="شرم الشيخ">شرم الشيخ</option>
                      <option value="الأقصر">الأقصر</option>
                      <option value="أسوان">أسوان</option>
                    </select>
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold text-muted">رقم الجوال</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      className="form-control text-start" 
                      dir="ltr"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="01x xxx xxxx"
                      required
                    />
                  </div>
                </div>

                <hr className="my-4 opacity-25" />

                {/* Payment Method */}
                <h4 className="fw-bold text-dark mb-3" style={{ fontSize: '1.1rem' }}>طريقة الدفع</h4>
                <div className="d-flex flex-column gap-3 mb-4">
                  <label className={`payment-radio-card ${formData.paymentMethod === 'card' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleInputChange}
                      className="form-check-input mt-0"
                    />
                    <span className="flex-grow-1 fw-semibold text-dark">البطاقة الائتمانية (ميزة / فيزا / ماستركارد)</span>
                    <span className="material-symbols-outlined text-primary">credit_card</span>
                  </label>

                  <label className={`payment-radio-card ${formData.paymentMethod === 'cod' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                      className="form-check-input mt-0"
                    />
                    <span className="flex-grow-1 fw-semibold text-dark">الدفع نقداً عند الاستلام</span>
                    <span className="material-symbols-outlined text-primary">payments</span>
                  </label>
                </div>
              </form>
            </div>

          </div>

          {/* Sidebar / Order Summary Column */}
          <div className="col-12 col-lg-4">
            <div className="order-summary-card">
              <h3 className="fw-bold text-dark mb-3" style={{ fontSize: '1.25rem' }}>ملخص الطلب</h3>

              <div className="d-flex flex-column gap-2 mb-3 pb-3 border-bottom text-muted small">
                <div className="d-flex justify-content-between">
                  <span>المجموع الفرعي</span>
                  <span className="fw-semibold text-dark">{subtotal} ج.م</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>تكلفة الشحن (مصر)</span>
                  <span className="fw-semibold text-dark">{shippingFee} ج.م</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>ضريبة القيمة المضافة (14%)</span>
                  <span className="fw-semibold text-dark">{tax} ج.م</span>
                </div>
                {appliedCoupon && (
                  <div className="d-flex justify-content-between text-success fw-semibold">
                    <span>خصم الكوبون ({appliedCoupon.code})</span>
                    <span>-{discountAmount} ج.م</span>
                  </div>
                )}
              </div>

              {/* Coupon Code Input */}
              <div className="mb-4">
                <div className="input-group">
                  <input 
                    type="text" 
                    className="form-control text-uppercase" 
                    placeholder="كود الخصم (مثال: SORUR15)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button 
                    className="btn btn-outline-secondary px-3"
                    type="button"
                    onClick={handleApplyCoupon}
                  >
                    تطبيق
                  </button>
                </div>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>كوبونات نشطة: SORUR15, WELCOME10, EGYPT20</span>
              </div>

              {/* Grand Total */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <span className="fw-bold text-dark fs-5">الإجمالي النهائي</span>
                <span className="fw-bold text-secondary fs-4">{total} ج.م</span>
              </div>

              {/* Submit Checkout Button */}
              <button 
                type="button"
                className="btn-sorur-primary w-100 py-3 mb-3 fw-bold"
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
              >
                <span>إتمام الطلب بأمان</span>
                <span className="material-symbols-outlined">lock</span>
              </button>

              <div className="text-center text-muted small d-flex align-items-center justify-content-center gap-1">
                <span className="material-symbols-outlined text-success" style={{ fontSize: '18px' }}>verified_user</span>
                <span>معاملتك مشفرة ومؤمنة بالكامل</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
