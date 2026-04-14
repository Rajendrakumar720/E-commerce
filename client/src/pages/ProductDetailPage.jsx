import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiShoppingCart, FiHeart, FiShare2, FiChevronRight,
  FiMinus, FiPlus, FiPackage, FiTruck, FiShield,
} from 'react-icons/fi';
import { fetchProductById, createReview } from '../slices/productSlice';
import { addToCart } from '../slices/cartSlice';
import { PageLoader } from '../components/common/Spinner';
import StarRating from '../components/common/StarRating';
import api from '../services/api';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { product, loading } = useSelector((s) => s.products);
  const { user } = useSelector((s) => s.auth);

  const [qty, setQty] = useState(1);
  const [mainImg, setMainImg] = useState(0);
  const [tab, setTab] = useState('description');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchProductById(id));
    setMainImg(0);
    setQty(1);
  }, [id, dispatch]);

  if (loading || !product) return <PageLoader />;

  const effectivePrice = product.discountPrice || product.price;
  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    if (product.stock === 0) return toast.error('Out of stock');
    for (let i = 0; i < qty; i++) {
      dispatch(addToCart({
        product: product._id,
        name: product.name,
        price: effectivePrice,
        image: product.images?.[0]?.url,
        stock: product.stock,
      }));
    }
  };

  const handleWishlist = async () => {
    if (!user) return toast.error('Please login');
    try {
      await api.post(`/users/wishlist/${product._id}`);
      toast.success('Wishlist updated!');
    } catch { toast.error('Failed'); }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to review');
    if (!reviewForm.comment.trim()) return toast.error('Please write a comment');
    setSubmitting(true);
    try {
      await dispatch(createReview({ id: product._id, reviewData: reviewForm }));
      dispatch(fetchProductById(id));
      setReviewForm({ rating: 5, comment: '' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-custom py-8 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-500">Home</Link>
        <FiChevronRight size={14} />
        <Link to="/products" className="hover:text-primary-500">Products</Link>
        <FiChevronRight size={14} />
        <Link to={`/products?category=${product.category}`} className="hover:text-primary-500">{product.category}</Link>
        <FiChevronRight size={14} />
        <span className="text-gray-900 dark:text-white truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-dark-surface mb-3">
            <img
              src={product.images?.[mainImg]?.url}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/600'; }}
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setMainImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                    mainImg === i ? 'border-primary-500' : 'border-gray-200 dark:border-dark-border'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
              {product.category}
            </span>
            <button onClick={handleWishlist} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface text-gray-500 hover:text-red-500 transition-colors">
              <FiHeart size={18} />
            </button>
          </div>

          <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={product.ratings} numReviews={product.numReviews} size="md" />
            <span className="text-sm text-gray-500">|</span>
            <span className="text-sm text-gray-500">{product.brand}</span>
          </div>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">${effectivePrice.toFixed(2)}</span>
            {discount > 0 && (
              <>
                <span className="text-xl text-gray-400 line-through">${product.price.toFixed(2)}</span>
                <span className="badge bg-green-100 text-green-700">Save {discount}%</span>
              </>
            )}
          </div>

          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 text-sm">
            {product.description.substring(0, 200)}{product.description.length > 200 && '...'}
          </p>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-5">
            <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </span>
          </div>

          {/* Quantity + Cart */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center border border-gray-200 dark:border-dark-border rounded-xl">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 hover:bg-gray-50 dark:hover:bg-dark-bg rounded-l-xl transition-colors">
                  <FiMinus size={14} />
                </button>
                <span className="w-12 text-center font-semibold text-sm">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="p-3 hover:bg-gray-50 dark:hover:bg-dark-bg rounded-r-xl transition-colors">
                  <FiPlus size={14} />
                </button>
              </div>
              <button onClick={handleAddToCart} className="flex-1 btn-primary py-3">
                <FiShoppingCart size={16} /> Add to Cart
              </button>
            </div>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-dark-surface rounded-xl">
            {[
              { icon: FiTruck, text: 'Free Shipping on $50+' },
              { icon: FiShield, text: 'Secure Checkout' },
              { icon: FiPackage, text: '30-Day Returns' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-1 text-center">
                <Icon size={16} className="text-primary-500" />
                <span className="text-xs text-gray-500 leading-tight">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-gray-100 dark:border-dark-border">
          {['description', 'reviews'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-4 font-medium text-sm capitalize transition-colors ${
                tab === t
                  ? 'border-b-2 border-primary-500 text-primary-500'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {t} {t === 'reviews' && `(${product.numReviews})`}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'description' ? (
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">{product.description}</p>
          ) : (
            <div>
              {/* Review form */}
              {user ? (
                <form onSubmit={handleReviewSubmit} className="mb-8 p-4 bg-gray-50 dark:bg-dark-bg rounded-xl">
                  <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Write a Review</h3>
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your Rating</p>
                    <StarRating rating={reviewForm.rating} size="lg" interactive onRate={(r) => setReviewForm((f) => ({ ...f, rating: r }))} />
                  </div>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                    placeholder="Share your experience..."
                    rows={3}
                    className="input-field text-sm resize-none mb-3"
                  />
                  <button type="submit" disabled={submitting} className="btn-primary text-sm py-2">
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <p className="text-sm text-gray-500 mb-6">
                  <Link to="/login" className="text-primary-500 font-medium">Login</Link> to write a review.
                </p>
              )}

              {/* Reviews list */}
              {product.reviews?.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No reviews yet. Be the first!</p>
              ) : (
                <div className="space-y-4">
                  {product.reviews.map((r) => (
                    <div key={r._id} className="border-b border-gray-100 dark:border-dark-border pb-4 last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold text-sm">
                          {r.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{r.name}</p>
                          <StarRating rating={r.rating} size="sm" />
                        </div>
                        <span className="ml-auto text-xs text-gray-400">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 ml-11">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
