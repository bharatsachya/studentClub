import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Landing } from "./landing.tsx";
import Room from "./room.tsx";
import Navbar from "./navbar.tsx";

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
      alert(`Submitting Name: ${name}, College ID: ${collegeId}, Year: ${year}, Club: ${club}`);
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
  const clubs: string[] = [
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

  const onOptionHandler = (setter: React.Dispatch<React.SetStateAction<string>>) => (
    e: ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    setter(e.target.value);
  };

  return (
    <div>
      <Navbar/>
    <div className="flex min-h-screen">
      {/* Left Section */}
      <div className="flex items-center justify-center w-1/2 bg-gradient-to-b from-green-200 to-teal-300">
        <div className="text-center p-4">
          <h2 className="text-xl font-bold text-teal-800 mb-4">Platform for connecting you to your college clubs</h2>
          <Landing/>
        </div>
      </div>

      {/* Right Section */}
  {    !loginSuccess && <div className="flex items-center justify-center w-1/2 bg-gradient-to-b from-indigo-200 to-purple-300">
        <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-extrabold text-center text-purple-800 mb-6">Login to Access</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-purple-700 font-medium">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={onOptionHandler(setName)}
                className="w-full mt-1 p-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
                required
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label htmlFor="collegeId" className="block text-purple-700 font-medium">College ID</label>
              <input
                id="collegeId"
                type="text"
                value={collegeId}
                onChange={onOptionHandler(setCollegeId)}
                className="w-full mt-1 p-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
                required
                placeholder="Enter your college ID"
              />
            </div>

            <div>
              <label htmlFor="year" className="block text-purple-700 font-medium">Year</label>
              <select
                id="year"
                value={year}
                onChange={onOptionHandler(setYear)}
                className="w-full mt-1 p-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
                required
              >
                <option value="">Please choose one option</option>
                {years.map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="club" className="block text-purple-700 font-medium">Club</label>
              <select
                id="club"
                value={club}
                onChange={onOptionHandler(setClub)}
                className="w-full mt-1 p-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
                required
              >
                <option value="">Select a club</option>
                {clubs.map((club, index) => (
                  <option key={index} value={club}>{club}</option>
                ))}
              </select>
            </div>

            <Link
              to="/signup"
              className="block text-sm text-blue-600 hover:text-blue-700 hover:underline text-right"
            >
              Not registered yet?
            </Link>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-purple-600 text-white font-bold rounded-md hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              Submit
            </button>
          </form>
        </div>
      </div>}
      {loginSuccess && <Room name={name} localAudioTrack={localAudioTrack} localVideoTrack={localVideoTrack} />}
    </div>
    <div >
      user guide
    </div>
    </div>
  );
};

export default Login;
