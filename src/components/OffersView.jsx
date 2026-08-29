import React from 'react';
import ProductCard from './ProductCard';

export default function OffersView({ 
  products, 
  onSelectProduct, 
  onAddToCart, 
  wishlist, 
  onToggleWishlist,
  onShowToast,
  onNavigate 
}) {
  const discountedProducts = products.filter(p => p.originalPrice && p.originalPrice > p.price);

  const copyCoupon = (code) => {
    navigator.clipboard?.writeText(code);
    onShowToast?.(`تم نسخ كود الخصم "${code}" بنجاح! استخدمه في صفحة الدفع.`);
  };

  return (
    <div className="container-xl py-4 py-md-5">
      {/* Offers Hero Header */}
      <div className="bg-warning bg-opacity-10 border border-warning border-opacity-50 rounded-4 p-4 p-md-5 mb-5 text-center text-md-end">
        <div className="row align-items-center g-4">
          <div className="col-12 col-md-8">
            <span className="badge bg-warning text-dark fw-bold px-3 py-2 mb-2">
              عروض حصرية لفترة محدودة
            </span>
            <h1 className="fw-bold text-primary mb-2" style={{ fontSize: '2.2rem' }}>
              وفر حتى 30% على تشكيلات الديكور والهدايا
            </h1>
            <p className="text-secondary-emphasis mb-4">
              جميع الأسعار بالجنيه المصري (ج.م) مع إمكانية التوصيل الفوري لجميع المحافظات.
            </p>

            <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-md-start">
              <div className="bg-white border rounded-3 p-2 px-3 d-flex align-items-center gap-3">
                <div>
                  <span className="text-muted small d-block">كود الخصم 15%:</span>
                  <span className="fw-bold text-dark font-monospace">SORUR15</span>
                </div>
                <button 
                  className="btn btn-sm btn-outline-dark"
                  onClick={() => copyCoupon('SORUR15')}
                >
                  نسخ الكود
                </button>
              </div>

              <div className="bg-white border rounded-3 p-2 px-3 d-flex align-items-center gap-3">
                <div>
                  <span className="text-muted small d-block">كود الترحيب 10%:</span>
                  <span className="fw-bold text-dark font-monospace">WELCOME10</span>
                </div>
                <button 
                  className="btn btn-sm btn-outline-dark"
                  onClick={() => copyCoupon('WELCOME10')}
                >
                  نسخ الكود
                </button>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4 text-center">
            <div className="p-4 bg-white rounded-4 shadow-sm border border-warning">
              <span className="material-symbols-outlined text-warning mb-2" style={{ fontSize: '48px' }}>
                local_mall
              </span>
              <h4 className="fw-bold text-dark mb-1">شحن مجاني</h4>
              <p className="text-muted small mb-3">للطلبات الأكثر من ٥٠٠ ج.م</p>
              <button 
                className="btn-sorur-primary w-100 py-2 btn-sm"
                onClick={() => onNavigate('shop')}
              >
                تصفح المنتجات
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Discounted Products Grid */}
      <div className="mb-4">
        <h2 className="fw-bold mb-3" style={{ fontSize: '1.6rem',color: "var(--color-primary) " }}>
          منتجات عليها تخفيضات مباشرة
        </h2>
        <p className="text-muted small mb-4">أسعار خاصة ومخفضة بالجنيه المصري (ج.م)</p>

        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3 g-md-4">
          {discountedProducts.map(prod => (
            <div className="col" key={prod.id}>
              <ProductCard 
                product={prod}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
                isWishlisted={wishlist.includes(prod.id)}
                onToggleWishlist={onToggleWishlist}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
