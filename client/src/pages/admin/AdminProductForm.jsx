import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiUpload, FiX, FiArrowLeft, FiImage } from 'react-icons/fi';
import { createProduct, updateProduct, fetchProductById } from '../../slices/productSlice';
import { PageLoader } from '../../components/common/Spinner';
import Spinner from '../../components/common/Spinner';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Beauty', 'Toys', 'Food', 'Other'];

const AdminProductForm = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product, loading } = useSelector((s) => s.products);
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '', description: '', price: '', discountPrice: '',
    category: 'Electronics', brand: '', stock: '', featured: false,
    imageUrl: '', // for URL-based image input
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      dispatch(fetchProductById(id));
    }
  }, [id, isEdit, dispatch]);

  useEffect(() => {
    if (isEdit && product && product._id === id) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        discountPrice: product.discountPrice || '',
        category: product.category || 'Electronics',
        brand: product.brand || '',
        stock: product.stock || '',
        featured: product.featured || false,
        imageUrl: '',
      });
      setPreviews(product.images?.map((img) => img.url) || []);
    }
  }, [product, isEdit, id]);

  const set = (f) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [f]: val }));
  };

  const handleImageFiles = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviews((prev) => [...prev, ev.target.result]);
      reader.readAsDataURL(f);
    });
  };

  const removePreview = (idx) => {
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category || !form.stock) {
      return;
    }

    setSaving(true);
    try {
      // Build FormData for file uploads OR send JSON with image URLs
      if (images.length > 0) {
        const formData = new FormData();
        Object.entries(form).forEach(([k, v]) => {
          if (k !== 'imageUrl') formData.append(k, v);
        });
        images.forEach((img) => formData.append('images', img));

        if (isEdit) {
          await dispatch(updateProduct({ id, formData }));
        } else {
          await dispatch(createProduct(formData));
        }
      } else {
        // Send as JSON with imageUrl
        const payload = { ...form };
        delete payload.imageUrl;
        if (form.imageUrl) payload.images = [form.imageUrl];

        const formData = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== undefined && v !== '') formData.append(k, v);
        });

        if (isEdit) {
          await dispatch(updateProduct({ id, formData }));
        } else {
          await dispatch(createProduct(formData));
        }
      }
      navigate('/admin/products');
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && loading && !product) return <PageLoader />;

  return (
    <div className="animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/products')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-surface text-gray-500 transition-colors">
          <FiArrowLeft size={18} />
        </button>
        <div>
          <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {isEdit ? 'Update product details' : 'Fill in the details below'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Product Name *</label>
              <input
                value={form.name}
                onChange={set('name')}
                required
                className="input-field"
                placeholder="e.g. Apple iPhone 15 Pro"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Description *</label>
              <textarea
                value={form.description}
                onChange={set('description')}
                required
                rows={4}
                className="input-field resize-none"
                placeholder="Describe the product in detail..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Category *</label>
              <select value={form.category} onChange={set('category')} className="input-field">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Brand</label>
              <input value={form.brand} onChange={set('brand')} className="input-field" placeholder="e.g. Apple" />
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Pricing & Inventory</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Price (USD) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                <input
                  type="number"
                  value={form.price}
                  onChange={set('price')}
                  required
                  min="0"
                  step="0.01"
                  className="input-field pl-7"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Discount Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                <input
                  type="number"
                  value={form.discountPrice}
                  onChange={set('discountPrice')}
                  min="0"
                  step="0.01"
                  className="input-field pl-7"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Stock Quantity *</label>
              <input
                type="number"
                value={form.stock}
                onChange={set('stock')}
                required
                min="0"
                className="input-field"
                placeholder="0"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={set('featured')}
                className="w-4 h-4 accent-primary-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured Product</span>
                <p className="text-xs text-gray-400">Show on homepage featured section</p>
              </div>
            </label>
          </div>
        </div>

        {/* Images */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Product Images</h3>

          {/* Image URL input (for demo without Cloudinary) */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Image URL</label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={set('imageUrl')}
              className="input-field text-sm"
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-gray-400 mt-1">Enter an image URL or upload files below</p>
          </div>

          {/* File upload */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Upload Images</label>
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 dark:border-dark-border rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors">
              <FiUpload size={20} className="text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Click to upload images</span>
              <span className="text-xs text-gray-400 mt-0.5">PNG, JPG, WebP up to 5MB each</span>
              <input type="file" multiple accept="image/*" onChange={handleImageFiles} className="hidden" />
            </label>
          </div>

          {/* Previews */}
          {previews.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {previews.map((src, i) => (
                <div key={i} className="relative group">
                  <img src={src} alt={`Preview ${i}`} className="w-20 h-20 object-cover rounded-xl bg-gray-100 dark:bg-dark-bg" onError={(e) => { e.target.src = 'https://via.placeholder.com/80'; }} />
                  <button
                    type="button"
                    onClick={() => removePreview(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiX size={10} />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 text-xs bg-black/60 text-white rounded px-1">Main</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="btn-secondary flex-1 py-3"
          >
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary flex-1 py-3">
            {saving ? <Spinner size="sm" color="white" /> : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
