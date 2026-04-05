import { useState } from 'react';
import { useBookSearch, useWhoHasSearch } from '../hooks/useSearch';
import { Search as SearchIcon, Filter, Book, UserCircle, MapPin, Loader2, Library } from 'lucide-react';
import BookCard from '../components/BookCard';

export default function Search() {
  const [activeTab, setActiveTab] = useState('advanced'); // 'advanced' or 'who-has'

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          <SearchIcon className="text-indigo-600 h-8 w-8" />
          Discovery Server
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Find exact matches across the library, or play detective to see who currently holds a specific title.
        </p>
      </div>

      <div className="flex border-b border-slate-200 gap-6">
        <button 
          onClick={() => setActiveTab('advanced')}
          className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'advanced' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
        >
          <div className="flex items-center gap-2"><Filter size={16}/> Advanced Search</div>
        </button>
        <button 
          onClick={() => setActiveTab('who-has')}
          className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'who-has' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
        >
          <div className="flex items-center gap-2"><MapPin size={16}/> Where is this Book?</div>
        </button>
      </div>

      <div className="mt-8">
        {activeTab === 'advanced' ? <AdvancedSearch /> : <WhoHasSearch />}
      </div>
    </div>
  );
}

function AdvancedSearch() {
  const [params, setParams] = useState({ q: '', genre: '', status: '' });
  const [activeParams, setActiveParams] = useState({ q: '', genre: '', status: '' });

  const { data, isLoading, isError } = useBookSearch(activeParams);

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveParams(params);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar Filters */}
      <div className="lg:col-span-1">
        <form onSubmit={handleSearch} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 sticky top-24">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Keywords</label>
            <input 
              type="text" 
              placeholder="Title, Author, ISBN..."
              value={params.q}
              onChange={e => setParams({...params, q: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Genre</label>
            <input 
              type="text" 
              placeholder="e.g., Sci-Fi"
              value={params.genre}
              onChange={e => setParams({...params, genre: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Availability</label>
            <select 
              value={params.status}
              onChange={e => setParams({...params, status: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option value="">Any Status</option>
              <option value="available">Available Now</option>
              <option value="lent">Currently Lent</option>
            </select>
          </div>
          <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            Apply Filters
          </button>
        </form>
      </div>

      {/* Results */}
      <div className="lg:col-span-3">
        {isLoading && <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>}
        {isError && <div className="p-4 bg-rose-50 text-rose-700 rounded-lg border border-rose-100">Failed to execute search query.</div>}
        
        {data && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-slate-500">{data.count} results found.</p>
            {data.results?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.results.map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-slate-50 border border-slate-200 border-dashed rounded-xl">
                <Book className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-700">No matches</h3>
                <p className="text-sm text-slate-500">Try broadening your search terms.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function WhoHasSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState(''); // Only execute query explicitly when button clicked
  
  const { data, isLoading, isError } = useWhoHasSearch(activeSearch);

  const handleSearch = (e) => {
    e.preventDefault();
    if(searchTerm.trim().length > 2) {
      setActiveSearch(searchTerm);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-2xl border border-indigo-100 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Track down a specific book</h2>
        <p className="text-sm text-slate-600 mb-6">Enter a precise book title to find out exactly who holds it right now across the entire community.</p>
        
        <form onSubmit={handleSearch} className="flex gap-4">
          <input 
            type="text" 
            placeholder="Enter partial or full book title (min 3 chars)..."
            value={searchTerm}
            required
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base shadow-sm"
          />
          <button 
            type="submit" 
            className="px-6 py-3 bg-indigo-900 text-white font-medium rounded-xl hover:bg-slate-900 transition-colors flex items-center justify-center shadow-md whitespace-nowrap gap-2"
          >
            <SearchIcon size={18} /> Deep Scan
          </button>
        </form>
      </div>

      {isLoading && <div className="flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>}
      
      {data?.results && (
        <div className="space-y-4">
          {data.results.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500">No exact matches found anywhere in the network.</span>
            </div>
          ) : (
            data.results.map(book => (
              <div key={book.id} className="bg-white border flex flex-col md:flex-row border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-slate-100 p-6 flex flex-col justify-center border-r border-slate-200 md:w-64">
                   <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1">{book.title}</h3>
                   <span className="text-sm text-slate-500">{book.author}</span>
                </div>
                
                <div className="p-6 flex-1 flex flex-col sm:flex-row gap-6 sm:items-center">
                   <div className="flex-1 bg-emerald-50 rounded-lg p-4 border border-emerald-100 relative">
                     <span className="absolute -top-3 left-4 bg-white text-xs font-bold px-2 py-0.5 rounded-full border border-slate-200 text-slate-500">OWNER</span>
                     <div className="flex items-center gap-3">
                        <UserCircle className="w-10 h-10 text-emerald-600" strokeWidth={1} />
                        <div>
                          <p className="font-semibold text-slate-900">{book.owner_name}</p>
                          <p className="text-xs text-slate-500">Legal Custodian</p>
                        </div>
                     </div>
                   </div>

                   <div className="hidden sm:block text-slate-300">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                   </div>

                   <div className={`flex-1 rounded-lg p-4 border relative ${book.currently_with ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
                     <span className="absolute -top-3 left-4 bg-white text-xs font-bold px-2 py-0.5 rounded-full border border-slate-200 text-slate-500">CURRENTLY AT</span>
                     {book.currently_with ? (
                        <div className="flex items-center gap-3">
                          <UserCircle className="w-10 h-10 text-indigo-600" strokeWidth={1} />
                          <div>
                            <p className="font-semibold text-slate-900">{book.currently_with.name}</p>
                            <p className="text-xs text-slate-500">Since {new Date(book.currently_with.since).toLocaleDateString()}</p>
                          </div>
                        </div>
                     ) : (
                        <div className="flex items-center gap-3">
                          <Library className="w-10 h-10 text-slate-400" strokeWidth={1} />
                          <div>
                            <p className="font-semibold text-slate-600">With Owner</p>
                            <p className="text-xs text-emerald-600 font-medium">Available to Borrow</p>
                          </div>
                        </div>
                     )}
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
