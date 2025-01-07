import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Landing } from "./landing.tsx";
import Room from "./room.tsx";
import Navbar from "./navbar.tsx";

export const clubs: string[] = [
  "Vividha",
  "GeeksMan",
  "IEEE",
  "CSI",
  "SAE",
  "Society of AI",
  "Society of Web Development",
  "Society of Competitive Coding",
  "Society of Cloud Computing",
  "Society of Blockchain",
];

const Login: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [collegeId, setCollegeId] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [club, setClub] = useState<string>("");
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false);
  const localAudioTrack = null;
  const localVideoTrack = null;

  useEffect(() => {
    if (loginSuccess) {
      console.log("Login successful!");
    }
  }, [loginSuccess]);

  const handleSubmit = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    try {
      alert(
        `Submitting Name: ${name}, College ID: ${collegeId}, Year: ${year}, Club: ${club}`
      );
      await axios.post("http://localhost:3000/login", {
        name,
        collegeId,
        year,
        club,
      });
      setLoginSuccess(true);
      alert("Form submitted successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit form. Please try again.");
    }
  };

  const years: string[] = ["Freshman", "Sophomore", "Senior"];

  const onOptionHandler =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
      setter(e.target.value);
    };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-50 to-purple-100">
      {/* Navbar */}
      <Navbar />

      <div className="flex flex-col md:flex-row min-h-[90vh]">
        {/* Left Section */}
        <div className="flex items-center justify-center w-full md:w-1/2 bg-gradient-to-b from-indigo-200 to-purple-300">
          <div className="text-center px-8 py-12">
            <h2 className="text-3xl md:text-4xl font-bold text-teal-800 mb-6">
              Connect with Your College Clubs Effortlessly
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              Join your favorite clubs, participate in exciting events, and stay
              in touch with your peers!
            </p>
            <Landing />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center justify-center w-full md:w-1/2">
          {!loginSuccess ? (
            <div className="bg-white shadow-2xl rounded-lg p-8 w-full max-w-lg">
              <h1 className="text-3xl font-extrabold text-center text-purple-800 mb-8">
                Login to Access
              </h1>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-purple-700 font-medium"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={onOptionHandler(setName)}
                    className="w-full mt-2 p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="collegeId"
                    className="block text-purple-700 font-medium"
                  >
                    College ID
                  </label>
                  <input
                    id="collegeId"
                    type="text"
                    value={collegeId}
                    onChange={onOptionHandler(setCollegeId)}
                    className="w-full mt-2 p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                    placeholder="Enter your college ID"
                  />
                </div>

                <div>
                  <label
                    htmlFor="year"
                    className="block text-purple-700 font-medium"
                  >
                    Year
                  </label>
                  <select
                    id="year"
                    value={year}
                    onChange={onOptionHandler(setYear)}
                    className="w-full mt-2 p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  >
                    <option value="">Please choose one option</option>
                    {years.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="club"
                    className="block text-purple-700 font-medium"
                  >
                    Club
                  </label>
                  <select
                    id="club"
                    value={club}
                    onChange={onOptionHandler(setClub)}
                    className="w-full mt-2 p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  >
                    <option value="">Select a club</option>
                    {clubs.map((club, index) => (
                      <option key={index} value={club}>
                        {club}
                      </option>
                    ))}
                  </select>
                </div>

                <Link
                  to="/verify"
                  className="block text-sm text-green-600 font-bold hover:text-blue-700 hover:underline text-right"
                >
                  Get Your College ID Verified
                </Link>

                <button
                  type="submit"
                  className="w-full py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  Submit
                </button>
              </form>
            </div>
          ) : (
            <Room
              name={name}
              localAudioTrack={localAudioTrack}
              localVideoTrack={localVideoTrack}
            />
          )}
        </div>
      </div>

      <div
        id="guide"
        className="border-spacing-56 border-gray-600 font-bold p-6 bg-gradient-to-t from-bg-purple-300 to-bg-white text-purple-700 rounded-lg shadow-lg flex flex-col md:flex-row items-center justify-between mt-8"
      >
        <div className="text-4xl font-semibold mx-4 mb-4 md:mb-0 underline-offset-1">
          How this works?
        </div>
        <ol className="list-decimal list-inside flex flex-col gap-2 text-lg mx-4">
          <li>Login</li>
          <li>Wait for connection</li>
          <li>Start interacting with your club members</li>
        </ol>
      </div>
      <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-purple-800 mb-8">
            Contact Us
          </h2>
          <p className="text-center text-lg text-gray-700 mb-8">
            Please provide your valuable insights to improve the website and
            suggest new features.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Section: Contact Info */}
            <div className="space-y-6">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-semibold text-purple-800 mb-2">
                  Email
                </h3>
                <p className="text-gray-600">21001003074@jcboseust.ac.in</p>
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-xl font-semibold text-purple-800 mb-2">
                  Phone
                </h3>
                <p className="text-gray-600">+917425077668</p>
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-xl font-semibold text-purple-800 mb-2">
                  Address
                </h3>
                <p className="text-gray-600">JC BOSE UNIVERSITY YMCA FARIDABAD ,HARYANA</p>
              </div>
            </div>

            {/* Right Section: Feedback Form */}
            <div className="bg-white shadow-lg rounded-lg p-8">
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                {/* Email Input */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-purple-700 font-medium mb-2"
                  >
                    Your Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="w-full p-3 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Suggestion Box */}
                <div>
                  <label
                    htmlFor="suggestion"
                    className="block text-purple-700 font-medium mb-2"
                  >
                    Your Suggestions
                  </label>
                  <textarea
                    id="suggestion"
                    placeholder="Write your suggestions here..."
                    rows={5}
                    className="w-full p-3 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-purple-600 text-white font-bold rounded-md hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  Submit Feedback
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About Section */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                About Us
              </h3>
              <p className="text-gray-400">
                We connect students with college clubs to foster collaboration,
                creativity, and learning. Your feedback helps us grow and
                improve!
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="/" className="hover:underline">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/about" className="hover:underline">
                    About
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:underline">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="hover:underline">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Follow Us
              </h3>
              <ul className="flex space-x-4">
                <li>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="https://img.icons8.com/ios-filled/50/ffffff/facebook-new.png"
                      alt="Facebook"
                      className="w-6 h-6"
                    />
                  </a>
                </li>
                <li>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="https://img.icons8.com/ios-filled/50/ffffff/twitter.png"
                      alt="Twitter"
                      className="w-6 h-6"
                    />
                  </a>
                </li>
                <li>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="https://img.icons8.com/ios-filled/50/ffffff/instagram-new.png"
                      alt="Instagram"
                      className="w-6 h-6"
                    />
                  </a>
                </li>
                <li>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="https://img.icons8.com/ios-filled/50/ffffff/linkedin.png"
                      alt="LinkedIn"
                      className="w-6 h-6"
                    />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} College Clubs. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
