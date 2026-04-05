import { useState } from 'react';
import { useBooks, useCreateBook } from '../hooks/useBooks';
import { useAuth } from '../hooks/useAuth';
import BookCard from '../components/BookCard';
import BookForm from '../components/BookForm';
import { Book, Plus, X, Search, Loader2 } from 'lucide-react';

export default function BooksList() {
  const { data: books, isLoading, isError, error } = useBooks();
  const createBookMutation = useCreateBook();
  const { currentUser } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateBook = (data) => {
    createBookMutation.mutate(data, {
      onSuccess: () => {
        setIsModalOpen(false);
      }
    });
  };

  const filteredBooks = books?.filter((book) => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (book.genre && book.genre.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <Book className="text-indigo-600 h-8 w-8" />
            Library Catalog
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Discover and manage the combined library of all club members.
          </p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Add Book
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search catalog by title, author, or genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-20 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="text-lg font-medium">Loading catalog...</span>
        </div>
      )}

      {isError && (
        <div className="bg-rose-50 p-4 rounded-lg border border-rose-100 text-rose-700">
          <p className="font-semibold">Failed to load catalog.</p>
          <p className="text-sm mt-1">{error.message}</p>
        </div>
      )}

      {filteredBooks && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {filteredBooks.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
          {filteredBooks.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">
              <Book size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="font-medium text-lg text-slate-700">No books found.</p>
              <p className="text-sm">Try tweaking your search or add a new book to the catalog.</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-900">Add New Book to Library</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {!currentUser && (
                <div className="mb-4 text-sm text-amber-700 bg-amber-50 p-3 rounded-md border border-amber-200">
                  <strong>Note:</strong> You must be logged in as an active member to add books, as they must belong to someone. Please select an active user from the top right.
                </div>
              )}
              {createBookMutation.isError && (
                <div className="mb-4 bg-rose-50 p-3 rounded-md border border-rose-100 text-rose-700 text-sm">
                  {createBookMutation.error?.message || "Failed to create book."}
                </div>
              )}
              <BookForm 
                onSubmit={handleCreateBook} 
                isLoading={createBookMutation.isPending} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
