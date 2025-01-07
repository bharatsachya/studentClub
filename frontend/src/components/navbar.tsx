import { useState } from "react";

function Navbar() {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(!isClicked);
  };

  return (
    <>
      {/* Navbar Section */}
    <div className="flex items-center justify-between p-2 bg-white shadow-md fixed ">
      <div className="text-purple-900 font-bold md:text-2xl sm:text-md">StudentConnect</div>
    <div className="flex items-center justify-end mx-2">
        <button
          onClick={handleClick}
          className="hover:bg-emerald-200 p-0.5 rounded-xl"
        >
         <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M2 1h12a1 1 0 011 1v12a1 1 0 01-1 1H2a1 1 0 01-1-1V2a1 1 0 011-1zm12-1a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V2a2 2 0 012-2h12z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M5 15V1H4v14h1zm8-11.5a.5.5 0 00-.5-.5h-5a.5.5 0 000 1h5a.5.5 0 00.5-.5zm0 3a.5.5 0 00-.5-.5h-5a.5.5 0 000 1h5a.5.5 0 00.5-.5zm0 3a.5.5 0 00-.5-.5h-5a.5.5 0 000 1h5a.5.5 0 00.5-.5zm0 3a.5.5 0 00-.5-.5h-5a.5.5 0 000 1h5a.5.5 0 00.5-.5z" clip-rule="evenodd"></path></svg>
        </button>
      </div>

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
              <a href="#guide">User Guide</a>
            </li>
            <li>
              <a href="#about" className="text-gray-700 hover:text-emerald-500">
                About
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
            <li>
              <a
                href="#services"
                className="text-gray-700 hover:text-emerald-500"
              >
                club registration
              </a>
            </li>
            <li>
              <a
                href="#services"
                className="text-gray-700 hover:text-emerald-500"
              >
                Club members Login
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
