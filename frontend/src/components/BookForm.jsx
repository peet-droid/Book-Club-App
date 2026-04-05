import { useState, useEffect } from 'react';
import { Book, PenTool, Hash, Library, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function BookForm({ initialData, onSubmit, isLoading }) {
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    genre: '',
    owner_id: currentUser?.id || '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        author: initialData.author || '',
        isbn: initialData.isbn || '',
        genre: initialData.genre || '',
        owner_id: initialData.owner_id || currentUser?.id || '',
      });
    } else if (currentUser) {
      setFormData(prev => ({ ...prev, owner_id: currentUser.id }));
    }
  }, [initialData, currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Use the explicit form ID, falling back to string coercion or null
    const submitData = { ...formData, owner_id: Number(formData.owner_id) };
    onSubmit(submitData);
  };

  if (!currentUser && !initialData) {
    return (
      <div className="bg-amber-50 p-4 rounded-lg flex items-center gap-3 text-amber-800 border border-amber-200">
        <Library className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium">Please select an Active User from the top navigation to add a book to their library.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700">Book Title</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Book className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            name="title"
            id="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2 border"
            placeholder="Dune"
          />
        </div>
      </div>

      <div>
        <label htmlFor="author" className="block text-sm font-medium text-slate-700">Author</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <PenTool className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            name="author"
            id="author"
            required
            value={formData.author}
            onChange={handleChange}
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2 border"
            placeholder="Frank Herbert"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="genre" className="block text-sm font-medium text-slate-700">Genre (Optional)</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Library className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              name="genre"
              id="genre"
              value={formData.genre}
              onChange={handleChange}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2 border"
              placeholder="Science Fiction"
            />
          </div>
        </div>
        <div>
          <label htmlFor="isbn" className="block text-sm font-medium text-slate-700">ISBN (Optional)</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Hash className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              name="isbn"
              id="isbn"
              value={formData.isbn}
              onChange={handleChange}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2 border"
              placeholder="978-0-..."
            />
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-colors"
        >
          {isLoading && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
          {initialData ? 'Update Book' : 'Add Book'}
        </button>
      </div>
    </form>
  );
}
