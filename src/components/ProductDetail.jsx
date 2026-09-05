import React, { useState, useEffect } from 'react';
import productApi from '../services/productApi';
import ProductCard from './ProductCard';

export default function ProductDetail({
  productId,
  onSelectProduct,
  onAddToCart,
  onNavigate,
  isWishlisted,
  onToggleWishlist,
}) {
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setActiveImageIndex(0);
    setQuantity(1);

    if (!productId) {
      setLoading(false);
      setError('معرّف المنتج غير صالح');
      return () => { active = false; };
    }

    Promise.all([
      productApi.fetchProductById(productId),
      productApi.fetchProducts({ page: 1, limit: 8 }).catch(() => ({ products: [] })),
    ])
      .then(([detail, list]) => {
        if (!active) return;
        if (!detail) {
          setError('المنتج غير موجود');
        } else {
          setProduct(detail);
          setSelectedColor('Default');
          setRelated((list.products || []).filter((p) => p.id !== detail.id).slice(0, 4));
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'تعذر تحميل تفاصيل المنتج');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="container-xl py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">جاري التحميل...</span>
          </div>
          <div className="text-muted">جاري تحميل المنتج...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-xl py-5">
        <div className="text-center py-5 bg-white rounded-3 border">
          <span className="material-symbols-outlined text-danger mb-2" style={{ fontSize: '48px' }}>
            error
          </span>
          <h4 className="fw-bold text-muted mb-2">تعذر عرض المنتج</h4>
          <p className="text-muted small mb-3">{error}</p>
          <button className="btn btn-outline-primary btn-sm" onClick={() => onNavigate?.('shop')}>
            العودة للمتجر
          </button>
        </div>
      </div>
    );
  }

  const galleryImages = (product.gallery && product.gallery.length > 0)
    ? product.gallery
    : [product.image];
  const inStock = Number(product.stock) > 0;

  const handleIncrement = () => {
    if (quantity < (product.stock || 10)) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCartClick = () => {
    onAddToCart(product, quantity, selectedColor);
  };

  return (
    <div className="product-detail-view">
      <div className="container-xl">

        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="custom-breadcrumb">
          <button className="border-0 bg-transparent p-0 text-muted" onClick={() => onNavigate('home')}>
            الرئيسية
          </button>
          <span className="material-symbols-outlined text-muted" style={{ fontSize: '16px' }}>chevron_left</span>
          <button className="border-0 bg-transparent p-0 text-muted" onClick={() => onNavigate('shop')}>
            المتجر
          </button>
          <span className="material-symbols-outlined text-muted" style={{ fontSize: '16px' }}>chevron_left</span>
          <span className="current">{product.name}</span>
        </nav>

        {/* Main Product Layout */}
        <div className="row g-4 g-lg-5 mb-5 align-items-start">

          {/* Gallery Column */}
          <div className="col-12 col-lg-7">
            <div className="d-flex flex-column flex-md-row gap-3">

              {/* Thumbnails */}
              <div className="gallery-thumbs order-2 order-md-1 d-flex flex-row flex-md-column overflow-auto pb-2 pb-md-0" style={{ minWidth: '85px' }}>
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    className={`thumb-btn ${activeImageIndex === idx ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                    title={`عرض صورة ${idx + 1}`}
                  >
                    <img src={img} alt={`${product.name} - ${idx + 1}`} />
                  </button>
                ))}
              </div>

              {/* Main Active Image */}
              <div className="main-gallery-card order-1 order-md-2 flex-grow-1">
                <img
                  src={galleryImages[activeImageIndex] || product.image}
                  alt={product.name}
                  className="w-100 h-100 object-fit-cover"
                />
                <button
                  className={`btn-wishlist ${isWishlisted ? 'active' : ''}`}
                  onClick={() => onToggleWishlist(product.id)}
                  style={{ top: '16px', left: '16px', width: '42px', height: '42px' }}
                  title="إضافة للمفضلة"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: '24px',
                      fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0"
                    }}
                  >
                    favorite
                  </span>
                </button>
              </div>

            </div>
          </div>

          {/* Product Info Column */}
          <div className="col-12 col-lg-5">
            <div className="d-flex flex-column h-100">

              {/* Badge & Category */}
              <div className="mb-2 d-flex flex-wrap gap-2 align-items-center">
                <span className="badge rounded-pill" style={{ backgroundColor: 'var(--color-surface-high)', color: 'var(--color-on-surface-variant)', fontSize: '0.8rem' }}>
                  {product.category?.name || 'غير مصنف'}
                </span>
                {inStock ? (
                  <span className="badge rounded-pill" style={{ backgroundColor: 'rgba(25,135,84,0.12)', color: '#198754' }}>
                    متاح ({product.stock})
                  </span>
                ) : (
                  <span className="badge rounded-pill" style={{ backgroundColor: 'rgba(220,53,69,0.12)', color: '#dc3545' }}>
                    غير متاح
                  </span>
                )}
              </div>

              <h1 className="product-detail-title">{product.name}</h1>

              {/* Rating */}
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="d-flex text-warning">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
                <span className="text-muted small">({product.rating || 4.8})</span>
              </div>

              {/* Price */}
              <div className="detail-price-tag mb-4">
                <span>{product.price} ج.م</span>
                {product.originalPrice && (
                  <span className="text-muted text-decoration-line-through fw-normal" style={{ fontSize: '1.1rem' }}>
                    {product.originalPrice} ج.م
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-secondary-emphasis mb-4" style={{ lineHeight: '1.8', fontSize: '1rem' }}>
                {product.description}
              </p>

              <hr className="my-3 opacity-25" />

              {/* Quantity Stepper & Stock */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="fw-semibold text-primary small">الكمية:</label>
                  {inStock && (
                    <span className="text-danger small fw-semibold">
                      متبقي {product.stock} قطع فقط
                    </span>
                  )}
                </div>
                <div className="qty-control-group">
                  <button className="qty-btn" onClick={handleDecrement} title="تقليل الكمية">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>remove</span>
                  </button>
                  <span className="qty-display">{quantity}</span>
                  <button className="qty-btn" onClick={handleIncrement} title="زيادة الكمية">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="d-flex flex-column gap-3 mt-auto pt-2">
                <button
                  className="btn-sorur-primary w-100 py-3"
                  onClick={handleAddToCartClick}
                  style={{ fontSize: '1.1rem' }}
                >
                  <span className="material-symbols-outlined">shopping_bag</span>
                  أضف إلى السلة ({product.price * quantity} ج.م)
                </button>

                {/* Trust Badges */}
                <div className="d-flex justify-content-center align-items-center gap-4 text-muted small mt-2">
                  <div className="d-flex align-items-center gap-1">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>local_shipping</span>
                    <span>شحن سريع لجميع محافظات مصر</span>
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>verified</span>
                    <span>ضمان الجودة والأصالة</span>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* Related Products Grid */}
        {related.length > 0 && (
          <section className="pt-5 border-top border-light-subtle">
            <h2 className="text-center fw-bold text-primary mb-4" style={{ fontSize: '1.8rem' }}>
              منتجات قد تعجبك
            </h2>
            <div className="row row-cols-2 row-cols-md-4 g-3 g-md-4">
              {related.map((rel) => (
                <div className="col" key={rel.id}>
                  <ProductCard
                    product={rel}
                    onSelectProduct={onSelectProduct}
                    onAddToCart={onAddToCart}
                    isWishlisted={false}
                    onToggleWishlist={onToggleWishlist}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
