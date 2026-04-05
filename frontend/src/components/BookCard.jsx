import { Link } from 'react-router-dom';
import { Book, Library, UserCircle } from 'lucide-react';

export default function BookCard({ book }) {
  const isAvailable = book.status === 'available';

  return (
    <Link 
      to={`/books/${book.id}`}
      className="block bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col h-full"
    >
      <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 relative flex items-center justify-center border-b border-slate-100">
        <Book size={48} className="text-slate-300 group-hover:text-indigo-400 group-hover:scale-110 transition-all duration-300" strokeWidth={1} />
        <div className="absolute top-3 right-3">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border shadow-sm ${
            isAvailable 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {book.status}
          </span>
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex-grow">
          {book.genre && (
            <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-widest mb-1.5 block">
              {book.genre}
            </span>
          )}
          <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1 group-hover:text-indigo-700 transition-colors line-clamp-2">
            {book.title}
          </h3>
          <p className="text-sm font-medium text-slate-500 mb-4 line-clamp-1">
            by {book.author}
          </p>
        </div>
        
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate pr-2">
            <UserCircle size={14} className="text-slate-400 flex-shrink-0" />
            <span className="truncate">Owner: <span className="font-medium text-slate-700">{book.owner_name || 'Unknown'}</span></span>
          </div>
          <Library size={16} className="text-slate-300 flex-shrink-0" />
        </div>
      </div>
    </Link>
  );
}
