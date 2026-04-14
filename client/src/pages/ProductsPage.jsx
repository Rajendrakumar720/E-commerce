import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiFilter, FiX, FiSliders } from 'react-icons/fi';
import { fetchProducts } from '../slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import Pagination from '../components/common/Pagination';
import { PageLoader } from '../components/common/Spinner';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Beauty', 'Toys', 'Food', 'Other'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const ProductsPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, page, pages, total } = useSelector((s) => s.products);

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    sort: searchParams.get('sort') || 'newest',
    page: Number(searchParams.get('page')) || 1,
  });

  const applyFilters = useCallback(() => {
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    setSearchParams(params);
    dispatch(fetchProducts(params));
  }, [filters, dispatch, setSearchParams]);

  useEffect(() => {
    applyFilters();
  }, [filters.page, filters.sort, filters.category]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, page: 1 }));
    applyFilters();
  };

  const resetFilters = () => {
    const reset = { search: '', category: '', minPrice: '', maxPrice: '', rating: '', sort: 'newest', page: 1 };
    setFilters(reset);
    setSearchParams({});
    dispatch(fetchProducts({}));
  };

  const hasActiveFilters = filters.category || filters.minPrice || filters.maxPrice || filters.rating || filters.search;

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wider">Category</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="category" checked={!filters.category} onChange={() => setFilters((f) => ({ ...f, category: '', page: 1 }))} className="accent-primary-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">All Categories</span>
          </label>
          {CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="category" checked={filters.category === cat} onChange={() => setFilters((f) => ({ ...f, category: cat, page: 1 }))} className="accent-primary-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wider">Price Range</h3>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))} className="input-field text-sm py-2" min="0" />
          <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))} className="input-field text-sm py-2" min="0" />
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wider">Min Rating</h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((r) => (
            <label key={r} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="rating" checked={Number(filters.rating) === r} onChange={() => setFilters((f) => ({ ...f, rating: r, page: 1 }))} className="accent-primary-500" />
              <span className="text-sm text-amber-400">{'★'.repeat(r)}{'☆'.repeat(5 - r)}</span>
              <span className="text-xs text-gray-500">& up</span>
            </label>
          ))}
        </div>
      </div>

      <button onClick={applyFilters} className="btn-primary w-full text-sm py-2">Apply Filters</button>
      {hasActiveFilters && (
        <button onClick={resetFilters} className="btn-secondary w-full text-sm py-2">
          <FiX size={14} /> Clear All
        </button>
      )}
    </div>
  );

  return (
    <div className="container-custom py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar - desktop */}
        <aside className="hidden md:block w-60 shrink-0">
          <div className="card p-5 sticky top-20">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FiSliders size={16} /> Filters
              </h2>
              {hasActiveFilters && (
                <button onClick={resetFilters} className="text-xs text-primary-500 hover:text-primary-600">Reset</button>
              )}
            </div>
            <FilterPanel />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h1 className="section-title text-xl">
                {filters.category || filters.search ? (filters.category || `"${filters.search}"`) : 'All Products'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{total} results found</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile filter button */}
              <button onClick={() => setShowFilters(true)} className="md:hidden btn-secondary text-sm py-2 px-3">
                <FiFilter size={14} /> Filters
              </button>
              {/* Sort */}
              <select
                value={filters.sort}
                onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value, page: 1 }))}
                className="input-field text-sm py-2 w-auto"
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-5">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              placeholder="Search products..."
              className="input-field text-sm"
            />
            <button type="submit" className="btn-primary text-sm py-2 px-5 shrink-0">Search</button>
          </form>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.category && (
                <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 gap-1">
                  {filters.category}
                  <button onClick={() => setFilters((f) => ({ ...f, category: '' }))}><FiX size={12} /></button>
                </span>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 gap-1">
                  ${filters.minPrice || 0} - ${filters.maxPrice || '∞'}
                  <button onClick={() => setFilters((f) => ({ ...f, minPrice: '', maxPrice: '' }))}><FiX size={12} /></button>
                </span>
              )}
              {filters.rating && (
                <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 gap-1">
                  {filters.rating}★+
                  <button onClick={() => setFilters((f) => ({ ...f, rating: '' }))}><FiX size={12} /></button>
                </span>
              )}
            </div>
          )}

          {/* Products grid */}
          {loading ? (
            <PageLoader />
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">No products found</p>
              <p className="text-gray-500 mt-1">Try adjusting your filters or search terms</p>
              <button onClick={resetFilters} className="btn-primary mt-4 inline-flex">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
              <Pagination page={page} pages={pages} onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))} />
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white dark:bg-dark-surface p-5 overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900 dark:text-white">Filters</h2>
              <button onClick={() => setShowFilters(false)}><FiX /></button>
            </div>
            <FilterPanel />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
