import { Link } from 'react-router-dom';
import { BookOpen, Users, Book, Search, Library, UsersRound } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-slate-200">
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
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-slate-500 hover:border-indigo-300 hover:text-slate-700 gap-2 transition-colors duration-200"
    >
      <span className="w-4 h-4">{icon}</span>
      {label}
    </Link>
  );
}
