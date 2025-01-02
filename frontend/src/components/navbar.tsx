import { useState } from "react";
import { NavLink } from "react-router-dom";
function Navbar() {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(!isClicked);
  };

  return (
    <>
      {/* Navbar Section */}
      <div className="flex items-center justify-end p-1 mx-2">
        <button
          onClick={handleClick}
          className="hover:bg-emerald-200 p-0.5 rounded-xl"
        >
          <img
            src={`public/${isClicked ? "close" : "menu"}.png`}
            alt="sidebar"
            height={25}
            width={30}
          />
        </button>
      </div>

      {/* Sidebar Section */}
      <div
        className={`fixed top-0 right-0 w-64 h-full bg-white shadow-lg z-50 transform ${
          isClicked ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <button
          onClick={handleClick}
          className="absolute top-4 left-4  text-gray-700 hover:bg-gray-200 rounded-full"
        >
          ✖
        </button>
        <br />
        <div className="p-5">
          <ul className="space-y-4">
            <li>
                <NavLink to='/Guide' className="text-gray-700 hover:text-emerald-500">
                  User Guide
                </NavLink>
            </li>
            <li>
              <a href="#about" className="text-gray-700 hover:text-emerald-500">
                About
              </a>
            </li>
            <li>
              <a
                href="#services"
                className="text-gray-700 hover:text-emerald-500"
              >
                Services
              </a>
            </li>
            <li>
              <a
                href="#contact"
                className="text-gray-700 hover:text-emerald-500"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default Navbar;
