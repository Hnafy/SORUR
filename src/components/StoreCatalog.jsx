import React, { useState, useEffect, useCallback, useMemo } from 'react';
import productApi from '../services/productApi';
import ProductCard from './ProductCard';

const PAGE_SIZE = 12;

export default function StoreCatalog({
  onSelectProduct,
  onAddToCart,
  wishlist,
  onToggleWishlist,
  initialCategory = 'all',
}) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('featured');
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Locally-controlled search input. Keeps the field responsive and avoids
  // being controlled by a parent on every keystroke.
  const [localSearch, setLocalSearch] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const handleSearchChange = useCallback((value) => {
    setLocalSearch(value);
  }, []);

  // Debounce the local input before it reaches the fetch effect.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(localSearch.trim()), 400);
    return () => clearTimeout(t);
  }, [localSearch]);

  // Stable, memoized params object to avoid needless effect re-runs.
  const fetchParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      query: debouncedQuery,
      category: selectedCategory === 'all' ? '' : selectedCategory,
    }),
    [page, debouncedQuery, selectedCategory]
  );

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, selectedCategory, sortBy]);

  // Load categories once
  useEffect(() => {
    let active = true;
    productApi
      .fetchCategories()
      .then((cats) => {
        if (active) setCategories(cats || []);
      })
      .catch(() => {
        if (active) setCategories([]);
      });
    return () => {
      active = false;
    };
  }, []);

  // Load products when page/filters change
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    productApi
      .fetchProducts(fetchParams)
      .then((result) => {
        if (!active) return;
        let list = result.products || [];
        if (sortBy === 'price-low') list = [...list].sort((a, b) => a.price - b.price);
        if (sortBy === 'price-high') list = [...list].sort((a, b) => b.price - a.price);
        if (sortBy === 'rating') list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        setProducts(list);
        setTotalProducts(result.totalProducts);
        setTotalPages(Math.max(result.totalPages || 1, 1));
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'تعذر تحميل المنتجات');
        setProducts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchParams, sortBy, refreshKey]);

  const handleCategoryChange = useCallback((cat) => {
    setSelectedCategory(cat);
  }, []);

  const handlePageChange = useCallback((nextPage) => {
    setPage((p) => Math.min(Math.max(1, nextPage), totalPages));
  }, [totalPages]);

  const resetFilters = useCallback(() => {
    setSelectedCategory('all');
    setSortBy('featured');
    setLocalSearch('');
    setDebouncedQuery('');
    setPage(1);
  }, []);

  return (
    <div className="container-xl py-4 py-md-5">
      {/* Header & Title */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="fw-bold mb-1" style={{ fontSize: '2rem', color: 'var(--color-primary)' }}>
            تشكيلة متجر سرور
          </h1>
          <p className="text-muted small mb-0">
            تصفح أرقى التصميمات اليدوية والقطع الحصرية بالجنيه المصري (ج.م)
          </p>
        </div>

        {/* Search input */}
        <div className="d-flex align-items-center gap-2">
          <div className="input-group" style={{ maxWidth: '280px' }}>
            <span className="input-group-text bg-white border-end-0 text-muted">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder="ابحث عن منتج..."
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {localSearch && (
              <button
                className="btn btn-outline-secondary border-start-0"
                onClick={() => handleSearchChange('')}
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
        <button
          className={`btn btn-sm rounded-pill px-3 text-nowrap fw-semibold ${
            selectedCategory === 'all'
              ? 'btn-dark bg-primary border-primary text-white shadow-sm'
              : 'btn-outline-secondary bg-white text-muted'
          }`}
          onClick={() => handleCategoryChange('all')}
        >
          الكل
        </button>
        {categories.map((cat) => {
          const id = cat._id || cat.id;
          return (
            <button
              key={id}
              className={`btn btn-sm rounded-pill px-3 text-nowrap fw-semibold ${
                selectedCategory === id
                  ? 'btn-dark bg-primary border-primary text-white shadow-sm'
                  : 'btn-outline-secondary bg-white text-muted'
              }`}
              onClick={() => handleCategoryChange(id)}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Results Count */}
      <div className="d-flex justify-content-between align-items-center mb-4 text-muted small">
        <span>
          عرض {products.length} من أصل {totalProducts} منتج
        </span>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3 g-md-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div className="col" key={i}>
              <div className="product-card">
                <div className="product-img-wrapper bg-light d-flex align-items-center justify-content-center" style={{ minHeight: '220px' }}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">جاري التحميل...</span>
                  </div>
                </div>
                <div className="product-info">
                  <div className="placeholder-glow">
                    <span className="placeholder col-6"></span>
                    <span className="placeholder col-10"></span>
                    <span className="placeholder col-4"></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="text-center py-5 bg-white rounded-3 border">
          <span className="material-symbols-outlined text-danger mb-2" style={{ fontSize: '48px' }}>
            cloud_off
          </span>
          <h4 className="fw-bold text-muted mb-2">تعذر تحميل المنتجات</h4>
          <p className="text-muted small mb-3">{error}</p>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => setRefreshKey((k) => k + 1)}
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-5 bg-white rounded-3 border">
          <span className="material-symbols-outlined text-muted mb-2" style={{ fontSize: '48px' }}>
            search_off
          </span>
          <h4 className="fw-bold text-muted mb-2">لا توجد منتجات مطابقة للبحث</h4>
          <p className="text-muted small mb-3">جرب تغيير معايير البحث أو اختيار قسم آخر</p>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={resetFilters}
          >
            إعادة تعيين الفلاتر
          </button>
        </div>
      )}

      {/* Product Grid */}
      {!loading && !error && products.length > 0 && (
        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3 g-md-4">
          {products.map((prod) => (
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

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <nav className="d-flex justify-content-center mt-5" aria-label="صفحات المنتجات">
          <ul className="pagination">
            <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(page - 1)}
              >
                السابق
              </button>
            </li>
            {Array.from({ length: totalPages }).map((_, i) => (
              <li
                key={i}
                className={`page-item ${i + 1 === page ? 'active' : ''}`}
              >
                <button className="page-link" onClick={() => handlePageChange(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(page + 1)}
              >
                التالي
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
