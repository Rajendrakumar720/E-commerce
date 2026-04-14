import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { addToCart } from '../../slices/cartSlice';
import StarRating from '../common/StarRating';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.stock === 0) return toast.error('Out of stock');
    dispatch(addToCart({
      product: product._id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.images?.[0]?.url,
      stock: product.stock,
    }));
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to add to wishlist');
    try {
      await api.post(`/users/wishlist/${product._id}`);
      toast.success('Wishlist updated!');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <Link to={`/products/${product._id}`} className="product-card block">
      {/* Image */}
      <div className="relative overflow-hidden aspect-square bg-gray-100 dark:bg-dark-bg">
        <img
          src={product.images?.[0]?.url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=No+Image'; }}
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.stock === 0 && (
            <span className="badge bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">Out of Stock</span>
          )}
          {discount > 0 && (
            <span className="badge bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">-{discount}%</span>
          )}
          {product.featured && (
            <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">Featured</span>
          )}
        </div>

        {/* Hover actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <button
            onClick={handleWishlist}
            className="w-8 h-8 bg-white dark:bg-dark-surface rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
          >
            <FiHeart size={14} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 font-medium uppercase tracking-wide">{product.category}</p>
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-2 leading-snug">
          {product.name}
        </h3>

        <StarRating rating={product.ratings} numReviews={product.numReviews} />

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              ${(product.discountPrice || product.price).toFixed(2)}
            </span>
            {discount > 0 && (
              <span className="text-sm text-gray-400 line-through">${product.price.toFixed(2)}</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="p-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FiShoppingCart size={16} />
          </button>
        </div>

        {product.stock > 0 && product.stock <= 5 && (
          <p className="text-xs text-amber-500 mt-2 font-medium">Only {product.stock} left!</p>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
