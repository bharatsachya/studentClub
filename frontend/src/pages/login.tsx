import React, { useState } from "react";
import Footer from "../components/footer.tsx";
import Navbar from "../components/navbar.tsx";
import Features from "../components/features..tsx";
import Blog from "../components/blog.tsx";
import LoginCard from "../components/LoginCard.tsx";

const Login: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  return (
    <div>
      <div className="relative min-h-screen w-full overflow-hidden">
        {/* Background Image */}
        <img
          src="image1.jpg" // Replace with your image path
          alt="Background"
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        />
        <Navbar onJoinClick={() => setShowLogin(true)} />
      </div>
      <Features />
      <Blog />
      <Footer />
      {showLogin && <LoginCard onClose={() => setShowLogin(false)} />}
    </div>
  );
};

export default Login;
