import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiCreditCard, FiTruck, FiCheck } from 'react-icons/fi';
import { createOrder } from '../../slices/orderSlice';
import { clearCart, saveShippingAddress, savePaymentMethod, selectCartTotal } from '../../slices/cartSlice';
import Spinner from '../../components/common/Spinner';

const STEPS = ['Shipping', 'Payment', 'Review'];

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, shippingAddress, paymentMethod } = useSelector((s) => s.cart);
  const { loading } = useSelector((s) => s.orders);
  const { user } = useSelector((s) => s.auth);
  const subtotal = useSelector(selectCartTotal);
  const shipping = subtotal >= 50 ? 0 : 9.99;
  const tax = +(subtotal * 0.1).toFixed(2);
  const total = +(subtotal + shipping + tax).toFixed(2);

  const [step, setStep] = useState(0);
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    address: shippingAddress?.address || '',
    city: shippingAddress?.city || '',
    state: shippingAddress?.state || '',
    zipCode: shippingAddress?.zipCode || '',
    country: shippingAddress?.country || '',
    phone: user?.phone || '',
  });
  const [payment, setPayment] = useState(paymentMethod || 'stripe');

  const setA = (f) => (e) => setAddress((a) => ({ ...a, [f]: e.target.value }));

  const handleShippingNext = (e) => {
    e.preventDefault();
    dispatch(saveShippingAddress(address));
    setStep(1);
  };

  const handlePaymentNext = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(payment));
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    const orderItems = items.map((i) => ({
      product: i.product, name: i.name, image: i.image, price: i.price, quantity: i.quantity,
    }));
    const result = await dispatch(createOrder({
      orderItems,
      shippingAddress: address,
      paymentMethod: payment,
      itemsPrice: subtotal,
      shippingPrice: shipping,
      taxPrice: tax,
      totalPrice: total,
    }));
    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(clearCart());
      navigate(`/order-success/${result.payload._id}`);
    }
  };

  return (
    <div className="container-custom py-8 max-w-4xl animate-fade-in">
      <h1 className="section-title mb-6">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                step === i ? 'text-primary-500' : i < step ? 'text-green-500 cursor-pointer' : 'text-gray-400'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step === i ? 'bg-primary-500 text-white' : i < step ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-dark-surface text-gray-400'
              }`}>
                {i < step ? <FiCheck size={14} /> : i + 1}
              </div>
              <span className="hidden sm:block">{s}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-green-500' : 'bg-gray-200 dark:bg-dark-border'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Step 0: Shipping */}
          {step === 0 && (
            <div className="card p-6">
              <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <FiTruck className="text-primary-500" /> Shipping Address
              </h2>
              <form onSubmit={handleShippingNext} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Full Name</label>
                  <input value={address.fullName} onChange={setA('fullName')} required className="input-field" placeholder="John Doe" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Street Address</label>
                  <input value={address.address} onChange={setA('address')} required className="input-field" placeholder="123 Main St" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">City</label>
                  <input value={address.city} onChange={setA('city')} required className="input-field" placeholder="New York" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">State / Province</label>
                  <input value={address.state} onChange={setA('state')} required className="input-field" placeholder="NY" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">ZIP / Postal Code</label>
                  <input value={address.zipCode} onChange={setA('zipCode')} required className="input-field" placeholder="10001" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Country</label>
                  <input value={address.country} onChange={setA('country')} required className="input-field" placeholder="United States" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Phone Number</label>
                  <input value={address.phone} onChange={setA('phone')} required className="input-field" placeholder="+1 555 000 0000" />
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" className="btn-primary w-full py-3">Continue to Payment</button>
                </div>
              </form>
            </div>
          )}

          {/* Step 1: Payment */}
          {step === 1 && (
            <div className="card p-6">
              <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <FiCreditCard className="text-primary-500" /> Payment Method
              </h2>
              <form onSubmit={handlePaymentNext} className="space-y-3">
                {[
                  { value: 'stripe', label: 'Credit / Debit Card', desc: 'Secure payment via Stripe', emoji: '💳' },
                  { value: 'razorpay', label: 'Razorpay', desc: 'UPI, Net Banking, Cards', emoji: '🏦' },
                  { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive', emoji: '💵' },
                ].map((m) => (
                  <label key={m.value} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    payment === m.value ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-dark-border'
                  }`}>
                    <input type="radio" name="payment" value={m.value} checked={payment === m.value} onChange={() => setPayment(m.value)} className="accent-primary-500" />
                    <span className="text-2xl">{m.emoji}</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{m.label}</p>
                      <p className="text-xs text-gray-500">{m.desc}</p>
                    </div>
                  </label>
                ))}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(0)} className="btn-secondary flex-1 py-3">Back</button>
                  <button type="submit" className="btn-primary flex-1 py-3">Review Order</button>
                </div>
              </form>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="card p-6">
              <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-5">Review Your Order</h2>
              <div className="space-y-3 mb-5">
                {items.map((item) => (
                  <div key={item.product} className="flex items-center gap-3 text-sm">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                      <p className="text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-xl text-sm mb-5">
                <p className="font-medium mb-1 text-gray-900 dark:text-white">Ship to:</p>
                <p className="text-gray-500">{address.fullName}, {address.address}, {address.city}, {address.state} {address.zipCode}</p>
                <p className="font-medium mt-2 mb-1 text-gray-900 dark:text-white">Payment: <span className="text-gray-500 capitalize">{payment}</span></p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">Back</button>
                <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary flex-1 py-3">
                  {loading ? <Spinner size="sm" color="white" /> : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary sidebar */}
        <div className="card p-5 h-fit sticky top-20">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Subtotal ({items.length} items)</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Shipping</span><span className={shipping === 0 ? 'text-green-500' : ''}>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span></div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
            <div className="border-t border-gray-100 dark:border-dark-border pt-2 flex justify-between font-bold text-gray-900 dark:text-white">
              <span>Total</span><span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
