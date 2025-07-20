import {useForm} from 'react-hook-form';

interface LoginCardProps {
  onClose: () => void;
};

function LoginCard({ onClose }: LoginCardProps) {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    console.log(data);
    // Handle login logic here
    // For example, you can send a request to your backend API

    // axios.post('/api/login', data)
    //   .then(response => {
    //     console.log('Login successful:', response.data);
    //     onClose(); // Close the modal on success
    //   })
    //   .catch(error => {
    //     console.error('Login failed:', error);
    //     // Handle error (e.g., show an error message)
    //   });
    onClose(); // Close the modal after submission
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
        <form className="space-y-4 text-left" onSubmit = {handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
            {...register("email", { required: true })}
              type="email"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="you@college.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
            {...register("password", { required: true })}
              type="password"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-violet-700 text-white py-2 rounded-md hover:bg-violet-600 transition"
          >
            Join Now
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginCard;
