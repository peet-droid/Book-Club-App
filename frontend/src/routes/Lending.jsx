import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLendRequests, useApproveLendRequest, useRejectLendRequest, useReturnLendRequest } from '../hooks/useLending';
import { Library, Check, X, Clock, BookOpen, UserCircle, ArrowRight, Loader2, Info } from 'lucide-react';

export default function Lending() {
  const { currentUser } = useAuth();
  
  // Need currentUser to view dashboard
  if (!currentUser) {
    return (
      <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
        <Library className="mx-auto h-12 w-12 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Sign in required</h2>
        <p className="mt-2 text-slate-500 max-w-sm mx-auto">Please select an active user from the top navigation to view your personal Lending Dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          <Library className="text-indigo-600 h-8 w-8" />
          Lending Dashboard
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage your incoming requests, lent books, and borrowing history as <strong>{currentUser.name}</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: As Owner */}
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex justify-between items-center">
              Incoming Requests
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100 uppercase tracking-wider">Action Needed</span>
            </h2>
            <IncomingRequests ownerId={currentUser.id} />
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">Books I've Lent Out</h2>
            <OutboundLending ownerId={currentUser.id} />
          </section>
        </div>

        {/* Right Column: As Borrower */}
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">Books I'm Borrowing</h2>
            <ActiveBorrowing borrowerId={currentUser.id} />
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 text-slate-500">My Request History</h2>
            <BorrowHistory borrowerId={currentUser.id} />
          </section>
        </div>
      </div>
    </div>
  );
}

function IncomingRequests({ ownerId }) {
  const { data: requests, isLoading } = useLendRequests({ owner_id: ownerId, status: 'pending' });
  const approveMutation = useApproveLendRequest();
  const rejectMutation = useRejectLendRequest();

  if (isLoading) return <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />;
  if (!requests || requests.length === 0) return <EmptyState icon={<Check />} message="No pending incoming requests." />;

  return (
    <ul className="space-y-3">
      {requests.map(req => (
        <li key={req.id} className="bg-white border border-rose-100 shadow-sm rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link to={`/books/${req.book_id}`} className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors line-clamp-1">{req.book_title}</Link>
            <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5"><UserCircle size={14}/>Requested by: <span className="font-medium text-slate-700">{req.borrower_name}</span></p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => approveMutation.mutate(req.id)}
              disabled={approveMutation.isPending || rejectMutation.isPending}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-sm font-medium rounded-lg border border-emerald-200 transition-colors"
            >
              <Check size={16} /> Approve
            </button>
            <button 
              onClick={() => rejectMutation.mutate(req.id)}
              disabled={approveMutation.isPending || rejectMutation.isPending}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 text-sm font-medium rounded-lg border border-rose-200 transition-colors"
            >
              <X size={16} /> Reject
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function OutboundLending({ ownerId }) {
  const { data: requests, isLoading } = useLendRequests({ owner_id: ownerId, status: 'approved' });
  const returnMutation = useReturnLendRequest();

  if (isLoading) return <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />;
  if (!requests || requests.length === 0) return <EmptyState icon={<BookOpen />} message="You haven't lent out any books." />;

  return (
    <ul className="space-y-3">
      {requests.map(req => (
        <li key={req.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link to={`/books/${req.book_id}`} className="font-semibold text-slate-800 hover:text-indigo-600 transition-colors line-clamp-1">{req.book_title}</Link>
            <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5"><ArrowRight size={14} className="text-emerald-500"/> Lent to: <span className="font-medium text-slate-700">{req.borrower_name}</span></p>
          </div>
          <button 
            onClick={() => returnMutation.mutate(req.id)}
            disabled={returnMutation.isPending}
            className="w-full sm:w-auto flex flex-shrink-0 items-center justify-center px-4 py-2 border border-indigo-200 shadow-sm text-sm font-medium rounded-lg text-indigo-700 bg-white hover:bg-indigo-50 transition-colors"
          >
            Mark as Returned
          </button>
        </li>
      ))}
    </ul>
  );
}

function ActiveBorrowing({ borrowerId }) {
  const { data: requests, isLoading } = useLendRequests({ borrower_id: borrowerId, status: 'approved' });

  if (isLoading) return <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />;
  if (!requests || requests.length === 0) return <EmptyState icon={<Library />} message="You are not currently borrowing any books." />;

  return (
    <ul className="space-y-3">
      {requests.map(req => (
        <li key={req.id} className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link to={`/books/${req.book_id}`} className="font-semibold text-emerald-900 hover:text-emerald-700 transition-colors line-clamp-1">{req.book_title}</Link>
            <p className="text-sm text-emerald-700 mt-0.5 flex items-center gap-1.5"><UserCircle size={14} className="opacity-75"/> Owner: <span className="font-medium">{req.owner_name}</span></p>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 font-medium text-xs rounded-full bg-emerald-100 text-emerald-800">
            <Check size={12} /> Approved
          </span>
        </li>
      ))}
    </ul>
  );
}

function BorrowHistory({ borrowerId }) {
  const { data: requests, isLoading } = useLendRequests({ borrower_id: borrowerId });

  if (isLoading) return <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />;
  
  // Filter for pending, rejected, or returned
  const history = requests?.filter(r => r.status !== 'approved') || [];
  if (history.length === 0) return <EmptyState message="No borrowing history yet." />;

  return (
    <ul className="space-y-3">
      {history.map(req => (
        <li key={req.id} className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-80 hover:opacity-100 transition-opacity">
          <div>
            <p className="font-medium text-slate-700 line-clamp-1">{req.book_title}</p>
            <p className="text-xs text-slate-500 mt-0.5">From: {req.owner_name}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
            req.status === 'pending' ? 'bg-amber-100 text-amber-800' :
            req.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
            'bg-slate-100 text-slate-800'
          }`}>
             {req.status === 'pending' && <Clock size={12} />}
             {req.status === 'rejected' && <X size={12} />}
             {req.status === 'returned' && <Check size={12} />}
             <span className="capitalize">{req.status}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ icon = <Info />, message }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center bg-slate-50 border border-slate-100 rounded-xl border-dashed">
      <div className="text-slate-300 mb-2">{icon}</div>
      <p className="text-sm text-slate-500 font-medium">{message}</p>
    </div>
  );
}
