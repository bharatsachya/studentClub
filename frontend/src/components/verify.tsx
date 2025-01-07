import React, { useState } from 'react';
import { z } from 'zod';

const ChooseOption: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<'email' | 'file' | null>(null);
  const [email, setEmail] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [normalEmail,setNormalEmail] = useState<string>('');
  // List of allowed domains
  const allowedDomains = ['.edu', '@jcboseymcaust.ac.in', '@test.org'];
  console.log(normalEmail);
  // Zod schema for email validation
  const emailSchema = z.string().email().refine((val) =>
    allowedDomains.some((domain) => val.endsWith(domain)), {
    message: `Please put valid emails`,
  });

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(''); // Clear the error when the user types
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {  
    setNormalEmail(e.target.value);
    setError(''); // Clear the error when the user types
  }

  const handleSubmit = () => {
    if (selectedOption === 'email') {
      try {
        emailSchema.parse(email); // Validate email using Zod
        alert(`Email submitted: ${email}`);
      } catch (error) {
        if (error instanceof z.ZodError) {
          setError(error.errors[0].message); // Display the validation error
        }
      }
    } else if (selectedOption === 'file') {
      if (file) {
        alert(`File submitted: ${file.name}`);
      } else {
        alert('Please upload a file.');
      }
    } else {
      alert('Please complete your choice!');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-purple-700">
      <div className="w-full max-w-md p-6 bg-purple-100 shadow-lg rounded-lg">
        <h1 className="text-2xl font-extrabold text-center mb-6">
          Student Verfication
        </h1>

        {/* Options Section */}
        {!selectedOption ? (
          <div className="flex flex-col space-y-4">
            <button
              onClick={() => setSelectedOption('email')}
              className="w-full py-3 px-6 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition-all"
            >
              Submit College ID
            </button>
            <div className='text-center font-bold'>Or</div>
            <button
              onClick={() => setSelectedOption('file')}
              className="w-full py-3 px-6 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition-all"
            >
              Upload ID Card
            </button>
          </div>
        ) : (
          <div>
            {selectedOption === 'email' && (
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Enter Your Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                />
                {error && (
                  <p className="mt-2 text-sm text-red-500">
                    {error}
                  </p>
                )}
              </div>
            )}
            {selectedOption === 'file' && (
              <div className="mb-6">
                 <label htmlFor="file" className="block text-sm font-medium mb-2">
                  Enter your email
                </label>
                <input
                  type="email"
                  id="file"
                  placeholder='abc@gmail.com'
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded-lg file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-500 file:text-white file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <label htmlFor="file" className="block text-sm font-medium mb-2">
                  Upload a File
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded-lg file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-500 file:text-white file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                {file && (
                  <p className="mt-2 text-sm text-purple-700">
                    Selected File: <strong>{file.name}</strong>
                  </p>
                )}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={() => setSelectedOption(null)}
                className="w-full py-2 px-4 bg-gray-300 hover:bg-gray-400 text-purple-700 font-medium rounded-lg transition-all"
              >
                Go Back
              </button>
              <button
                onClick={handleSubmit}
                className="w-full py-2 px-4 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-all"
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChooseOption;
