import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface LandingPageProps {
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      onLogin();
    }
  }, [onLogin]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('https://backend.gamanrehabcenter.com/client/login/', {
        username: loginForm.username,
        password: loginForm.password
      });

      const { access, username } = response.data;
      localStorage.setItem('accessToken', access);
      localStorage.setItem('username', username);
      toast.success('Successfully logged in!');
      onLogin();
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black to-gray-900"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-green opacity-10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-green opacity-10 rounded-full filter blur-3xl"></div>
      
      <div className="glass-card w-full max-w-md p-8 z-10">
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <Activity size={32} className="text-neon-green mr-2" />
            <h1 className="text-3xl font-bold text-white">MediCare</h1>
          </div>
        </div>
        
        <form onSubmit={handleLoginSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              className="w-full px-4 py-3 rounded-lg"
              placeholder="Enter your username"
              value={loginForm.username}
              onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="w-full px-4 py-3 rounded-lg"
              placeholder="Enter your password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className="w-full btn-neon py-3 px-4 rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LandingPage;