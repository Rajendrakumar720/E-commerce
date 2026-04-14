import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FiHeart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ProductCard from '../../components/product/ProductCard';
import { PageLoader } from '../../components/common/Spinner';

const WishlistPage = () => {
  const { user } = useSelector((s) => s.auth);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await api.get('/auth/me');
        const wishlistIds = res.data.user.wishlist;
        if (wishlistIds?.length) {
          const productPromises = wishlistIds.map((id) => api.get(`/products/${id}`));
          const results = await Promise.all(productPromises);
          setProducts(results.map((r) => r.data.product).filter(Boolean));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="container-custom py-8 animate-fade-in">
      <h1 className="section-title mb-6 flex items-center gap-3">
        <FiHeart className="text-red-500" /> My Wishlist
        <span className="text-gray-400 text-lg font-normal">({products.length} items)</span>
      </h1>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <FiHeart size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Save items you love to revisit them later.</p>
          <Link to="/products" className="btn-primary inline-flex">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
