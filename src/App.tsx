import React, { useState } from 'react';
import { 
  Home, 
  LayoutDashboard, 
  FileText, 
  Image, 
  MessageSquareQuote, 
  LogOut, 
  User, 
  Menu, 
  X
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import './App.css';

import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Blogs from './components/Blogs';
import FooterLogo from './components/FooterLogo';
import HeaderLogo from './components/HeaderLogo';
import Gallery from './components/Gallery';
import Testimonials from './components/Testimonials';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
  };

  const getPageTitle = (page: string) => {
    switch (page) {
      case 'dashboard':
        return 'Dashboard';
      case 'blogs':
        return 'Blog Management';
      case 'footerLogo':
        return 'Footer Logo';
      case 'headerLogo':
        return 'Header Logo';
      case 'gallery':
        return 'Gallery';
      case 'testimonials':
        return 'Testimonials';
      default:
        return 'Dashboard';
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard onNavigate={setActivePage} />;
      case 'blogs':
        return <Blogs />;
      case 'footerLogo':
        return <FooterLogo />;
      case 'headerLogo':
        return <HeaderLogo />;
      case 'gallery':
        return <Gallery />;
      case 'testimonials':
        return <Testimonials />;
      default:
        return <Dashboard onNavigate={setActivePage} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-right" />
        <LandingPage onLogin={handleLogin} />
      </>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="flex h-screen bg-black text-white">
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Menu Button */}
        <div className="fixed top-4 left-4 z-50 md:hidden">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-3 rounded-lg bg-gray-900 text-neon-green hover:bg-gray-800 transition-all shadow-lg"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div 
          className={`fixed md:static w-72 h-full bg-gray-900 transition-all duration-300 ease-in-out z-40 ${
            mobileMenuOpen ? 'left-0' : '-left-72 md:left-0'
          }`}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-neon-green">MediCare</h1>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors md:hidden"
              >
                <X size={20} />
              </button>
            </div>
            <nav>
              <ul className="space-y-2">
                <NavItem 
                  icon={<Home size={20} />} 
                  title="Home" 
                  active={activePage === 'dashboard'} 
                  onClick={() => {
                    setActivePage('dashboard');
                    setMobileMenuOpen(false);
                  }}
                />
                <NavItem 
                  icon={<LayoutDashboard size={20} />} 
                  title="Dashboard" 
                  active={activePage === 'dashboard'} 
                  onClick={() => {
                    setActivePage('dashboard');
                    setMobileMenuOpen(false);
                  }}
                />
                <NavItem 
                  icon={<FileText size={20} />} 
                  title="Blogs" 
                  active={activePage === 'blogs'} 
                  onClick={() => {
                    setActivePage('blogs');
                    setMobileMenuOpen(false);
                  }}
                />
                <NavItem 
                  icon={<Image size={20} />} 
                  title="Footer Logo" 
                  active={activePage === 'footerLogo'} 
                  onClick={() => {
                    setActivePage('footerLogo');
                    setMobileMenuOpen(false);
                  }}
                />
                <NavItem 
                  icon={<Image size={20} />} 
                  title="Header Logo" 
                  active={activePage === 'headerLogo'} 
                  onClick={() => {
                    setActivePage('headerLogo');
                    setMobileMenuOpen(false);
                  }}
                />
                <NavItem 
                  icon={<Image size={20} />} 
                  title="Gallery" 
                  active={activePage === 'gallery'} 
                  onClick={() => {
                    setActivePage('gallery');
                    setMobileMenuOpen(false);
                  }}
                />
                <NavItem 
                  icon={<MessageSquareQuote size={20} />} 
                  title="Testimonials" 
                  active={activePage === 'testimonials'} 
                  onClick={() => {
                    setActivePage('testimonials');
                    setMobileMenuOpen(false);
                  }}
                />
              </ul>
            </nav>
          </div>
          <div className="absolute bottom-0 w-full p-6">
            <button 
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-3 w-full p-3 rounded-lg text-gray-400 hover:text-neon-green hover:bg-gray-800 transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <header className="bg-gray-900 p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center">
              {/* Add spacing for mobile menu button */}
              <div className="w-12 md:w-0"></div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white truncate">
                {getPageTitle(activePage)}
              </h2>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neon-green flex items-center justify-center text-black">
                  <User size={18} className="sm:w-5 sm:h-5" />
                </div>
                <span className="hidden sm:inline text-sm lg:text-base">Admin User</span>
              </div>
            </div>
          </header>
          <main className="p-4 sm:p-6">
            {renderPage()}
          </main>
        </div>
      </div>
    </>
  );
}

// Navigation Item Component
const NavItem = ({ icon, title, active, onClick }) => {
  return (
    <li>
      <button
        onClick={onClick}
        className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-all ${
          active 
            ? 'bg-black text-neon-green shadow-glow' 
            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        }`}
      >
        <div className="flex-shrink-0">{icon}</div>
        <span className="truncate">{title}</span>
        {active && <div className="ml-auto w-1 h-6 bg-neon-green rounded-full flex-shrink-0"></div>}
      </button>
    </li>
  );
};

export default App;