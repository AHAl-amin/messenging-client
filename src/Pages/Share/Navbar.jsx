import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation(); 
  const activeClass = 'text-blue-600 border-b-2 border-blue-600'; 

  return (
    <nav className="bg-gradient-to-r from-[#BA927C] to-[#738F9B] py-3 px-6 shadow-md sticky top-0 z-50 shadow-black/20">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <img src="https://i.ibb.co/20mKHM8m/logo-final-2.png" alt="Logo" className="h-18 w-auto" /> 
        </div>

        <div className="hidden md:flex space-x-8">
          <Link
            to="/"
            className={`text-lg ${location.pathname === '/' ? activeClass : 'text-gray-600'}`}
          >
            Home
          </Link>
          <div className="relative">
            <button
              className={`text-lg ${location.pathname.includes('property-types') ? activeClass : 'text-gray-600'}`}
            >
              Property Types
            </button>
            <div className="absolute top-full left-0 w-40 bg-white shadow-lg mt-2 hidden group-hover:block">
              <ul>
                <li><Link to="/property-types/residential" className="block px-4 py-2 text-gray-800">Residential</Link></li>
                <li><Link to="/property-types/commercial" className="block px-4 py-2 text-gray-800">Commercial</Link></li>
              </ul>
            </div>
          </div>
          <div className="relative">
            <button
              className={`text-lg ${location.pathname.includes('countries') ? activeClass : 'text-gray-600'}`}
            >
              Countries
            </button>
            <div className="absolute top-full left-0 w-40 bg-white shadow-lg mt-2 hidden group-hover:block">
              <ul>
                <li><Link to="/countries/usa" className="block px-4 py-2 text-gray-800">USA</Link></li>
                <li><Link to="/countries/uk" className="block px-4 py-2 text-gray-800">UK</Link></li>
              </ul>
            </div>
          </div>
          <Link
            to="/seller-plans"
            className={`text-lg ${location.pathname === '/seller-plans' ? activeClass : 'text-gray-600'}`}
          >
            Seller Plans
          </Link>
          <Link
            to="/cost-calculator"
            className={`text-lg ${location.pathname === '/cost-calculator' ? activeClass : 'text-gray-600'}`}
          >
            Cost Calculator
          </Link>
        </div>

        <div className="md:flex items-center space-x-4">
          <Link
            to="/login"
            className="text-lg bg-[#1C3988] text-white py-2 px-4 rounded-md"
          >
            Log in
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
