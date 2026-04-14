import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiSave } from 'react-icons/fi';
import { updateProfile } from '../../slices/authSlice';
import Spinner from '../../components/common/Spinner';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((s) => s.auth);

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || '',
    },
    currentPassword: '',
    password: '',
    confirmPassword: '',
  });
  const [passError, setPassError] = useState('');

  const set = (f) => (e) => setForm((prev) => ({ ...prev, [f]: e.target.value }));
  const setAddr = (f) => (e) => setForm((prev) => ({ ...prev, address: { ...prev.address, [f]: e.target.value } }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setPassError('');
    if (form.password && form.password !== form.confirmPassword) return setPassError('Passwords do not match');
    const data = { name: form.name, email: form.email, phone: form.phone, address: form.address };
    if (form.password) { data.password = form.password; data.currentPassword = form.currentPassword; }
    dispatch(updateProfile(data));
  };

  return (
    <div className="container-custom py-8 max-w-3xl animate-fade-in">
      <h1 className="section-title mb-6">Profile Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Avatar card */}
        <div className="md:col-span-1">
          <div className="card p-5 text-center">
            <img src={user?.avatar?.url} alt={user?.name} className="w-20 h-20 rounded-full object-cover mx-auto mb-3 ring-4 ring-primary-500/20" />
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{user?.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
            <span className="badge mt-2 capitalize bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">{user?.role}</span>
          </div>
        </div>

        {/* Form */}
        <div className="md:col-span-3">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Personal Info */}
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><FiUser size={15} className="text-primary-500" /> Personal Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Full Name</label>
                  <input value={form.name} onChange={set('name')} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Email</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input type="email" value={form.email} onChange={set('email')} className="input-field pl-9" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Phone</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input value={form.phone} onChange={set('phone')} className="input-field pl-9" placeholder="+1 555 000 0000" />
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><FiMapPin size={15} className="text-primary-500" /> Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Street</label>
                  <input value={form.address.street} onChange={setAddr('street')} className="input-field" placeholder="123 Main St" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">City</label>
                  <input value={form.address.city} onChange={setAddr('city')} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">State</label>
                  <input value={form.address.state} onChange={setAddr('state')} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">ZIP Code</label>
                  <input value={form.address.zipCode} onChange={setAddr('zipCode')} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Country</label>
                  <input value={form.address.country} onChange={setAddr('country')} className="input-field" />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><FiLock size={15} className="text-primary-500" /> Change Password <span className="text-xs font-normal text-gray-400">(optional)</span></h2>
              {passError && <p className="text-red-500 text-sm mb-3">{passError}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Current</label>
                  <input type="password" value={form.currentPassword} onChange={set('currentPassword')} className="input-field" placeholder="••••••" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">New Password</label>
                  <input type="password" value={form.password} onChange={set('password')} className="input-field" placeholder="••••••" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Confirm</label>
                  <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} className="input-field" placeholder="••••••" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? <Spinner size="sm" color="white" /> : <><FiSave size={16} /> Save Changes</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
