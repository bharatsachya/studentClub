import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-violet-700 text-white py-8 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* About Section */}
        <div>
          <h3 className="font-bold text-lg mb-2">StudentConnect</h3>
          <p className="text-sm">
            Bringing students together through clubs, resources, and community.
          </p>
        </div>

        {/* Navigation Links */}
        <div>
          <h4 className="font-semibold text-md mb-2">Quick Links</h4>
          <ul className="space-y-1 text-sm">
            <li>
              <Link to="/guide" className="hover:underline">
                User Guide
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:underline">
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:underline">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:underline">
                Club Registration
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:underline">
                Members Login
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact & Social */}
        <div>
          <h4 className="font-semibold text-md mb-2">Get In Touch</h4>
          <p className="text-sm">
            <strong>Email:</strong>{' '}
            <a href="mailto:support@studentconnect.com" className="hover:underline">
              lovanshugarg22703@gmail.com
            </a>
          </p>
          <p className="text-sm mt-2">
            <strong>Follow Us:</strong>
          </p>
          <div className="flex space-x-4 mt-1">
            <Link to="/#" className="hover:text-emerald-300">
              Instagram
            </Link>
            <Link to="/#" className="hover:text-emerald-300">
              Twitter
            </Link>
            <Link to="/#" className="hover:text-emerald-300">
              Facebook
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-violet-600 pt-4 text-center text-xs opacity-80">
        &copy; {new Date().getFullYear()} StudentConnect. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
