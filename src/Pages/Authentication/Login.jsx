import React, { useState } from 'react';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import loginAnim from '../../assets/login2.json';
import axios from 'axios';
import { BACKEND_URL } from '../../lib/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/login`, formData);
      localStorage.setItem('chat_user', JSON.stringify(res.data.user));
      navigate('/messenger');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      <div className="w-full md:w-1/2 h-[30vh] md:h-screen relative bg-gray-900">
        <Lottie
          animationData={loginAnim}
          loop={false}
          className="absolute inset-0 w-3/4 h-full mx-auto object-cover"></Lottie>
      </div>

      <div className="w-full md:w-1/2 min-h-[100vh] md:h-screen relative">

        <div className="relative z-10 flex flex-col items-center justify-center min-h-[70vh] md:h-screen p-8">
          <div className="w-full max-w-xl space-y-8">
            <div className="text-center"
              onClick={() => navigate('/')}
            >
              <img
                src="https://i.ibb.co.com/sp5JLnkF/Whats-App-Image-2025-02-22-at-9-25-22-AM-3.png"
                alt="Logo"
                className="mx-auto mb-16 w-3/4"
              />
            </div>

            <form onSubmit={handleSubmit} className="backdrop-blur-sm bg-white/10 p-10 mb-10 rounded-lg border border-gray-200 shadow-lg">
              <h2 className="text-3xl font-bold text-[#B28D28] mb-10 text-center">Login</h2>

              {error && <p className="text-red-500 text-center mb-4">{error}</p>}

              <div className="form-control w-full mb-6">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="input input-bordered border-[#B28D2866]/40 w-full pl-10 bg-white/20  text-black placeholder-gray-500"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                </div>
              </div>

              <div className="form-control w-full mb-6">
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="input input-bordered w-full pl-10 bg-white/20 border-[#B28D2866]/40 text-black placeholder-gray-500"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                </div>
              </div>

              <div className='flex mx-auto justify-end mb-10'>
                <Link
                  to="/verify"
                  className='text-[#8F5E0A] font-semibold cursor-pointer hover:underline text-end pt-2'>Forgot Password?</Link>
              </div>

              <button disabled={loading} className='w-full bg-[#B28D28] p-2 rounded-full text-white text-base font-semibold cursor-pointer'>
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <p className="text-center  text-gray-900 mt-2">
                Don't have an account?
                <Link to="/sign_up" className="text-[#8F5E0A] font-semibold ml-1 hover:underline">Sign Up</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
