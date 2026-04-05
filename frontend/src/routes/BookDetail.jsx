import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBook, useUpdateBook, useDeleteBook } from '../hooks/useBooks';
import { useAuth } from '../hooks/useAuth';
import { useCreateLendRequest, useCreateTransfer } from '../hooks/useLending';
import BookForm from '../components/BookForm';
import { Book, PenTool, Hash, Library, ArrowLeft, Edit2, Trash2, Loader2, X, User, ArrowRightLeft, Send } from 'lucide-react';

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const { data: book, isLoading, isError } = useBook(id);
  const updateMutation = useUpdateBook();
  const deleteMutation = useDeleteBook();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferUserId, setTransferUserId] = useState('');

  const createLendRequest = useCreateLendRequest();
  const createTransfer = useCreateTransfer();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="text-lg font-medium">Loading book details...</span>
      </div>
    );
  }

  if (isError || !book) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">Book not found</h2>
        <button onClick={() => navigate('/books')} className="mt-4 text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-2 mx-auto">
          <ArrowLeft size={16} /> Back to Catalog
        </button>
      </div>
    );
  }

  const handleUpdate = (data) => {
    updateMutation.mutate({ id, data }, {
      onSuccess: () => setIsEditing(false)
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => navigate('/books')
    });
  };

  const handleRequestBorrow = () => {
    if (!currentUser) return;
    createLendRequest.mutate({
      book_id: parseInt(id),
      borrower_id: currentUser.id
    }, {
      onSuccess: () => {
        alert('Request sent successfully! The owner will review it.');
      },
      onError: (err) => alert(err.message)
    });
  };

  const handleTransfer = () => {
    if (!transferUserId) return;
    createTransfer.mutate({
      book_id: parseInt(id),
      from_member_id: currentUser?.id,
      to_member_id: parseInt(transferUserId)
    }, {
      onSuccess: () => {
        setIsTransferOpen(false);
        alert('Ownership transferred successfully.');
      },
      onError: (err) => alert(err.message)
    });
  };

  // Only the owner can edit or delete their book
  const isOwner = currentUser?.id === book.owner_id;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/books')} 
        className="text-slate-500 hover:text-indigo-600 flex items-center gap-2 group transition-colors w-fit"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
        Back to Catalog
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Visual/Cover Mockup */}
        <div className="md:w-1/3 bg-slate-100 p-8 flex flex-col items-center justify-center border-r border-slate-200 relative">
          <div className="absolute top-4 left-4">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-sm ${
              book.status === 'available' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {book.status}
            </span>
          </div>
          <div className="w-40 h-56 bg-slate-200 rounded-lg shadow-md flex items-center justify-center mb-6 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
            <Book size={64} className="text-slate-400" strokeWidth={1} />
          </div>
          {book.genre && (
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
              {book.genre}
            </span>
          )}
        </div>

        {/* Right Side: Details */}
        <div className="md:w-2/3 p-6 md:p-8 flex flex-col">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-2">{book.title}</h1>
            <p className="text-lg text-slate-600 flex items-center gap-2 mb-8">
              <PenTool size={18} className="text-slate-400" />
              {book.author}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="flex flex-col gap-1 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-medium flex items-center gap-1.5"><User size={14}/> Listed By / Owner</span>
                <span className="font-semibold text-slate-800 text-base">{book.owner_name}</span>
              </div>
              <div className="flex flex-col gap-1 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-medium flex items-center gap-1.5"><Hash size={14}/> ISBN Reference</span>
                <span className="font-semibold text-slate-800 text-base">{book.isbn || 'Not provided'}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 pb-2">
            {!currentUser ? (
              <p className="text-sm text-slate-500 italic">Sign in via the top right menu to request or manage this book.</p>
            ) : isOwner ? (
              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors border border-slate-200 box-border"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button 
                  onClick={() => setIsTransferOpen(true)}
                  disabled={book.status !== 'available'}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg transition-colors border border-indigo-200 box-border disabled:opacity-50"
                  title={book.status !== 'available' ? "Book must be returned before transferring" : ""}
                >
                  <ArrowRightLeft size={16} /> Transfer
                </button>
                <button 
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium rounded-lg transition-colors border border-rose-200 box-border"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={handleRequestBorrow}
                  disabled={book.status !== 'available' || createLendRequest.isPending}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {createLendRequest.isPending ? <Loader2 size={18} className="animate-spin" /> : <Library size={18} />}
                  {book.status === 'available' ? 'Request to Borrow' : 'Currently Lent Out'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-900">Edit Book Details</h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {updateMutation.isError && (
                <div className="mb-4 bg-rose-50 p-3 rounded-md border border-rose-100 text-rose-700 text-sm">
                  {updateMutation.error?.message || "Update failed."}
                </div>
              )}
              <BookForm 
                initialData={book}
                onSubmit={handleUpdate} 
                isLoading={updateMutation.isPending} 
              />
            </div>
          </div>
        </div>
      )}

      {isTransferOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2"><ArrowRightLeft size={18} className="text-indigo-600" /> Transfer Ownership</h3>
              <button onClick={() => setIsTransferOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 text-sm text-slate-600">
              <p className="mb-4">Permanently hand over this book to another verified member. This action cannot be reversed.</p>
              
              <label className="block text-sm font-medium text-slate-700 mb-1">New Owner ID</label>
              <input
                type="number"
                value={transferUserId}
                onChange={e => setTransferUserId(e.target.value)}
                placeholder="Member ID (e.g., 2)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 mb-6"
              />

              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setIsTransferOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleTransfer}
                  disabled={!transferUserId || createTransfer.isPending}
                  className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:bg-indigo-400 gap-2"
                >
                  {createTransfer.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={16} />} 
                  Transfer Book
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 mb-4">
              <Trash2 className="h-6 w-6 text-rose-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Remove Book?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to permanently remove "{book.title}" from the catalog? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                disabled={deleteMutation.isPending}
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg text-white bg-rose-600 hover:bg-rose-700 focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors flex items-center justify-center disabled:bg-rose-400"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
