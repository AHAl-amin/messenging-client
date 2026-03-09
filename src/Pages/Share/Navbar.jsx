import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { BsChatText } from "react-icons/bs";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('chat_user');
    return stored ? JSON.parse(stored) : null;
  });

  // location পরিবর্তন হলে user state আপডেট করবে
  useEffect(() => {
    const stored = localStorage.getItem('chat_user');
    setUser(stored ? JSON.parse(stored) : null);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('chat_user');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="bg-gradient-to-r from-[#BA927C] to-[#738F9B] py-3 px-6 shadow-md sticky top-0 z-50 shadow-black/20">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <BsChatText className='size-16 font-bold text-blue-800' />
        </div>

        <div className="md:flex items-center space-x-4">
          {user ? (
            <button
              onClick={handleLogout}
              className="text-lg bg-[#1C3988] text-white py-2 px-4 rounded-md hover:bg-[#162d6e] transition-colors"
            >
              Log out
            </button>
          ) : (
            <Link
              to="/login"
              className="text-lg bg-[#1C3988] text-white py-2 px-4 rounded-md hover:bg-[#162d6e] transition-colors"
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
