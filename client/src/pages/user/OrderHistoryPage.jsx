import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiPackage, FiArrowRight } from 'react-icons/fi';
import { fetchMyOrders } from '../../slices/orderSlice';
import { PageLoader } from '../../components/common/Spinner';

const STATUS_COLORS = {
  Processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Shipped: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Out for Delivery': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const OrderHistoryPage = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchMyOrders()); }, [dispatch]);

  if (loading) return <PageLoader />;

  return (
    <div className="container-custom py-8 animate-fade-in">
      <h1 className="section-title mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <FiPackage size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No orders yet</h2>
          <Link to="/products" className="btn-primary inline-flex mt-4">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs text-gray-400 font-mono">#{order._id?.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                    {order.orderStatus}
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">${order.totalPrice?.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                {order.orderItems?.slice(0, 4).map((item, i) => (
                  <img key={i} src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100 dark:bg-dark-bg" />
                ))}
                {order.orderItems?.length > 4 && (
                  <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-dark-bg flex items-center justify-center text-xs font-medium text-gray-500">
                    +{order.orderItems.length - 4}
                  </div>
                )}
                <span className="text-sm text-gray-500 ml-1">{order.orderItems?.length} item{order.orderItems?.length !== 1 ? 's' : ''}</span>
              </div>

              <Link to={`/orders/${order._id}`} className="text-primary-500 text-sm font-medium flex items-center gap-1 hover:text-primary-600">
                View Details <FiArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
