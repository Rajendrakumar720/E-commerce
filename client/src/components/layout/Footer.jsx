import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => (
  <footer className="bg-gray-900 dark:bg-black text-gray-300 mt-16">
    <div className="container-custom py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-display font-bold text-xl text-white">
              Shop<span className="text-primary-500">Wave</span>
            </span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            Your premium destination for quality products. Shop smarter, live better.
          </p>
          <div className="flex items-center gap-3">
            {[FiInstagram, FiTwitter, FiFacebook, FiYoutube].map((Icon, i) => (
              <a key={i} href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-colors">
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            {[['Home', '/'], ['Products', '/products'], ['About Us', '#'], ['Contact', '#'], ['Blog', '#']].map(([label, to]) => (
              <li key={label}>
                <Link to={to} className="hover:text-primary-400 transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h3 className="font-semibold text-white mb-4">Categories</h3>
          <ul className="space-y-2 text-sm">
            {['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports'].map((cat) => (
              <li key={cat}>
                <Link to={`/products?category=${cat}`} className="hover:text-primary-400 transition-colors">{cat}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold text-white mb-4">Contact Us</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2"><FiMapPin size={14} className="text-primary-400 shrink-0" /> 123 Commerce St, San Francisco, CA</li>
            <li className="flex items-center gap-2"><FiPhone size={14} className="text-primary-400 shrink-0" /> +1 (555) 123-4567</li>
            <li className="flex items-center gap-2"><FiMail size={14} className="text-primary-400 shrink-0" /> support@shopwave.com</li>
          </ul>
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">Subscribe to our newsletter</p>
            <div className="flex gap-2">
              <input type="email" placeholder="your@email.com" className="flex-1 px-3 py-2 bg-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
              <button className="px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm transition-colors">Go</button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
        <p>© 2025 ShopWave. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-gray-300">Privacy Policy</a>
          <a href="#" className="hover:text-gray-300">Terms of Service</a>
          <a href="#" className="hover:text-gray-300">Cookie Policy</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
