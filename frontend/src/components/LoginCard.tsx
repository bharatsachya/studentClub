import { useForm } from 'react-hook-form';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL || 'localhost:3000';

interface LoginCardProps {
  onClose: () => void;
}

interface LoginFormInputs {
  email: string;
  password: string;
}

function LoginCard({ onClose }: LoginCardProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const onSubmit = async (data: LoginFormInputs) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`http://${BACKEND_API_URL}/api/v1/user/login`, {
        email: data.email,
        password: data.password
      });

      console.log('Login successful:', response.data);
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      
      // Redirect to landing page
      navigate('/landing');
      onClose();
      
    } catch (error: any) {
      console.error('Login failed:', error);
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-md text-center relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-xl"
        >
          ✖
        </button>

        <h3 className="text-2xl font-bold text-violet-700 mb-4">Join StudentConnect</h3>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form className="space-y-4 text-left" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
              type="email"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="you@college.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              {...register("password", { 
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters"
                }
              })}
              type="password"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-violet-700 text-white py-2 rounded-md hover:bg-violet-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Join Now'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => {
                onClose();
                navigate('/register');
              }}
              className="text-violet-600 hover:text-violet-700 underline"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginCard;
