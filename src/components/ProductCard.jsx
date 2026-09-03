import React from 'react';

export default function ProductCard({
  product,
  onSelectProduct,
  onAddToCart,
  isWishlisted,
  onToggleWishlist
}) {
  const { id, name, category, price, originalPrice, badge, image, description, stock } = product;
  const categoryName = typeof category === 'string' ? category : category?.name;
  const truncatedDescription = description
    ? description.length > 80
      ? `${description.slice(0, 80)}...`
      : description
    : '';
  const inStock = Number(stock) > 0;

  return (
    <div className="product-card" onClick={() => onSelectProduct(id)}>
      {/* Image & Badges Container */}
      <div className="product-img-wrapper">
        {badge && <span className="product-badge">{badge}</span>}

        {/* Wishlist Button */}
        <button
          className={`btn-wishlist ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(id);
          }}
          title="إضافة للمفضلة"
          aria-label="المفضلة"
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: '20px',
              fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0"
            }}
          >
            favorite
          </span>
        </button>

        <img src={image} alt={name} className="product-img" loading="lazy" />

        {/* Quick Add Overlay */}
        <div className="product-overlay-action">
          <button
            className="btn-quick-add"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_shopping_cart</span>
            أضف للسلة
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="product-info">
        <span className="product-category">{categoryName || 'غير مصنف'}</span>
        <h4 className="product-name" title={name}>{name}</h4>

        {truncatedDescription && (
          <p className="product-desc text-muted small mb-2" style={{ fontSize: '0.78rem', lineHeight: 1.5 }}>
            {truncatedDescription}
          </p>
        )}

        <div className="d-flex align-items-center gap-2 mb-2">
          {inStock ? (
            <span className="badge rounded-pill" style={{ backgroundColor: 'rgba(25,135,84,0.12)', color: '#198754', fontSize: '0.7rem' }}>
              متاح ({stock})
            </span>
          ) : (
            <span className="badge rounded-pill" style={{ backgroundColor: 'rgba(220,53,69,0.12)', color: '#dc3545', fontSize: '0.7rem' }}>
              غير متاح
            </span>
          )}
        </div>

        <div className="product-price-row">
          <div>
            <span className="product-price">{price} ج.م</span>
            {originalPrice && (
              <span className="product-old-price">{originalPrice} ج.م</span>
            )}
          </div>
          <span className="text-muted small d-none d-sm-inline">
            <span className="material-symbols-outlined text-warning" style={{ fontSize: '16px', verticalAlign: 'text-bottom' }}>star</span>
            {product.rating || 4.8}
          </span>
        </div>
      </div>
    </div>
  );
}
