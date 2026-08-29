import React from 'react';

export default function ProductCard({ 
  product, 
  onSelectProduct, 
  onAddToCart, 
  isWishlisted, 
  onToggleWishlist 
}) {
  const { id, name, category, price, originalPrice, badge, image } = product;

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
        <span className="product-category">{category}</span>
        <h4 className="product-name" title={name}>{name}</h4>
        
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
