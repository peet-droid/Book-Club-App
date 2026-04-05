import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Users, Book, Search, Library, UsersRound, UserCircle2, Server, ServerOff, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useHealthCheck } from '../hooks/useHealth';
import { useMembers } from '../hooks/useMembers';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { isSuccess, isError } = useHealthCheck();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              <span className="font-bold text-xl text-slate-900 tracking-tight">BookClub</span>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <NavLink to="/books" icon={<Book />} label="Books" />
              <NavLink to="/members" icon={<Users />} label="Members" />
              <NavLink to="/lending" icon={<Library />} label="Lending" />
              <NavLink to="/search" icon={<Search />} label="Search" />
              <NavLink to="/groups" icon={<UsersRound />} label="Groups" />
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6">
            <ApiStatusIndicator isSuccess={isSuccess} isError={isError} />
            <UserMenu />
            
            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white shadow-lg absolute w-full left-0 z-40">
          <div className="pt-2 pb-3 space-y-1">
            <MobileNavLink to="/books" icon={<Book className="w-5 h-5 flex-shrink-0" />} label="Books" />
            <MobileNavLink to="/members" icon={<Users className="w-5 h-5 flex-shrink-0" />} label="Members" />
            <MobileNavLink to="/lending" icon={<Library className="w-5 h-5 flex-shrink-0" />} label="Lending" />
            <MobileNavLink to="/search" icon={<Search className="w-5 h-5 flex-shrink-0" />} label="Search" />
            <MobileNavLink to="/groups" icon={<UsersRound className="w-5 h-5 flex-shrink-0" />} label="Groups" />
          </div>
        </div>
      )}
    </nav>
  );
}

function MobileNavLink({ to, icon, label }) {
  const isActive = location.pathname.startsWith(to);
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 pl-4 pr-3 py-3 border-l-4 text-base font-medium transition-colors ${
        isActive
          ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
          : 'border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800'
      }`}
    >
      <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>{icon}</span>
      {label}
    </Link>
  );
}

function NavLink({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-slate-500 hover:border-indigo-500 hover:text-slate-900 gap-2 transition-colors duration-200"
    >
      <span className="w-4 h-4">{icon}</span>
      {label}
    </Link>
  );
}

function ApiStatusIndicator({ isSuccess, isError }) {
  if (isError) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-rose-500 bg-rose-50 px-2 py-1 rounded-full border border-rose-100" title="API Disconnected">
        <ServerOff className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Offline</span>
      </div>
    );
  }
  
  if (isSuccess) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100" title="API Connected">
        <Server className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Online</span>
      </div>
    );
  }
  
  return null;
}

function UserMenu() {
  const { currentUser, setCurrentUser, logout } = useAuth();
  const { data: members, isLoading, isError } = useMembers();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex items-center gap-3" ref={dropdownRef}>
      <div 
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => setIsOpen(!isOpen)}
        title="Simulate Login"
      >
        {currentUser ? (
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">
              {currentUser.name}
            </span>
            <span className="text-xs text-slate-500 group-hover:text-amber-600 transition-colors" onClick={(e) => { e.stopPropagation(); logout(); setIsOpen(false); }}>
              Sign out
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-slate-500 italic group-hover:text-indigo-600">No User Active</span>
            <span className="text-xs text-indigo-600 font-medium">Select User</span>
          </div>
        )}
        <div className="relative">
          <UserCircle2 className="w-9 h-9 text-slate-300 group-hover:text-indigo-400 transition-colors" strokeWidth={1.5} />
          {currentUser && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Simulate Auth As:</h3>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {isLoading && <div className="px-4 py-3 text-sm text-slate-500">Loading members...</div>}
            {isError && <div className="px-4 py-3 text-sm text-rose-500">Failed to load members</div>}
            {members && members.length === 0 && (
              <div className="px-4 py-3 text-sm text-slate-500">No members exist yet.</div>
            )}
            {members && members.map(member => (
              <button
                key={member.id}
                onClick={() => {
                  setCurrentUser(member);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-slate-50 transition-colors ${currentUser?.id === member.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-700'}`}
              >
                <div className="flex flex-col w-full truncate">
                  <span className="truncate">{member.name}</span>
                  <span className="text-xs text-slate-400 truncate">{member.email}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
