import React, { useState } from 'react';
import { CATEGORIES } from '../data/mockData';
import ProductCard from './ProductCard';

export default function StoreCatalog({ 
  products, 
  onSelectProduct, 
  onAddToCart,
  wishlist,
  onToggleWishlist,
  initialCategory = 'الكل',
  searchQuery = '',
  onSearchChange
}) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('featured'); // featured, price-low, price-high, rating
  const [priceMax, setPriceMax] = useState(500);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'الكل' || product.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPrice = product.price <= priceMax;
    return matchesCategory && matchesSearch && matchesPrice;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0; // default order
  });

  return (
    <div className="container-xl py-4 py-md-5">
      {/* Header & Title */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="fw-bold mb-1" style={{ fontSize: '2rem',color: "var(--color-primary) " }}>
            تشكيلة متجر سرور
          </h1>
          <p className="text-muted small mb-0">
            تصفح أرقى التصميمات اليدوية والقطع الحصرية بالجنيه المصري (ج.م)
          </p>
        </div>

        {/* Search input if active */}
        <div className="d-flex align-items-center gap-2">
          <div className="input-group" style={{ maxWidth: '280px' }}>
            <span className="input-group-text bg-white border-end-0 text-muted">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
            </span>
            <input 
              type="text" 
              className="form-control border-start-0 ps-0" 
              placeholder="ابحث عن منتج..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="btn btn-outline-secondary border-start-0"
                onClick={() => onSearchChange?.('')}
              >
                ✕
              </button>
            )}
          </div>

          <select 
            className="form-select w-auto"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ fontSize: '0.9rem' }}
          >
            <option value="featured">المقترح</option>
            <option value="price-low">السعر: من الأقل للأعلى</option>
            <option value="price-high">السعر: من الأعلى للأقل</option>
            <option value="rating">الأعلى تقييماً</option>
          </select>
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="d-flex gap-2 overflow-auto pb-3 mb-4 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`btn btn-sm rounded-pill px-3 text-nowrap fw-semibold ${
              selectedCategory === cat 
                ? 'btn-dark bg-primary border-primary text-white shadow-sm' 
                : 'btn-outline-secondary bg-white text-muted'
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results Count & Price Slider filter */}
      <div className="d-flex justify-content-between align-items-center mb-4 text-muted small">
        <span>عرض {sortedProducts.length} من أصل {products.length} منتج</span>
        <div className="d-flex align-items-center gap-2">
          <span>الحد الأقصى للسعر: {priceMax} ج.م</span>
          <input 
            type="range" 
            min="50" 
            max="500" 
            step="25"
            value={priceMax} 
            onChange={(e) => setPriceMax(Number(e.target.value))}
            style={{ width: '100px' }}
          />
        </div>
      </div>

      {/* Product Grid */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-3 border">
          <span className="material-symbols-outlined text-muted mb-2" style={{ fontSize: '48px' }}>
            search_off
          </span>
          <h4 className="fw-bold text-muted mb-2">لا توجد منتجات مطابقة للبحث</h4>
          <p className="text-muted small mb-3">جرب تغيير معايير البحث أو اختيار قسم آخر</p>
          <button 
            className="btn btn-outline-primary btn-sm"
            onClick={() => {
              setSelectedCategory('الكل');
              onSearchChange?.('');
              setPriceMax(500);
            }}
          >
            إعادة تعيين الفلاتر
          </button>
        </div>
      ) : (
        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3 g-md-4">
          {sortedProducts.map(prod => (
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
      )}
    </div>
  );
}
