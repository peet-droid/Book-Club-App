import { Link } from 'react-router-dom';
import { BookOpen, Users, Book, Search, Library, UsersRound, UserCircle2, Server, ServerOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useHealthCheck } from '../hooks/useHealth';
import { useMembers } from '../hooks/useMembers';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { isSuccess, isError } = useHealthCheck();

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
          
          <div className="flex items-center gap-6">
            <ApiStatusIndicator isSuccess={isSuccess} isError={isError} />
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
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
