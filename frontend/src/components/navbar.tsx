import { Link } from "react-router-dom";

function Navbar({onJoinClick}: {onJoinClick: () => void}) {
  return (
    <div className="relative">
      {/* Floating Navbar */}
      <nav className="absolute top-4 left-1/2 transform -translate-x-1/2 w-[90%] md:w-4/5 bg-white/70 backdrop-blur-md shadow-xl rounded-2xl px-6 py-4 flex justify-between items-center z-10">
        {/* Brand */}
        <div className="text-violet-700 font-extrabold text-xl md:text-2xl tracking-tight">
          <Link to="/">StudentConnect</Link>
        </div>

        {/* Navigation Links */}
        <ul className="hidden md:flex space-x-6 text-violet-800 font-medium text-sm">
          <li>
            <Link to="/about" className="hover:text-violet-500 transition">
              About
            </Link>
          </li>
          <li>
            <Link to="/contact" className="hover:text-violet-500 transition">
              Contact
            </Link>
          </li>
          <li>
            <Link to="/register" className="hover:text-violet-500 transition">
              Club Registration
            </Link>
          </li>
          <li>
            <Link to="/login" className="hover:text-violet-500 transition">
              Members Login
            </Link>
          </li>
        </ul>

        {/* Join Button */}
        <div>
            <button className="bg-violet-700 text-white px-4 py-2 rounded-xl hover:bg-violet-600 transition text-sm font-semibold" onClick={onJoinClick}>
              Join Now
            </button>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
